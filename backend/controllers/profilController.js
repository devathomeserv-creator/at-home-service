const supabase = require('../config/supabase')
const bcrypt = require('bcryptjs')

const getProfil = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nom, prenom, email, role, telephone, adresse, photo_url, created_at')
      .eq('id', req.user.id)
      .single()

    if (error) throw error
    res.json({ user: data })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const modifierProfil = async (req, res) => {
  try {
    const { nom, prenom, telephone, adresse } = req.body

    const { data, error } = await supabase
      .from('users')
      .update({ nom, prenom, telephone, adresse })
      .eq('id', req.user.id)
      .select()

    if (error) throw error
    res.json({ message: 'Profil mis à jour avec succès', user: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const changerMotDePasse = async (req, res) => {
  try {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body

    const { data: user } = await supabase
      .from('users')
      .select('mot_de_passe')
      .eq('id', req.user.id)
      .single()

    const valide = await bcrypt.compare(ancien_mot_de_passe, user.mot_de_passe)
    if (!valide) {
      return res.status(400).json({ message: 'Ancien mot de passe incorrect' })
    }

    const hash = await bcrypt.hash(nouveau_mot_de_passe, 10)

    const { error } = await supabase
      .from('users')
      .update({ mot_de_passe: hash })
      .eq('id', req.user.id)

    if (error) throw error
    res.json({ message: 'Mot de passe modifié avec succès' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const supprimerCompte = async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.user.id)

    if (error) throw error
    res.json({ message: 'Compte supprimé avec succès' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { getProfil, modifierProfil, changerMotDePasse, supprimerCompte }