const supabase = require('../config/supabase')

const creerService = async (req, res) => {
  try {
    const { categorie, titre, description, prix, duree } = req.body
    const prestataire_id = req.user.id

    const { data, error } = await supabase
      .from('services')
      .insert([{ prestataire_id, categorie, titre, description, prix, duree }])
      .select()

    if (error) throw error

    res.status(201).json({ message: 'Service créé avec succès', service: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const obtenirServices = async (req, res) => {
  try {
    const { categorie } = req.query

    let query = supabase
      .from('services')
      .select('*, users(id, nom, prenom)')
      .eq('disponible', true)

    if (categorie) {
      query = query.eq('categorie', categorie)
    }

    const { data, error } = await query

    if (error) throw error

    res.json({ services: data })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const obtenirMonService = async (req, res) => {
  try {
    const prestataire_id = req.user.id

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('prestataire_id', prestataire_id)

    if (error) throw error

    res.json({ services: data })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const modifierService = async (req, res) => {
  try {
    const { id } = req.params
    const { titre, description, prix, duree, disponible } = req.body

    const { data, error } = await supabase
      .from('services')
      .update({ titre, description, prix, duree, disponible })
      .eq('id', id)
      .eq('prestataire_id', req.user.id)
      .select()

    if (error) throw error

    res.json({ message: 'Service modifié avec succès', service: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { creerService, obtenirServices, obtenirMonService, modifierService }