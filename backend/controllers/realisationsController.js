const supabase = require('../config/supabase')

const ajouterRealisation = async (req, res) => {
  try {
    const { titre, description, media_url, type_media } = req.body
    const prestataire_id = req.user.id

    const { data, error } = await supabase
      .from('realisations')
      .insert([{ prestataire_id, titre, description, media_url, type_media }])
      .select()

    if (error) throw error

    res.status(201).json({ message: 'Réalisation ajoutée avec succès', realisation: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getMesRealisations = async (req, res) => {
  try {
    const prestataire_id = req.user.id

    const { data, error } = await supabase
      .from('realisations')
      .select('*')
      .eq('prestataire_id', prestataire_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ realisations: data })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getRealisationsPrestataire = async (req, res) => {
  try {
    const { prestataire_id } = req.params

    const { data, error } = await supabase
      .from('realisations')
      .select('*')
      .eq('prestataire_id', prestataire_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ realisations: data })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const supprimerRealisation = async (req, res) => {
  try {
    const { id } = req.params
    const prestataire_id = req.user.id

    const { error } = await supabase
      .from('realisations')
      .delete()
      .eq('id', id)
      .eq('prestataire_id', prestataire_id)

    if (error) throw error

    res.json({ message: 'Réalisation supprimée avec succès' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { ajouterRealisation, getMesRealisations, getRealisationsPrestataire, supprimerRealisation }