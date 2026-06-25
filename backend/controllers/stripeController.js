const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const supabase = require('../config/supabase')

const creerPaiement = async (req, res) => {
  try {
    const { service_id, date_rdv, adresse_intervention, consentement_donnees, nom_beneficiaire, telephone_beneficiaire } = req.body
    const client_id = req.user.id

    const { data: service } = await supabase
      .from('services')
      .select('*')
      .eq('id', service_id)
      .single()

    if (!service) {
      return res.status(404).json({ message: 'Service introuvable' })
    }

    const aAcompte = service.pourcentage_acompte > 0 && service.pourcentage_acompte < 100
    const montantAPayer = aAcompte
      ? Math.round(service.prix * (service.pourcentage_acompte / 100) * 100) / 100
      : service.prix

    const beneficiaireParams = nom_beneficiaire
      ? `&nom_beneficiaire=${encodeURIComponent(nom_beneficiaire)}&telephone_beneficiaire=${encodeURIComponent(telephone_beneficiaire || '')}`
      : ''

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: aAcompte ? `${service.titre} (acompte ${service.pourcentage_acompte}%)` : service.titre,
              description: service.description || 'Service à domicile — At Home Service',
            },
            unit_amount: Math.round(montantAPayer * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://at-home-service.vercel.app/client?paiement=succes&service_id=${service_id}&date_rdv=${date_rdv}&adresse=${encodeURIComponent(adresse_intervention)}&consentement=${consentement_donnees ? 'true' : 'false'}${beneficiaireParams}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://at-home-service.vercel.app/client?paiement=annule`,
      metadata: {
        client_id,
        service_id,
        date_rdv,
        adresse_intervention
      }
    })

    res.json({ url: session.url })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const recupererPaiementIntent = async (req, res) => {
  try {
    const { session_id } = req.params

    const session = await stripe.checkout.sessions.retrieve(session_id)

    res.json({ payment_intent_id: session.payment_intent })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const rembourserPaiement = async (payment_intent_id) => {
  try {
    if (!payment_intent_id) return { success: false, message: 'Pas de paiement à rembourser' }

    await stripe.refunds.create({
      payment_intent: payment_intent_id
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur remboursement Stripe:', error.message)
    return { success: false, message: error.message }
  }
}

const creerPaiementSolde = async (req, res) => {
  try {
    const { booking_id } = req.params
    const prestataire_id = req.user.id

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, services(*)')
      .eq('id', booking_id)
      .single()

    if (!booking) {
      return res.status(404).json({ message: 'Réservation introuvable' })
    }

    if (booking.services.prestataire_id !== prestataire_id) {
      return res.status(403).json({ message: 'Accès non autorisé' })
    }

    if (!booking.montant_acompte) {
      return res.status(400).json({ message: 'Cette réservation ne comporte pas d\'acompte' })
    }

    if (booking.solde_paye) {
      return res.status(400).json({ message: 'Le solde a déjà été payé' })
    }

    const montantSolde = Math.round((booking.services.prix - booking.montant_acompte) * 100) / 100

    const { data: client } = await supabase
      .from('users')
      .select('email')
      .eq('id', booking.client_id)
      .single()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Solde — ${booking.services.titre}`,
              description: 'Solde restant à payer pour votre prestation At Home Service',
            },
            unit_amount: Math.round(montantSolde * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: client.email,
      success_url: `https://at-home-service.vercel.app/client?solde=succes&booking_id=${booking_id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://at-home-service.vercel.app/client?solde=annule`,
      metadata: {
        booking_id,
        type: 'solde'
      }
    })

    res.json({ url: session.url, montant: montantSolde })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const confirmerPaiementSolde = async (req, res) => {
  try {
    const { booking_id } = req.params
    const { session_id } = req.body

    const session = await stripe.checkout.sessions.retrieve(session_id)

    const { error } = await supabase
      .from('bookings')
      .update({ solde_paye: true, solde_payment_intent_id: session.payment_intent })
      .eq('id', booking_id)

    if (error) throw error

    res.json({ message: 'Solde payé avec succès' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { creerPaiement, recupererPaiementIntent, rembourserPaiement, creerPaiementSolde, confirmerPaiementSolde }