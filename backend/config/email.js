const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

const traductionsEmail = {
  fr: {
    sujet_reservation_presta: 'Nouvelle réservation sur At Home Service',
    titre_reservation_presta: 'Nouvelle réservation !',
    texte_reservation_presta: 'Vous avez reçu une nouvelle réservation pour votre service :',
    service_label: 'Service :', client_label: 'Client :', date_label: 'Date :', adresse_label: 'Adresse :',
    instructions_presta: 'Connectez-vous sur At Home Service pour confirmer ou annuler cette réservation.',
    sujet_reservation_client: 'Votre réservation At Home Service',
    titre_reservation_client: 'Réservation confirmée !',
    texte_reservation_client: 'Votre réservation a bien été enregistrée :',
    instructions_client: 'Le prestataire va confirmer votre réservation dans les plus brefs délais.',
    sujet_confirmation: 'Votre réservation a été confirmée !',
    titre_confirmation: 'Bonne nouvelle ! 🎉',
    texte_confirmation: 'Votre réservation a été confirmée par le prestataire :',
    instructions_confirmation: 'Le prestataire sera chez vous à l\'heure indiquée. Bonne prestation !',
    sujet_avis: 'Nouvel avis sur At Home Service',
    titre_avis: 'Vous avez reçu un nouvel avis !',
    commentaire_label: 'Commentaire :',
    instructions_avis: 'Connectez-vous pour répondre à cet avis et remercier votre client !',
    sujet_message: 'Nouveau message de',
    titre_message: '💬 Nouveau message',
    instructions_message: 'Connectez-vous sur At Home Service pour répondre.',
    vous_a_envoye: 'vous a envoyé un message :',
    footer: '© 2026 At Home Service — Tous droits réservés'
  },
  en: {
    sujet_reservation_presta: 'New booking on At Home Service',
    titre_reservation_presta: 'New booking!',
    texte_reservation_presta: 'You have received a new booking for your service:',
    service_label: 'Service:', client_label: 'Client:', date_label: 'Date:', adresse_label: 'Address:',
    instructions_presta: 'Log in to At Home Service to confirm or cancel this booking.',
    sujet_reservation_client: 'Your At Home Service booking',
    titre_reservation_client: 'Booking confirmed!',
    texte_reservation_client: 'Your booking has been registered:',
    instructions_client: 'The provider will confirm your booking as soon as possible.',
    sujet_confirmation: 'Your booking has been confirmed!',
    titre_confirmation: 'Good news! 🎉',
    texte_confirmation: 'Your booking has been confirmed by the provider:',
    instructions_confirmation: 'The provider will be at your home at the scheduled time. Enjoy!',
    sujet_avis: 'New review on At Home Service',
    titre_avis: 'You have received a new review!',
    commentaire_label: 'Comment:',
    instructions_avis: 'Log in to reply to this review and thank your client!',
    sujet_message: 'New message from',
    titre_message: '💬 New message',
    instructions_message: 'Log in to At Home Service to reply.',
    vous_a_envoye: 'sent you a message:',
    footer: '© 2026 At Home Service — All rights reserved'
  },
  it: {
    sujet_reservation_presta: 'Nuova prenotazione su At Home Service',
    titre_reservation_presta: 'Nuova prenotazione!',
    texte_reservation_presta: 'Hai ricevuto una nuova prenotazione per il tuo servizio:',
    service_label: 'Servizio:', client_label: 'Cliente:', date_label: 'Data:', adresse_label: 'Indirizzo:',
    instructions_presta: 'Accedi a At Home Service per confermare o annullare questa prenotazione.',
    sujet_reservation_client: 'La tua prenotazione At Home Service',
    titre_reservation_client: 'Prenotazione confermata!',
    texte_reservation_client: 'La tua prenotazione è stata registrata:',
    instructions_client: 'Il fornitore confermerà la tua prenotazione il prima possibile.',
    sujet_confirmation: 'La tua prenotazione è stata confermata!',
    titre_confirmation: 'Buone notizie! 🎉',
    texte_confirmation: 'La tua prenotazione è stata confermata dal fornitore:',
    instructions_confirmation: 'Il fornitore sarà a casa tua all\'ora indicata. Buon servizio!',
    sujet_avis: 'Nuova recensione su At Home Service',
    titre_avis: 'Hai ricevuto una nuova recensione!',
    commentaire_label: 'Commento:',
    instructions_avis: 'Accedi per rispondere a questa recensione e ringraziare il tuo cliente!',
    sujet_message: 'Nuovo messaggio da',
    titre_message: '💬 Nuovo messaggio',
    instructions_message: 'Accedi a At Home Service per rispondere.',
    vous_a_envoye: 'ti ha inviato un messaggio:',
    footer: '© 2026 At Home Service — Tutti i diritti riservati'
  },
  ru: {
    sujet_reservation_presta: 'Новое бронирование на At Home Service',
    titre_reservation_presta: 'Новое бронирование!',
    texte_reservation_presta: 'Вы получили новое бронирование для вашей услуги:',
    service_label: 'Услуга:', client_label: 'Клиент:', date_label: 'Дата:', adresse_label: 'Адрес:',
    instructions_presta: 'Войдите в At Home Service, чтобы подтвердить или отменить это бронирование.',
    sujet_reservation_client: 'Ваше бронирование At Home Service',
    titre_reservation_client: 'Бронирование подтверждено!',
    texte_reservation_client: 'Ваше бронирование было зарегистрировано:',
    instructions_client: 'Специалист подтвердит ваше бронирование в ближайшее время.',
    sujet_confirmation: 'Ваше бронирование подтверждено!',
    titre_confirmation: 'Хорошие новости! 🎉',
    texte_confirmation: 'Ваше бронирование подтверждено специалистом:',
    instructions_confirmation: 'Специалист будет у вас дома в назначенное время. Приятной услуги!',
    sujet_avis: 'Новый отзыв на At Home Service',
    titre_avis: 'Вы получили новый отзыв!',
    commentaire_label: 'Комментарий:',
    instructions_avis: 'Войдите, чтобы ответить на этот отзыв и поблагодарить клиента!',
    sujet_message: 'Новое сообщение от',
    titre_message: '💬 Новое сообщение',
    instructions_message: 'Войдите в At Home Service, чтобы ответить.',
    vous_a_envoye: 'отправил(а) вам сообщение:',
    footer: '© 2026 At Home Service — Все права защищены'
  }
}

const tEmail = (langue, cle) => {
  return traductionsEmail[langue]?.[cle] || traductionsEmail['fr']?.[cle] || cle
}

const enveloppe = (contenuHtml) => `
  <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F5ECD8; border-radius: 12px;">
    <div style="background: #2B6CB0; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 22px;">At Home Service</h1>
      <p style="color: #BEE3F8; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">SERVICES À DOMICILE</p>
    </div>
    <div style="padding: 24px; background: white; border-radius: 0 0 8px 8px;">
      ${contenuHtml}
    </div>
  </div>
`

const envoyerEmailReservation = async (emailClient, emailPrestataire, details, languePrestataire = 'fr', langueClient = 'fr') => {
  try {
    const lp = languePrestataire
    await resend.emails.send({
      from: 'At Home Service <onboarding@resend.dev>',
      to: emailPrestataire,
      subject: tEmail(lp, 'sujet_reservation_presta'),
      html: enveloppe(`
        <h2 style="color: #1A365D;">${tEmail(lp, 'titre_reservation_presta')}</h2>
        <p style="color: #3D2B0F;">${tEmail(lp, 'texte_reservation_presta')}</p>
        <div style="background: #F5ECD8; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #A07840;">
          <p><strong style="color: #1A365D;">${tEmail(lp, 'service_label')}</strong> ${details.service}</p>
          <p><strong style="color: #1A365D;">${tEmail(lp, 'client_label')}</strong> ${details.clientNom}</p>
          <p><strong style="color: #1A365D;">${tEmail(lp, 'date_label')}</strong> ${details.date}</p>
          <p><strong style="color: #1A365D;">${tEmail(lp, 'adresse_label')}</strong> ${details.adresse}</p>
        </div>
        <p style="color: #3D2B0F;">${tEmail(lp, 'instructions_presta')}</p>
        <p style="color: #A07840; font-size: 12px; margin-top: 24px;">${tEmail(lp, 'footer')}</p>
      `)
    })

    const lc = langueClient
    await resend.emails.send({
      from: 'At Home Service <onboarding@resend.dev>',
      to: emailClient,
      subject: tEmail(lc, 'sujet_reservation_client'),
      html: enveloppe(`
        <h2 style="color: #1A365D;">${tEmail(lc, 'titre_reservation_client')}</h2>
        <p style="color: #3D2B0F;">${tEmail(lc, 'texte_reservation_client')}</p>
        <div style="background: #F5ECD8; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #A07840;">
          <p><strong style="color: #1A365D;">${tEmail(lc, 'service_label')}</strong> ${details.service}</p>
          <p><strong style="color: #1A365D;">${tEmail(lc, 'date_label')}</strong> ${details.date}</p>
          <p><strong style="color: #1A365D;">${tEmail(lc, 'adresse_label')}</strong> ${details.adresse}</p>
        </div>
        <p style="color: #3D2B0F;">${tEmail(lc, 'instructions_client')}</p>
        <p style="color: #A07840; font-size: 12px; margin-top: 24px;">${tEmail(lc, 'footer')}</p>
      `)
    })

    console.log('Emails envoyés avec succès')
  } catch (error) {
    console.error('Erreur envoi email:', error)
  }
}

const envoyerEmailConfirmation = async (emailClient, details, langueClient = 'fr') => {
  try {
    const lc = langueClient
    await resend.emails.send({
      from: 'At Home Service <onboarding@resend.dev>',
      to: emailClient,
      subject: tEmail(lc, 'sujet_confirmation'),
      html: enveloppe(`
        <h2 style="color: #1A365D;">${tEmail(lc, 'titre_confirmation')}</h2>
        <p style="color: #3D2B0F;">${tEmail(lc, 'texte_confirmation')}</p>
        <div style="background: #F5ECD8; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #A07840;">
          <p><strong style="color: #1A365D;">${tEmail(lc, 'service_label')}</strong> ${details.service}</p>
          <p><strong style="color: #1A365D;">${tEmail(lc, 'date_label')}</strong> ${details.date}</p>
          <p><strong style="color: #1A365D;">${tEmail(lc, 'adresse_label')}</strong> ${details.adresse}</p>
        </div>
        <p style="color: #3D2B0F;">${tEmail(lc, 'instructions_confirmation')}</p>
        <p style="color: #A07840; font-size: 12px; margin-top: 24px;">${tEmail(lc, 'footer')}</p>
      `)
    })
    console.log('Email de confirmation envoyé')
  } catch (error) {
    console.error('Erreur envoi email confirmation:', error)
  }
}

const envoyerEmailNouvelAvis = async (emailPrestataire, details, languePrestataire = 'fr') => {
  try {
    const lp = languePrestataire
    const etoiles = '★'.repeat(details.note) + '☆'.repeat(5 - details.note)
    await resend.emails.send({
      from: 'At Home Service <onboarding@resend.dev>',
      to: emailPrestataire,
      subject: `${tEmail(lp, 'sujet_avis')} ${details.note}/5`,
      html: enveloppe(`
        <h2 style="color: #1A365D;">${tEmail(lp, 'titre_avis')}</h2>
        <p style="color: #F6AD55; font-size: 24px; letter-spacing: 4px;">${etoiles}</p>
        <div style="background: #F5ECD8; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #A07840;">
          <p><strong style="color: #1A365D;">${tEmail(lp, 'client_label')}</strong> ${details.clientNom}</p>
          <p><strong style="color: #1A365D;">${tEmail(lp, 'service_label')}</strong> ${details.service}</p>
          ${details.commentaire ? `<p><strong style="color: #1A365D;">${tEmail(lp, 'commentaire_label')}</strong> "${details.commentaire}"</p>` : ''}
        </div>
        <p style="color: #3D2B0F;">${tEmail(lp, 'instructions_avis')}</p>
        <p style="color: #A07840; font-size: 12px; margin-top: 24px;">${tEmail(lp, 'footer')}</p>
      `)
    })
    console.log('Email nouvel avis envoyé')
  } catch (error) {
    console.error('Erreur envoi email avis:', error)
  }
}

const envoyerEmailNouveauMessage = async (emailDestinataire, details, langueDestinataire = 'fr') => {
  try {
    const ld = langueDestinataire
    await resend.emails.send({
      from: 'At Home Service <onboarding@resend.dev>',
      to: emailDestinataire,
      subject: `${tEmail(ld, 'sujet_message')} ${details.expediteurNom}`,
      html: enveloppe(`
        <h2 style="color: #1A365D;">${tEmail(ld, 'titre_message')}</h2>
        <p style="color: #3D2B0F;">${details.expediteurNom} ${tEmail(ld, 'vous_a_envoye')}</p>
        <div style="background: #F5ECD8; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #A07840;">
          <p style="color: #1A365D; font-style: italic;">"${details.contenu}"</p>
        </div>
        <p style="color: #3D2B0F;">${tEmail(ld, 'instructions_message')}</p>
        <p style="color: #A07840; font-size: 12px; margin-top: 24px;">${tEmail(ld, 'footer')}</p>
      `)
    })
    console.log('Email nouveau message envoyé')
  } catch (error) {
    console.error('Erreur envoi email message:', error)
  }
}

module.exports = { envoyerEmailReservation, envoyerEmailConfirmation, envoyerEmailNouvelAvis, envoyerEmailNouveauMessage }