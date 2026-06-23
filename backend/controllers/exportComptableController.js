const supabase = require('../config/supabase')
const PDFDocument = require('pdfkit')

const TAUX_COMMISSION = 0.10

const genererExportComptable = async (req, res) => {
  try {
    const { date_debut, date_fin } = req.query

    if (!date_debut || !date_fin) {
      return res.status(400).json({ message: 'Veuillez fournir une date de début et de fin' })
    }

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, services(titre, prix, prestataire_id, users(prenom, nom))')
      .gte('created_at', date_debut)
      .lte('created_at', date_fin)
      .order('created_at', { ascending: true })

    if (error) throw error

    const reservationsTerminees = bookings.filter(b => b.statut === 'termine')

    const calculerCommission = (b) => {
      if (b.commission) return b.commission
      const prix = b.services?.prix || 0
      return Math.round((prix * TAUX_COMMISSION) * 100) / 100
    }

    const commissionTotale = reservationsTerminees.reduce((acc, b) => acc + calculerCommission(b), 0)
    const volumeTotal = reservationsTerminees.reduce((acc, b) => acc + (b.services?.prix || 0), 0)
    const totalRembourse = bookings.filter(b => b.rembourse).length

    const doc = new PDFDocument({ margin: 50 })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=export-comptable-${date_debut}-${date_fin}.pdf`)

    doc.pipe(res)

    doc.fillColor('#2B6CB0').fontSize(22).text('At Home Service', 50, 50)
    doc.fillColor('#3D2B0F').fontSize(10).text('EXPORT COMPTABLE', 50, 76)

    doc.fillColor('#1A365D').fontSize(14).text(`Période : du ${new Date(date_debut).toLocaleDateString('fr-FR')} au ${new Date(date_fin).toLocaleDateString('fr-FR')}`, 50, 110)
    doc.fillColor('#3D2B0F').fontSize(9).text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 50, 130)

    doc.moveTo(50, 155).lineTo(550, 155).strokeColor('#A07840').stroke()

    doc.fillColor('#1A365D').fontSize(12).text('Résumé', 50, 175)
    doc.fillColor('#3D2B0F').fontSize(10)
      .text(`Nombre de réservations terminées : ${reservationsTerminees.length}`, 50, 200)
      .text(`Volume total des transactions (TTC) : ${volumeTotal.toFixed(2)} €`, 50, 218)
      .text(`Commission perçue (taux ${TAUX_COMMISSION * 100}%) : ${commissionTotale.toFixed(2)} €`, 50, 236)
      .text(`Montant net reversé aux prestataires : ${(volumeTotal - commissionTotale).toFixed(2)} €`, 50, 254)
      .text(`Nombre de remboursements : ${totalRembourse}`, 50, 272)

    doc.moveTo(50, 300).lineTo(550, 300).strokeColor('#A07840').stroke()

    doc.fillColor('#1A365D').fontSize(12).text('Détail des transactions', 50, 320)

    let y = 350
    doc.fillColor('white').rect(50, y - 5, 500, 20).fill('#2B6CB0')
    doc.fillColor('white').fontSize(8)
      .text('Date', 55, y)
      .text('Prestataire', 130, y)
      .text('Service', 250, y)
      .text('Statut', 360, y)
      .text('Prix', 420, y)
      .text('Commission', 470, y)

    y += 25

    reservationsTerminees.forEach(b => {
      if (y > 750) {
        doc.addPage()
        y = 50
      }
      doc.fillColor('#3D2B0F').fontSize(8)
        .text(new Date(b.date_rdv).toLocaleDateString('fr-FR'), 55, y)
        .text(`${b.services?.users?.prenom || ''} ${b.services?.users?.nom || ''}`, 130, y, { width: 110 })
        .text(b.services?.titre || '', 250, y, { width: 100 })
        .text(b.statut, 360, y)
        .text(`${b.services?.prix || 0}€`, 420, y)
        .text(`${calculerCommission(b)}€`, 470, y)
      y += 18
    })

    doc.fillColor('#A07840').fontSize(8).text(
      '© 2026 At Home Service — Document généré automatiquement, à conserver pour votre comptabilité.',
      50, 780, { align: 'center', width: 500 }
    )

    doc.end()
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { genererExportComptable }