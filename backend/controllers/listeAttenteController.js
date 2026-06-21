const supabase = require('../config/supabase')
const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

const envoyerEmailCreneauLibere = async (emailClient, details) => {
  try {
    await resend.emails.send({
      from: 'At Home Service <onboarding@resend.dev>',
      to: emailClient,
      subject: 'Un créneau s\'est libéré !',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F5ECD8; border-radius: 12px;">
          <div style="background: #2B6CB0; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">At Home Service</h1>
            <p style="color: #BEE3F8; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">SERVICES À DOMICILE</p>
          </div>
          <div style="padding: 24px; background: white; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1A365D;">🎉 Bonne nouvelle !</h2>
            <p style="color: #3D2B0F;">Le créneau que vous attendiez vient de se libérer :</p>
            <div style="background: #F5ECD8; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #A07840;">
              <p><strong style="color: #1A365D;">Service :</strong> ${details.service}</p>
              <p><strong style="color: #1A365D;">Date :</strong> ${details.date}</p>
            </div>
            <p style="color: #3D2B0F;">Connectez-vous rapidement sur At Home Service pour réserver ce créneau avant qu'il ne soit pris par quelqu'un d'autre !</p>
            <p style="color: #A07840; font-size: 12px; margin-top: 24px;">© 2026 At Home Service — Tous droits réservés</p>
          </div>
        </div>
      `
    })
  } catch (error) {
    console.error('Erreur envoi email liste attente:', error)
  }
}

const ajouterListeAttente = async (req, res) => {
  try {
    const { service_id, date_souhaitee } = req.body
    const client_id = req.user.id

    const { data: existant } = await supabase
      .from('liste_attente')
      .select('id')
      .eq('client_id', client_id)
      .eq('service_id', service_id)
      .eq('date_souhaitee', date_souhaitee)
      .eq('statut', 'en_attente')
      .single()

    if (existant) {
      return res.status(400).json({ message: 'Vous êtes déjà inscrit en liste d\'attente pour ce créneau' })
    }

    const { data, error } = await supabase
      .from('liste_attente')
      .insert([{ client_id, service_id, date_souhaitee }])
      .select()

    if (error) throw error

    res.status(201).json({ message: 'Vous serez notifié si ce créneau se libère !', inscription: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getMaListeAttente = async (req, res) => {
  try {
    const client_id = req.user.id

    const { data, error } = await supabase
      .from('liste_attente')
      .select('*, services(titre, prix, prestataire_id, users(prenom, nom))')
      .eq('client_id', client_id)
      .order('date_souhaitee', { ascending: true })

    if (error) throw error

    res.json({ liste: data })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const retirerListeAttente = async (req, res) => {
  try {
    const { id } = req.params
    const client_id = req.user.id

    const { error } = await supabase
      .from('liste_attente')
      .delete()
      .eq('id', id)
      .eq('client_id', client_id)

    if (error) throw error

    res.json({ message: 'Retiré de la liste d\'attente' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const notifierCreneauLibere = async (service_id, date_rdv) => {
  try {
    const { data: attentes } = await supabase
      .from('liste_attente')
      .select('*, services(titre), users:client_id(email)')
      .eq('service_id', service_id)
      .eq('date_souhaitee', date_rdv)
      .eq('statut', 'en_attente')

    if (!attentes || attentes.length === 0) return

    for (const attente of attentes) {
      await envoyerEmailCreneauLibere(attente.users.email, {
        service: attente.services.titre,
        date: new Date(date_rdv).toLocaleString('fr-FR')
      })

      await supabase
        .from('liste_attente')
        .update({ statut: 'notifie' })
        .eq('id', attente.id)
    }
  } catch (error) {
    console.error('Erreur notification liste attente:', error)
  }
}

module.exports = { ajouterListeAttente, getMaListeAttente, retirerListeAttente, notifierCreneauLibere }