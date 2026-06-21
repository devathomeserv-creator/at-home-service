const supabase = require('../config/supabase')
const { envoyerEmailReservation, envoyerEmailConfirmation } = require('../config/email')
const { rembourserPaiement } = require('./stripeController')

const creerReservation = async (req, res) => {
  try {
    const { service_id, date_rdv, adresse_intervention, note, payment_intent_id } = req.body
    const client_id = req.user.id

    const { data: service } = await supabase
      .from('services')
      .select('*, users(*)')
      .eq('id', service_id)
      .single()

    if (!service) {
      return res.status(404).json({ message: 'Service introuvable' })
    }

    if (!service.disponible) {
      return res.status(400).json({ message: 'Service non disponible' })
    }

    const { data: client } = await supabase
      .from('users')
      .select('*')
      .eq('id', client_id)
      .single()

    const statut = service.users.confirmation_auto ? 'confirme' : 'en_attente'

    const { data, error } = await supabase
      .from('bookings')
      .insert([{ client_id, service_id, date_rdv, adresse_intervention, note, statut, payment_intent_id }])
      .select()

    if (error) throw error

    await envoyerEmailReservation(
      client.email,
      service.users.email,
      {
        service: service.titre,
        clientNom: `${client.prenom} ${client.nom}`,
        date: new Date(date_rdv).toLocaleString('fr-FR'),
        adresse: adresse_intervention
      }
    )

    if (statut === 'confirme') {
      await envoyerEmailConfirmation(
        client.email,
        {
          service: service.titre,
          date: new Date(date_rdv).toLocaleString('fr-FR'),
          adresse: adresse_intervention
        }
      )
    }

    res.status(201).json({ message: 'Réservation créée avec succès', reservation: data[0], statut })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const mesReservationsClient = async (req, res) => {
  try {
    const client_id = req.user.id

    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(*)')
      .eq('client_id', client_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ reservations: data })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const mesReservationsPrestataire = async (req, res) => {
  try {
    const prestataire_id = req.user.id

    const { data: services } = await supabase
      .from('services')
      .select('id')
      .eq('prestataire_id', prestataire_id)

    const serviceIds = services.map(s => s.id)

    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(*), users(*)')
      .in('service_id', serviceIds)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ reservations: data })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const modifierStatut = async (req, res) => {
  try {
    const { id } = req.params
    const { statut } = req.body

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, services(*), users(*)')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('bookings')
      .update({ statut })
      .eq('id', id)
      .select()

    if (error) throw error

    if (statut === 'confirme' && booking) {
      await envoyerEmailConfirmation(
        booking.users.email,
        {
          service: booking.services.titre,
          date: new Date(booking.date_rdv).toLocaleString('fr-FR'),
          adresse: booking.adresse_intervention
        }
      )
    }

    res.json({ message: 'Statut mis à jour', reservation: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const annulerReservation = async (req, res) => {
  try {
    const { id } = req.params
    const client_id = req.user.id

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, services(*), users(*)')
      .eq('id', id)
      .eq('client_id', client_id)
      .single()

    if (!booking) {
      return res.status(404).json({ message: 'Réservation introuvable' })
    }

    if (booking.statut === 'termine' || booking.statut === 'annule') {
      return res.status(400).json({ message: 'Cette réservation ne peut pas être annulée' })
    }

    const maintenant = new Date()
    const dateRdv = new Date(booking.date_rdv)
    const heuresAvant = (dateRdv - maintenant) / (1000 * 60 * 60)
    const eligibleRemboursement = heuresAvant >= 24

    let messageRemboursement = ''
    let rembourse = false

    if (eligibleRemboursement && booking.payment_intent_id && !booking.rembourse) {
      const resultat = await rembourserPaiement(booking.payment_intent_id)
      if (resultat.success) {
        rembourse = true
        messageRemboursement = ' Vous avez été remboursé automatiquement.'
      } else {
        messageRemboursement = ' Le remboursement automatique a échoué, contactez le support.'
      }
    } else if (!eligibleRemboursement) {
      messageRemboursement = ' Aucun remboursement automatique (annulation à moins de 24h du rendez-vous).'
    }

    const { error } = await supabase
      .from('bookings')
      .update({ statut: 'annule', rembourse })
      .eq('id', id)

    if (error) throw error

    res.json({ message: `Réservation annulée avec succès.${messageRemboursement}`, rembourse })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const modifierReservation = async (req, res) => {
  try {
    const { id } = req.params
    const { date_rdv, adresse_intervention } = req.body
    const client_id = req.user.id

    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .eq('client_id', client_id)
      .single()

    if (!booking) {
      return res.status(404).json({ message: 'Réservation introuvable' })
    }

    if (booking.statut === 'termine' || booking.statut === 'annule') {
      return res.status(400).json({ message: 'Cette réservation ne peut pas être modifiée' })
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ date_rdv, adresse_intervention, statut: 'en_attente' })
      .eq('id', id)
      .select()

    if (error) throw error

    res.json({ message: 'Réservation modifiée avec succès', reservation: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { creerReservation, mesReservationsClient, mesReservationsPrestataire, modifierStatut, annulerReservation, modifierReservation }