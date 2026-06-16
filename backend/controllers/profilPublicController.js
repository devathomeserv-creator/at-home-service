const supabase = require('../config/supabase')

const getProfilPublic = async (req, res) => {
  try {
    const { id } = req.params

    const { data: prestataire, error } = await supabase
      .from('users')
      .select('id, nom, prenom, photo_url, description, telephone, role')
      .eq('id', id)
      .eq('role', 'prestataire')
      .single()

    if (error || !prestataire) {
      return res.status(404).json({ message: 'Prestataire introuvable' })
    }

    const { data: services } = await supabase
      .from('services')
      .select('*')
      .eq('prestataire_id', id)
      .eq('disponible', true)

    const { data: avis } = await supabase
      .from('reviews')
      .select('*, users(prenom, nom), services(titre)')
      .in('service_id', services.map(s => s.id))
      .order('created_at', { ascending: false })

    const moyenne = avis && avis.length > 0
      ? (avis.reduce((acc, r) => acc + r.note, 0) / avis.length).toFixed(1)
      : 0

    res.json({ prestataire, services, avis, moyenne, totalAvis: avis?.length || 0 })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { getProfilPublic }