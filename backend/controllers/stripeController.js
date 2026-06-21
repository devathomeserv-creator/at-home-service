const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const supabase = require('../config/supabase')

const creerPaiement = async (req, res) => {
  try {
    const { service_id, date_rdv, adresse_intervention } = req.body
    const client_id = req.user.id

    const { data: service } = await supabase
      .from('services')
      .select('*')
      .eq('id', service_id)
      .single()

    if (!service) {
      return res.status(404).json({ message: 'Service introuvable' })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: service.titre,
              description: service.description || 'Service à domicile — At Home Service',
            },
            unit_amount: Math.round(service.prix * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://at-home-service.vercel.app/client?paiement=succes&service_id=${service_id}&date_rdv=${date_rdv}&adresse=${encodeURIComponent(adresse_intervention)}&session_id={CHECKOUT_SESSION_ID}`,
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

module.exports = { creerPaiement, recupererPaiementIntent, rembourserPaiement }