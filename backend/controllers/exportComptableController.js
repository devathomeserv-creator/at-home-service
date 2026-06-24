const supabase = require('../config/supabase')
const PDFDocument = require('pdfkit')

const TAUX_COMMISSION = 0.10

const traductionsExport = {
  fr: { titre: 'EXPORT COMPTABLE', periode: 'Période :', au: 'au', genere_le: 'Document généré le', resume: 'Résumé', nb_reservations: 'Nombre de réservations terminées :', volume: 'Volume total des transactions (TTC) :', commission: 'Commission perçue (taux', net_reverse: 'Montant net reversé aux prestataires :', nb_remboursements: 'Nombre de remboursements :', detail: 'Détail des transactions', date_col: 'Date', prestataire_col: 'Prestataire', service_col: 'Service', statut_col: 'Statut', prix_col: 'Prix', commission_col: 'Commission', footer: '© 2026 At Home Service — Document généré automatiquement, à conserver pour votre comptabilité.' },
  en: { titre: 'ACCOUNTING EXPORT', periode: 'Period:', au: 'to', genere_le: 'Document generated on', resume: 'Summary', nb_reservations: 'Number of completed bookings:', volume: 'Total transaction volume (incl. tax):', commission: 'Commission earned (rate', net_reverse: 'Net amount paid to providers:', nb_remboursements: 'Number of refunds:', detail: 'Transaction details', date_col: 'Date', prestataire_col: 'Provider', service_col: 'Service', statut_col: 'Status', prix_col: 'Price', commission_col: 'Commission', footer: '© 2026 At Home Service — This document is generated automatically, keep it for your accounting records.' },
  it: { titre: 'EXPORT CONTABILE', periode: 'Periodo:', au: 'al', genere_le: 'Documento generato il', resume: 'Riepilogo', nb_reservations: 'Numero di prenotazioni completate:', volume: 'Volume totale delle transazioni (IVA incl.):', commission: 'Commissione percepita (tasso', net_reverse: 'Importo netto versato ai fornitori:', nb_remboursements: 'Numero di rimborsi:', detail: 'Dettaglio delle transazioni', date_col: 'Data', prestataire_col: 'Fornitore', service_col: 'Servizio', statut_col: 'Stato', prix_col: 'Prezzo', commission_col: 'Commissione', footer: '© 2026 At Home Service — Documento generato automaticamente, conservalo per la tua contabilità.' }
}

const tE = (langue, cle) => traductionsExport[langue]?.[cle] || traductionsExport['fr']?.[cle] || cle

const genererExportComptable = async (req, res) => {
  try {
    const { date_debut, date_fin, langue } = req.query

    if (!date_debut || !date_fin) {
      return res.status(400).json({ message: 'Veuillez fournir une date de début et de fin' })
    }

    const langueFinale = ['fr', 'en', 'it'].includes(langue) ? langue : 'fr'

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
    doc.fillColor('#3D2B0F').fontSize(10).text(tE(langueFinale, 'titre'), 50, 76)

    doc.fillColor('#1A365D').fontSize(14).text(`${tE(langueFinale, 'periode')} ${new Date(date_debut).toLocaleDateString('fr-FR')} ${tE(langueFinale, 'au')} ${new Date(date_fin).toLocaleDateString('fr-FR')}`, 50, 110)
    doc.fillColor('#3D2B0F').fontSize(9).text(`${tE(langueFinale, 'genere_le')} ${new Date().toLocaleDateString('fr-FR')}`, 50, 130)

    doc.moveTo(50, 155).lineTo(550, 155).strokeColor('#A07840').stroke()

    doc.fillColor('#1A365D').fontSize(12).text(tE(langueFinale, 'resume'), 50, 175)
    doc.fillColor('#3D2B0F').fontSize(10)
      .text(`${tE(langueFinale, 'nb_reservations')} ${reservationsTerminees.length}`, 50, 200)
      .text(`${tE(langueFinale, 'volume')} ${volumeTotal.toFixed(2)} €`, 50, 218)
      .text(`${tE(langueFinale, 'commission')} ${TAUX_COMMISSION * 100}%) : ${commissionTotale.toFixed(2)} €`, 50, 236)
      .text(`${tE(langueFinale, 'net_reverse')} ${(volumeTotal - commissionTotale).toFixed(2)} €`, 50, 254)
      .text(`${tE(langueFinale, 'nb_remboursements')} ${totalRembourse}`, 50, 272)

    doc.moveTo(50, 300).lineTo(550, 300).strokeColor('#A07840').stroke()

    doc.fillColor('#1A365D').fontSize(12).text(tE(langueFinale, 'detail'), 50, 320)

    let y = 350
    doc.fillColor('white').rect(50, y - 5, 500, 20).fill('#2B6CB0')
    doc.fillColor('white').fontSize(8)
      .text(tE(langueFinale, 'date_col'), 55, y)
      .text(tE(langueFinale, 'prestataire_col'), 130, y)
      .text(tE(langueFinale, 'service_col'), 250, y)
      .text(tE(langueFinale, 'statut_col'), 360, y)
      .text(tE(langueFinale, 'prix_col'), 420, y)
      .text(tE(langueFinale, 'commission_col'), 470, y)

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
      tE(langueFinale, 'footer'),
      50, 780, { align: 'center', width: 500 }
    )

    doc.end()
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { genererExportComptable }