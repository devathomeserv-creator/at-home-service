const supabase = require('../config/supabase')

const laisserAvis = async (req, res) => {
  try {
    const { service_id, booking_id, note, commentaire } = req.body
    const client_id = req.user.id

    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .eq('client_id', client_id)
      .eq('statut', 'termine')
      .single()

    if (!booking) {
      return res.status(400).json({ message: 'Réservation introuvable ou non terminée' })
    }

    const { data: dejaNote } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .single()

    if (dejaNote) {
      return res.status(400).json({ message: 'Vous avez déjà noté cette réservation' })
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([{ client_id, service_id, booking_id, note, commentaire }])
      .select()

    if (error) throw error

    res.status(201).json({ message: 'Avis publié avec succès !', avis: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getAvisService = async (req, res) => {
  try {
    const { service_id } = req.params

    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(prenom, nom)')
      .eq('service_id', service_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const moyenne = data.length > 0
      ? (data.reduce((acc, r) => acc + r.note, 0) / data.length).toFixed(1)
      : 0

    res.json({ avis: data, moyenne, total: data.length })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getAvisPrestataire = async (req, res) => {
  try {
    const prestataire_id = req.user.id

    const { data: services } = await supabase
      .from('services')
      .select('id')
      .eq('prestataire_id', prestataire_id)

    const serviceIds = services.map(s => s.id)

    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(prenom, nom), services(titre)')
      .in('service_id', serviceIds)
      .order('created_at', { ascending: false })

    if (error) throw error

    const moyenne = data.length > 0
      ? (data.reduce((acc, r) => acc + r.note, 0) / data.length).toFixed(1)
      : 0

    res.json({ avis: data, moyenne, total: data.length })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { laisserAvis, getAvisService, getAvisPrestataire }