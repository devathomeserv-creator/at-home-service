const supabase = require('../config/supabase')

const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ users: data })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getReservations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(*), users(*)')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ reservations: data })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const supprimerUser = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Utilisateur supprimé avec succès' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { getUsers, getReservations, supprimerUser }