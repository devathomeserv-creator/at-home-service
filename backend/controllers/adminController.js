const supabase = require('../config/supabase')

const TAUX_COMMISSION = 0.10

const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ users: data })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getReservations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(*), users(*)')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ reservations: data })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const supprimerUser = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Utilisateur supprimé avec succès' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getRevenusPlateforme = async (req, res) => {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, services(prix), created_at')

    if (error) throw error

    const calculerCommission = (b) => {
      if (b.commission) return b.commission
      const prix = b.services?.prix || 0
      return Math.round((prix * TAUX_COMMISSION) * 100) / 100
    }

    const reservationsTerminees = bookings.filter(b => b.statut === 'termine')
    const reservationsValides = bookings.filter(b => ['confirme', 'termine'].includes(b.statut))

    const maintenant = new Date()
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
    const reservationsMois = bookings.filter(b => new Date(b.created_at) >= debutMois)

    const commissionTotale = reservationsTerminees.reduce((acc, b) => acc + calculerCommission(b), 0)
    const commissionMois = reservationsMois
      .filter(b => ['confirme', 'termine'].includes(b.statut))
      .reduce((acc, b) => acc + calculerCommission(b), 0)

    const volumeTotal = reservationsTerminees.reduce((acc, b) => acc + (b.services?.prix || 0), 0)

    const revenusParMois = {}
    reservationsTerminees.forEach(b => {
      const date = new Date(b.created_at)
      const cle = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      revenusParMois[cle] = (revenusParMois[cle] || 0) + calculerCommission(b)
    })

    const evolutionMensuelle = Object.entries(revenusParMois)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([mois, montant]) => ({ mois, montant: Math.round(montant * 100) / 100 }))

    res.json({
      tauxCommission: TAUX_COMMISSION * 100,
      commissionTotale: Math.round(commissionTotale * 100) / 100,
      commissionMois: Math.round(commissionMois * 100) / 100,
      volumeTotal: Math.round(volumeTotal * 100) / 100,
      totalReservationsValides: reservationsValides.length,
      totalReservationsTerminees: reservationsTerminees.length,
      evolutionMensuelle
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { getUsers, getReservations, supprimerUser, getRevenusPlateforme }