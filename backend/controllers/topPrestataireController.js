const supabase = require('../config/supabase')

const SEUIL_NOTE = 4.5
const SEUIL_AVIS = 5
const SEUIL_CONFIRMATION = 80

const calculerTopPrestataires = async () => {
  try {
    const { data: prestataires } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'prestataire')

    const resultats = {}

    for (const prestataire of prestataires) {
      const { data: services } = await supabase
        .from('services')
        .select('id')
        .eq('prestataire_id', prestataire.id)

      const serviceIds = services.map(s => s.id)

      if (serviceIds.length === 0) {
        resultats[prestataire.id] = false
        continue
      }

      const { data: avis } = await supabase
        .from('reviews')
        .select('note')
        .in('service_id', serviceIds)

      const { data: bookings } = await supabase
        .from('bookings')
        .select('statut')
        .in('service_id', serviceIds)

      const moyenne = avis.length > 0
        ? avis.reduce((acc, a) => acc + a.note, 0) / avis.length
        : 0

      const tauxConfirmation = bookings.length > 0
        ? (bookings.filter(b => b.statut === 'confirme' || b.statut === 'termine').length / bookings.length) * 100
        : 0

      const estTop = moyenne >= SEUIL_NOTE && avis.length >= SEUIL_AVIS && tauxConfirmation >= SEUIL_CONFIRMATION

      resultats[prestataire.id] = estTop
    }

    return resultats
  } catch (error) {
    console.error('Erreur calcul top prestataires:', error.message)
    return {}
  }
}

const getTopPrestataires = async (req, res) => {
  try {
    const resultats = await calculerTopPrestataires()
    res.json({ topPrestataires: resultats })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { calculerTopPrestataires, getTopPrestataires }