const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

const envoyerEmailReservation = async (emailClient, emailPrestataire, details) => {
  try {
    await resend.emails.send({
      from: 'At Home Service <onboarding@resend.dev>',
      to: emailPrestataire,
      subject: 'Nouvelle réservation sur At Home Service',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F5ECD8; border-radius: 12px;">
          <div style="background: #2B6CB0; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">At Home Service</h1>
            <p style="color: #BEE3F8; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">SERVICES À DOMICILE</p>
          </div>
          <div style="padding: 24px; background: white; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1A365D;">Nouvelle réservation !</h2>
            <p style="color: #3D2B0F;">Vous avez reçu une nouvelle réservation pour votre service :</p>
            <div style="background: #F5ECD8; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #A07840;">
              <p><strong style="color: #1A365D;">Service :</strong> ${details.service}</p>
              <p><strong style="color: #1A365D;">Client :</strong> ${details.clientNom}</p>
              <p><strong style="color: #1A365D;">Date :</strong> ${details.date}</p>
              <p><strong style="color: #1A365D;">Adresse :</strong> ${details.adresse}</p>
            </div>
            <p style="color: #3D2B0F;">Connectez-vous sur At Home Service pour confirmer ou annuler cette réservation.</p>
            <p style="color: #A07840; font-size: 12px; margin-top: 24px;">© 2026 At Home Service — Tous droits réservés</p>
          </div>
        </div>
      `
    })

    await resend.emails.send({
      from: 'At Home Service <onboarding@resend.dev>',
      to: emailClient,
      subject: 'Votre réservation At Home Service',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F5ECD8; border-radius: 12px;">
          <div style="background: #2B6CB0; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">At Home Service</h1>
            <p style="color: #BEE3F8; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">SERVICES À DOMICILE</p>
          </div>
          <div style="padding: 24px; background: white; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1A365D;">Réservation confirmée !</h2>
            <p style="color: #3D2B0F;">Votre réservation a bien été enregistrée :</p>
            <div style="background: #F5ECD8; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #A07840;">
              <p><strong style="color: #1A365D;">Service :</strong> ${details.service}</p>
              <p><strong style="color: #1A365D;">Date :</strong> ${details.date}</p>
              <p><strong style="color: #1A365D;">Adresse :</strong> ${details.adresse}</p>
            </div>
            <p style="color: #3D2B0F;">Le prestataire va confirmer votre réservation dans les plus brefs délais.</p>
            <p style="color: #A07840; font-size: 12px; margin-top: 24px;">© 2026 At Home Service — Tous droits réservés</p>
          </div>
        </div>
      `
    })

    console.log('Emails envoyés avec succès')
  } catch (error) {
    console.error('Erreur envoi email:', error)
  }
}

const envoyerEmailConfirmation = async (emailClient, details) => {
  try {
    await resend.emails.send({
      from: 'At Home Service <onboarding@resend.dev>',
      to: emailClient,
      subject: 'Votre réservation a été confirmée !',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F5ECD8; border-radius: 12px;">
          <div style="background: #2B6CB0; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">At Home Service</h1>
            <p style="color: #BEE3F8; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">SERVICES À DOMICILE</p>
          </div>
          <div style="padding: 24px; background: white; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1A365D;">Bonne nouvelle ! 🎉</h2>
            <p style="color: #3D2B0F;">Votre réservation a été <strong>confirmée</strong> par le prestataire :</p>
            <div style="background: #F5ECD8; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #A07840;">
              <p><strong style="color: #1A365D;">Service :</strong> ${details.service}</p>
              <p><strong style="color: #1A365D;">Date :</strong> ${details.date}</p>
              <p><strong style="color: #1A365D;">Adresse :</strong> ${details.adresse}</p>
            </div>
            <p style="color: #3D2B0F;">Le prestataire sera chez vous à l'heure indiquée. Bonne prestation !</p>
            <p style="color: #A07840; font-size: 12px; margin-top: 24px;">© 2026 At Home Service — Tous droits réservés</p>
          </div>
        </div>
      `
    })
    console.log('Email de confirmation envoyé')
  } catch (error) {
    console.error('Erreur envoi email confirmation:', error)
  }
}

const envoyerEmailNouvelAvis = async (emailPrestataire, details) => {
  try {
    const etoiles = '★'.repeat(details.note) + '☆'.repeat(5 - details.note)
    await resend.emails.send({
      from: 'At Home Service <onboarding@resend.dev>',
      to: emailPrestataire,
      subject: `Nouvel avis ${details.note}/5 sur At Home Service`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F5ECD8; border-radius: 12px;">
          <div style="background: #2B6CB0; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">At Home Service</h1>
            <p style="color: #BEE3F8; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">SERVICES À DOMICILE</p>
          </div>
          <div style="padding: 24px; background: white; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1A365D;">Vous avez reçu un nouvel avis !</h2>
            <p style="color: #F6AD55; font-size: 24px; letter-spacing: 4px;">${etoiles}</p>
            <div style="background: #F5ECD8; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #A07840;">
              <p><strong style="color: #1A365D;">Client :</strong> ${details.clientNom}</p>
              <p><strong style="color: #1A365D;">Service :</strong> ${details.service}</p>
              ${details.commentaire ? `<p><strong style="color: #1A365D;">Commentaire :</strong> "${details.commentaire}"</p>` : ''}
            </div>
            <p style="color: #3D2B0F;">Connectez-vous pour répondre à cet avis et remercier votre client !</p>
            <p style="color: #A07840; font-size: 12px; margin-top: 24px;">© 2026 At Home Service — Tous droits réservés</p>
          </div>
        </div>
      `
    })
    console.log('Email nouvel avis envoyé')
  } catch (error) {
    console.error('Erreur envoi email avis:', error)
  }
}

const envoyerEmailNouveauMessage = async (emailDestinataire, details) => {
  try {
    await resend.emails.send({
      from: 'At Home Service <onboarding@resend.dev>',
      to: emailDestinataire,
      subject: `Nouveau message de ${details.expediteurNom}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F5ECD8; border-radius: 12px;">
          <div style="background: #2B6CB0; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">At Home Service</h1>
            <p style="color: #BEE3F8; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">SERVICES À DOMICILE</p>
          </div>
          <div style="padding: 24px; background: white; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1A365D;">💬 Nouveau message</h2>
            <p style="color: #3D2B0F;">${details.expediteurNom} vous a envoyé un message :</p>
            <div style="background: #F5ECD8; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #A07840;">
              <p style="color: #1A365D; font-style: italic;">"${details.contenu}"</p>
            </div>
            <p style="color: #3D2B0F;">Connectez-vous sur At Home Service pour répondre.</p>
            <p style="color: #A07840; font-size: 12px; margin-top: 24px;">© 2026 At Home Service — Tous droits réservés</p>
          </div>
        </div>
      `
    })
    console.log('Email nouveau message envoyé')
  } catch (error) {
    console.error('Erreur envoi email message:', error)
  }
}

module.exports = { envoyerEmailReservation, envoyerEmailConfirmation, envoyerEmailNouvelAvis, envoyerEmailNouveauMessage }