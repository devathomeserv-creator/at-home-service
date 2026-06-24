const supabase = require('../config/supabase')
const bcrypt = require('bcryptjs')
const axios = require('axios')

const getProfil = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nom, prenom, email, role, telephone, adresse, photo_url, confirmation_auto, description, jours_travail, heure_debut, heure_fin, ville, code_postal, siret, verifie, latitude, longitude, lien_google, langues_parlees, langue_preferee, created_at')
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
    const { nom, prenom, telephone, adresse, description, ville, code_postal, lien_google, langues_parlees } = req.body

    let latitude = null
    let longitude = null

    if (adresse && ville) {
      try {
        const adresseComplete = `${adresse} ${code_postal || ''} ${ville}`
        const geoRes = await axios.get(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresseComplete)}&limit=1`)
        if (geoRes.data.features && geoRes.data.features.length > 0) {
          const coords = geoRes.data.features[0].geometry.coordinates
          longitude = coords[0]
          latitude = coords[1]
        }
      } catch (geoError) {
        console.error('Erreur géolocalisation:', geoError.message)
      }
    }

    const updateData = { nom, prenom, telephone, adresse, description, ville, code_postal, lien_google, langues_parlees }
    if (latitude && longitude) {
      updateData.latitude = latitude
      updateData.longitude = longitude
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()

    if (error) throw error
    res.json({ message: 'Profil mis à jour avec succès', user: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const modifierLanguePreferee = async (req, res) => {
  try {
    const { langue_preferee } = req.body

    const { error } = await supabase
      .from('users')
      .update({ langue_preferee })
      .eq('id', req.user.id)

    if (error) throw error
    res.json({ message: 'Langue mise à jour' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const modifierConfirmationAuto = async (req, res) => {
  try {
    const { confirmation_auto } = req.body

    const { data, error } = await supabase
      .from('users')
      .update({ confirmation_auto })
      .eq('id', req.user.id)
      .select()

    if (error) throw error
    res.json({ message: 'Paramètre mis à jour', user: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const modifierDisponibilites = async (req, res) => {
  try {
    const { jours_travail, heure_debut, heure_fin } = req.body

    const { data, error } = await supabase
      .from('users')
      .update({ jours_travail, heure_debut, heure_fin })
      .eq('id', req.user.id)
      .select()

    if (error) throw error
    res.json({ message: 'Disponibilités mises à jour', user: data[0] })
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

module.exports = { getProfil, modifierProfil, modifierLanguePreferee, modifierConfirmationAuto, modifierDisponibilites, changerMotDePasse, supprimerCompte }