const fetch = require('node-fetch')
const supabase = require('../config/supabase')

const DAILY_API_KEY = process.env.DAILY_API_KEY
const DAILY_API_URL = 'https://api.daily.co/v1'

const creerSalleVideo = async (req, res) => {
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

    const nomSalle = `aths-${booking_id.slice(0, 16)}`

    const checkResponse = await fetch(`${DAILY_API_URL}/rooms/${nomSalle}`, {
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`
      }
    })

    let salle
    if (checkResponse.ok) {
      salle = await checkResponse.json()
    } else {
      const createResponse = await fetch(`${DAILY_API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DAILY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: nomSalle,
          privacy: 'private',
          properties: {
            exp: Math.floor(Date.now() / 1000) + 3600,
            max_participants: 2,
            enable_chat: false,
            enable_screenshare: false,
            start_video_off: false,
            start_audio_off: false
          }
        })
      })
      salle = await createResponse.json()
    }

    const tokenResponse = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          room_name: nomSalle,
          exp: Math.floor(Date.now() / 1000) + 3600,
          user_name: `${req.user.prenom || ''} ${req.user.nom || ''}`.trim()
        }
      })
    })

    const tokenData = await tokenResponse.json()

    res.json({
      url: salle.url,
      token: tokenData.token,
      room_name: nomSalle
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { creerSalleVideo }