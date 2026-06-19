const supabase = require('../config/supabase')

const getPrestatairesListe = async (req, res) => {
  try {
    const { categorie, ville } = req.query

    let query = supabase
      .from('users')
      .select('id, nom, prenom, ville, code_postal, verifie, photo_url, description')
      .eq('role', 'prestataire')

    const { data: prestataires, error } = await query

    if (error) throw error

    const prestataireIds = prestataires.map(p => p.id)

    let servicesQuery = supabase
      .from('services')
      .select('prestataire_id, categorie, titre, prix, duree, description, photo_url')
      .in('prestataire_id', prestataireIds)
      .eq('disponible', true)

    if (categorie) {
      servicesQuery = servicesQuery.eq('categorie', categorie)
    }

    const { data: services } = await servicesQuery

    const { data: avis } = await supabase
      .from('reviews')
      .select('note, service_id')

    const { data: tousLesServices } = await supabase
      .from('services')
      .select('id, prestataire_id')
      .in('prestataire_id', prestataireIds)

    let resultats = prestataires.map(p => {
      const servicesDuPrestataire = services.filter(s => s.prestataire_id === p.id)
      const serviceIdsDuPrestataire = tousLesServices.filter(s => s.prestataire_id === p.id).map(s => s.id)
      const avisDuPrestataire = avis.filter(a => serviceIdsDuPrestataire.includes(a.service_id))
      const moyenne = avisDuPrestataire.length > 0
        ? (avisDuPrestataire.reduce((acc, a) => acc + a.note, 0) / avisDuPrestataire.length).toFixed(1)
        : 0

      return {
        ...p,
        services: servicesDuPrestataire,
        moyenne,
        totalAvis: avisDuPrestataire.length
      }
    })

    resultats = resultats.filter(p => p.services.length > 0)

    if (ville) {
      const rechercheLower = ville.toLowerCase().trim()
      resultats = resultats.filter(p =>
        p.ville?.toLowerCase().includes(rechercheLower) ||
        p.code_postal?.includes(rechercheLower)
      )
    }

    res.json({ prestataires: resultats })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { getPrestatairesListe }