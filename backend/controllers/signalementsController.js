const supabase = require('../config/supabase')

const creerSignalement = async (req, res) => {
  try {
    const { prestataire_id, motif, description } = req.body
    const client_id = req.user.id

    const { data, error } = await supabase
      .from('signalements')
      .insert([{ client_id, prestataire_id, motif, description }])
      .select()

    if (error) throw error

    res.status(201).json({ message: 'Signalement envoyé avec succès. Notre équipe va l\'examiner.', signalement: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getSignalements = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('signalements')
      .select('*, client:client_id(prenom, nom, email), prestataire:prestataire_id(prenom, nom, email)')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ signalements: data })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const modifierStatutSignalement = async (req, res) => {
  try {
    const { id } = req.params
    const { statut } = req.body

    const { data, error } = await supabase
      .from('signalements')
      .update({ statut })
      .eq('id', id)
      .select()

    if (error) throw error

    res.json({ message: 'Statut mis à jour', signalement: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { creerSignalement, getSignalements, modifierStatutSignalement }