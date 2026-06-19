const supabase = require('../config/supabase')

const getPrestatairesCarte = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nom, prenom, ville, code_postal, latitude, longitude, verifie, description')
      .eq('role', 'prestataire')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (error) throw error

    const prestataireIds = data.map(p => p.id)

    const { data: services } = await supabase
      .from('services')
      .select('prestataire_id, categorie, titre, prix')
      .in('prestataire_id', prestataireIds)
      .eq('disponible', true)

    const resultats = data.map(p => ({
      ...p,
      services: services.filter(s => s.prestataire_id === p.id)
    }))

    res.json({ prestataires: resultats })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { getPrestatairesCarte }