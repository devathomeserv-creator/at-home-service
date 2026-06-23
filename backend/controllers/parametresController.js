const supabase = require('../config/supabase')

const getModeMaintenance = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('parametres_globaux')
      .select('valeur')
      .eq('cle', 'mode_maintenance')
      .single()

    if (error) throw error

    res.json({ mode_maintenance: data.valeur === 'true' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const modifierModeMaintenance = async (req, res) => {
  try {
    const { mode_maintenance } = req.body

    const { error } = await supabase
      .from('parametres_globaux')
      .update({ valeur: mode_maintenance ? 'true' : 'false', updated_at: new Date().toISOString() })
      .eq('cle', 'mode_maintenance')

    if (error) throw error

    res.json({ message: 'Mode maintenance mis à jour', mode_maintenance })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { getModeMaintenance, modifierModeMaintenance }