const supabase = require('../config/supabase')
const { envoyerEmailNouveauMessage } = require('../config/email')

const envoyerMessage = async (req, res) => {
  try {
    const { booking_id, contenu } = req.body
    const expediteur_id = req.user.id

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, services(*)')
      .eq('id', booking_id)
      .single()

    if (!booking) {
      return res.status(404).json({ message: 'Réservation introuvable' })
    }

    let destinataire_id
    if (booking.client_id === expediteur_id) {
      destinataire_id = booking.services.prestataire_id
    } else if (booking.services.prestataire_id === expediteur_id) {
      destinataire_id = booking.client_id
    } else {
      return res.status(403).json({ message: 'Accès non autorisé' })
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([{ booking_id, expediteur_id, destinataire_id, contenu }])
      .select()

    if (error) throw error

    const { data: expediteur } = await supabase
      .from('users')
      .select('prenom, nom')
      .eq('id', expediteur_id)
      .single()

    const { data: destinataire } = await supabase
      .from('users')
      .select('email')
      .eq('id', destinataire_id)
      .single()

    if (destinataire?.email) {
      await envoyerEmailNouveauMessage(destinataire.email, {
        expediteurNom: `${expediteur.prenom} ${expediteur.nom}`,
        contenu
      })
    }

    res.status(201).json({ message: 'Message envoyé', data: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getMessages = async (req, res) => {
  try {
    const { booking_id } = req.params
    const user_id = req.user.id

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, services(*)')
      .eq('id', booking_id)
      .single()

    if (!booking) {
      return res.status(404).json({ message: 'Réservation introuvable' })
    }

    if (booking.client_id !== user_id && booking.services.prestataire_id !== user_id) {
      return res.status(403).json({ message: 'Accès non autorisé' })
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*, expediteur:expediteur_id(prenom, nom)')
      .eq('booking_id', booking_id)
      .order('created_at', { ascending: true })

    if (error) throw error

    await supabase
      .from('messages')
      .update({ lu: true })
      .eq('booking_id', booking_id)
      .eq('destinataire_id', user_id)

    res.json({ messages: data })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getMessagesNonLus = async (req, res) => {
  try {
    const user_id = req.user.id

    const { data, error } = await supabase
      .from('messages')
      .select('booking_id')
      .eq('destinataire_id', user_id)
      .eq('lu', false)

    if (error) throw error

    const compteurParBooking = {}
    data.forEach(m => {
      compteurParBooking[m.booking_id] = (compteurParBooking[m.booking_id] || 0) + 1
    })

    res.json({ nonLus: compteurParBooking, total: data.length })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getMesConversations = async (req, res) => {
  try {
    const user_id = req.user.id

    const { data: messages, error } = await supabase
      .from('messages')
      .select('booking_id, created_at')
      .or(`expediteur_id.eq.${user_id},destinataire_id.eq.${user_id}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    const bookingIds = [...new Set(messages.map(m => m.booking_id))]

    if (bookingIds.length === 0) {
      return res.json({ conversations: [] })
    }

    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, services(*), users(*)')
      .in('id', bookingIds)

    const { data: nonLusData } = await supabase
      .from('messages')
      .select('booking_id')
      .eq('destinataire_id', user_id)
      .eq('lu', false)

    const nonLusParBooking = {}
    nonLusData.forEach(m => {
      nonLusParBooking[m.booking_id] = (nonLusParBooking[m.booking_id] || 0) + 1
    })

    const conversations = bookings.map(b => ({
      ...b,
      nonLus: nonLusParBooking[b.id] || 0
    }))

    res.json({ conversations })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { envoyerMessage, getMessages, getMessagesNonLus, getMesConversations }