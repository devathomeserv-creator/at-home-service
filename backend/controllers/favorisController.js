const supabase = require('../config/supabase')

const ajouterFavori = async (req, res) => {
  try {
    const { prestataire_id } = req.body
    const client_id = req.user.id

    const { data: existant } = await supabase
      .from('favoris')
      .select('id')
      .eq('client_id', client_id)
      .eq('prestataire_id', prestataire_id)
      .single()

    if (existant) {
      return res.status(400).json({ message: 'Déjà dans vos favoris' })
    }

    const { data, error } = await supabase
      .from('favoris')
      .insert([{ client_id, prestataire_id }])
      .select()

    if (error) throw error

    res.status(201).json({ message: 'Ajouté aux favoris !', favori: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const retirerFavori = async (req, res) => {
  try {
    const { prestataire_id } = req.params
    const client_id = req.user.id

    const { error } = await supabase
      .from('favoris')
      .delete()
      .eq('client_id', client_id)
      .eq('prestataire_id', prestataire_id)

    if (error) throw error

    res.json({ message: 'Retiré des favoris' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getMesFavoris = async (req, res) => {
  try {
    const client_id = req.user.id

    const { data: favoris, error } = await supabase
      .from('favoris')
      .select('*, users:prestataire_id(id, nom, prenom, ville, code_postal, verifie, description)')
      .eq('client_id', client_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const prestataireIds = favoris.map(f => f.prestataire_id)

    const { data: services } = await supabase
      .from('services')
      .select('prestataire_id, categorie, titre, prix')
      .in('prestataire_id', prestataireIds)
      .eq('disponible', true)

    const resultats = favoris.map(f => ({
      ...f,
      services: services.filter(s => s.prestataire_id === f.prestataire_id)
    }))

    res.json({ favoris: resultats })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const verifierFavori = async (req, res) => {
  try {
    const { prestataire_id } = req.params
    const client_id = req.user.id

    const { data } = await supabase
      .from('favoris')
      .select('id')
      .eq('client_id', client_id)
      .eq('prestataire_id', prestataire_id)
      .single()

    res.json({ estFavori: !!data })
  } catch (error) {
    res.json({ estFavori: false })
  }
}

module.exports = { ajouterFavori, retirerFavori, getMesFavoris, verifierFavori }