const supabase = require('../config/supabase')

const TAUX_COMMISSION = 0.10

const getStatsPrestataire = async (req, res) => {
  try {
    const prestataire_id = req.user.id

    const { data: services } = await supabase
      .from('services')
      .select('id, titre, prix')
      .eq('prestataire_id', prestataire_id)

    const serviceIds = services.map(s => s.id)

    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, services(titre, prix)')
      .in('service_id', serviceIds)

    const { data: avis } = await supabase
      .from('reviews')
      .select('note')
      .in('service_id', serviceIds)

    const maintenant = new Date()
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)

    const reservationsMois = bookings.filter(b => new Date(b.created_at) >= debutMois)
    const reservationsTerminees = bookings.filter(b => b.statut === 'termine')

    const calculerMontantNet = (b) => {
      if (b.montant_net) return b.montant_net
      const prix = b.services?.prix || 0
      return Math.round((prix * (1 - TAUX_COMMISSION)) * 100) / 100
    }

    const revenusMois = reservationsMois
      .filter(b => b.statut === 'termine' || b.statut === 'confirme')
      .reduce((acc, b) => acc + calculerMontantNet(b), 0)

    const revenusTotal = reservationsTerminees
      .reduce((acc, b) => acc + calculerMontantNet(b), 0)

    const commissionTotale = reservationsTerminees
      .reduce((acc, b) => acc + (b.commission || Math.round((b.services?.prix || 0) * TAUX_COMMISSION * 100) / 100), 0)

    const compteurServices = {}
    bookings.forEach(b => {
      const titre = b.services?.titre
      if (titre) {
        compteurServices[titre] = (compteurServices[titre] || 0) + 1
      }
    })

    const servicePopulaire = Object.entries(compteurServices)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([titre, count]) => ({ titre, count }))

    const moyenneAvis = avis.length > 0
      ? (avis.reduce((acc, a) => acc + a.note, 0) / avis.length).toFixed(1)
      : 0

    const tauxConfirmation = bookings.length > 0
      ? Math.round((bookings.filter(b => b.statut === 'confirme' || b.statut === 'termine').length / bookings.length) * 100)
      : 0

    res.json({
      revenusMois: Math.round(revenusMois * 100) / 100,
      revenusTotal: Math.round(revenusTotal * 100) / 100,
      commissionTotale: Math.round(commissionTotale * 100) / 100,
      tauxCommission: TAUX_COMMISSION * 100,
      totalReservations: bookings.length,
      reservationsMois: reservationsMois.length,
      reservationsTerminees: reservationsTerminees.length,
      moyenneAvis,
      totalAvis: avis.length,
      tauxConfirmation,
      servicePopulaire,
      totalServices: services.length
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { getStatsPrestataire }