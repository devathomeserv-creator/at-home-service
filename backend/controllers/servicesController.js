const supabase = require('../config/supabase')

const creerService = async (req, res) => {
  try {
    const { categorie, titre, description, prix, duree, photo_url } = req.body
    const prestataire_id = req.user.id

    const { data, error } = await supabase
      .from('services')
      .insert([{ prestataire_id, categorie, titre, description, prix, duree, photo_url }])
      .select()

    if (error) throw error

    res.status(201).json({ message: 'Service créé avec succès', service: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const obtenirServices = async (req, res) => {
  try {
    const { categorie, ville } = req.query

    let query = supabase
      .from('services')
      .select('*, users(id, nom, prenom, ville, code_postal, verifie)')
      .eq('disponible', true)

    if (categorie) {
      query = query.eq('categorie', categorie)
    }

    const { data, error } = await query

    if (error) throw error

    let resultats = data

    if (ville) {
      const rechercheLower = ville.toLowerCase().trim()
      resultats = resultats.filter(s =>
        s.users?.ville?.toLowerCase().includes(rechercheLower) ||
        s.users?.code_postal?.includes(rechercheLower)
      )
    }

    res.json({ services: resultats })
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
    const { categorie, titre, description, prix, duree, disponible, photo_url } = req.body

    const { data, error } = await supabase
      .from('services')
      .update({ categorie, titre, description, prix, duree, disponible, photo_url })
      .eq('id', id)
      .eq('prestataire_id', req.user.id)
      .select()

    if (error) throw error

    res.json({ message: 'Service modifié avec succès', service: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const supprimerService = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)
      .eq('prestataire_id', req.user.id)

    if (error) throw error

    res.json({ message: 'Service supprimé avec succès' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { creerService, obtenirServices, obtenirMonService, modifierService, supprimerService }