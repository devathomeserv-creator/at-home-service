const supabase = require('../config/supabase')

const getMesClients = async (req, res) => {
  try {
    const prestataire_id = req.user.id

    const { data: services } = await supabase
      .from('services')
      .select('id')
      .eq('prestataire_id', prestataire_id)

    const serviceIds = services.map(s => s.id)

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, users(*), services(titre)')
      .in('service_id', serviceIds)
      .eq('consentement_donnees', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    const clientsMap = {}
    bookings.forEach(b => {
      const clientId = b.client_id
      if (!clientsMap[clientId]) {
        clientsMap[clientId] = {
          id: b.users.id,
          nom: b.users.nom,
          prenom: b.users.prenom,
          email: b.users.email,
          telephone: b.users.telephone,
          totalReservations: 0,
          derniereReservation: null,
          services: []
        }
      }
      clientsMap[clientId].totalReservations += 1
      if (!clientsMap[clientId].derniereReservation || new Date(b.date_rdv) > new Date(clientsMap[clientId].derniereReservation)) {
        clientsMap[clientId].derniereReservation = b.date_rdv
      }
      if (!clientsMap[clientId].services.includes(b.services.titre)) {
        clientsMap[clientId].services.push(b.services.titre)
      }
    })

    const clients = Object.values(clientsMap).sort((a, b) => new Date(b.derniereReservation) - new Date(a.derniereReservation))

    res.json({ clients })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { getMesClients }