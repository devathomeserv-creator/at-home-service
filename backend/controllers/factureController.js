const supabase = require('../config/supabase')
const PDFDocument = require('pdfkit')

const traductionsFacture = {
  fr: { facture: 'FACTURE', date_label: 'Date :', prestataire: 'Prestataire', client: 'Client', siret_label: 'SIRET :', description: 'Description', date_col: 'Date', prix_col: 'Prix', total_ttc: 'Total TTC', footer: '© 2026 At Home Service — Cette facture est générée automatiquement.' },
  en: { facture: 'INVOICE', date_label: 'Date:', prestataire: 'Provider', client: 'Client', siret_label: 'Business ID:', description: 'Description', date_col: 'Date', prix_col: 'Price', total_ttc: 'Total (incl. tax)', footer: '© 2026 At Home Service — This invoice is generated automatically.' },
  it: { facture: 'FATTURA', date_label: 'Data:', prestataire: 'Fornitore', client: 'Cliente', siret_label: 'P.IVA:', description: 'Descrizione', date_col: 'Data', prix_col: 'Prezzo', total_ttc: 'Totale IVA incl.', footer: '© 2026 At Home Service — Questa fattura è generata automaticamente.' },
  ru: { facture: 'СЧЕТ', date_label: 'Дата:', prestataire: 'Специалист', client: 'Клиент', siret_label: 'SIRET:', description: 'Описание', date_col: 'Дата', prix_col: 'Цена', total_ttc: 'Итого с НДС', footer: '© 2026 At Home Service — Этот счет создан автоматически.' }
}

const tF = (langue, cle) => traductionsFacture[langue]?.[cle] || traductionsFacture['fr']?.[cle] || cle

const genererFacture = async (req, res) => {
  try {
    const { booking_id } = req.params
    const user_id = req.user.id

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, services(*, users(nom, prenom, email, adresse, siret)), users(nom, prenom, email, adresse, langue_preferee)')
      .eq('id', booking_id)
      .single()

    if (!booking) {
      return res.status(404).json({ message: 'Réservation introuvable' })
    }

    if (booking.client_id !== user_id && booking.services.prestataire_id !== user_id) {
      return res.status(403).json({ message: 'Accès non autorisé' })
    }

    if (booking.statut !== 'termine') {
      return res.status(400).json({ message: 'La facture n\'est disponible que pour les prestations terminées' })
    }

    const langue = ['fr', 'en', 'it'].includes(booking.users.langue_preferee) ? booking.users.langue_preferee : 'fr'

    const doc = new PDFDocument({ margin: 50 })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=facture-${booking_id.slice(0, 8)}.pdf`)

    doc.pipe(res)

    doc.fillColor('#2B6CB0').fontSize(24).text('At Home Service', 50, 50)
    doc.fillColor('#3D2B0F').fontSize(10).text('SERVICES À DOMICILE', 50, 78)

    doc.fillColor('#1A365D').fontSize(18).text(tF(langue, 'facture'), 400, 50, { align: 'right' })
    doc.fillColor('#3D2B0F').fontSize(10).text(`N° ${booking_id.slice(0, 8).toUpperCase()}`, 400, 75, { align: 'right' })
    doc.text(`${tF(langue, 'date_label')} ${new Date(booking.date_rdv).toLocaleDateString('fr-FR')}`, 400, 90, { align: 'right' })

    doc.moveTo(50, 120).lineTo(550, 120).strokeColor('#A07840').stroke()

    doc.fillColor('#1A365D').fontSize(12).text(tF(langue, 'prestataire'), 50, 140)
    doc.fillColor('#3D2B0F').fontSize(10)
      .text(`${booking.services.users.prenom} ${booking.services.users.nom}`, 50, 158)
      .text(booking.services.users.adresse || '', 50, 173)
      .text(booking.services.users.email || '', 50, 188)
    if (booking.services.users.siret) {
      doc.text(`${tF(langue, 'siret_label')} ${booking.services.users.siret}`, 50, 203)
    }

    doc.fillColor('#1A365D').fontSize(12).text(tF(langue, 'client'), 320, 140)
    doc.fillColor('#3D2B0F').fontSize(10)
      .text(`${booking.users.prenom} ${booking.users.nom}`, 320, 158)
      .text(booking.adresse_intervention || '', 320, 173)
      .text(booking.users.email || '', 320, 188)

    doc.moveTo(50, 240).lineTo(550, 240).strokeColor('#A07840').stroke()

    doc.fillColor('white').rect(50, 250, 500, 25).fill('#2B6CB0')
    doc.fillColor('white').fontSize(10)
      .text(tF(langue, 'description'), 60, 257)
      .text(tF(langue, 'date_col'), 280, 257)
      .text(tF(langue, 'prix_col'), 480, 257)

    doc.fillColor('#3D2B0F').fontSize(10)
      .text(booking.services.titre, 60, 290)
      .text(new Date(booking.date_rdv).toLocaleDateString('fr-FR'), 280, 290)
      .text(`${booking.services.prix} €`, 480, 290)

    doc.moveTo(50, 320).lineTo(550, 320).strokeColor('#A07840').stroke()

    doc.fillColor('#1A365D').fontSize(14).text(tF(langue, 'total_ttc'), 380, 340)
    doc.fillColor('#C53030').fontSize(16).text(`${booking.services.prix} €`, 480, 338)

    doc.fillColor('#A07840').fontSize(8).text(
      tF(langue, 'footer'),
      50, 750, { align: 'center', width: 500 }
    )

    doc.end()
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { genererFacture }