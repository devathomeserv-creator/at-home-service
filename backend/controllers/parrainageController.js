const supabase = require('../config/supabase')

const getMonParrainage = async (req, res) => {
  try {
    const user_id = req.user.id

    const { data: user } = await supabase
      .from('users')
      .select('code_parrainage')
      .eq('id', user_id)
      .single()

    const { data: filleuls, error } = await supabase
      .from('users')
      .select('id, prenom, nom, created_at')
      .eq('parraine_par', user_id)

    if (error) throw error

    res.json({ code_parrainage: user.code_parrainage, filleuls, totalFilleuls: filleuls.length })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { getMonParrainage }