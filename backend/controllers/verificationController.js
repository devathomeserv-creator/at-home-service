const supabase = require('../config/supabase')
const axios = require('axios')

const verifierSiret = async (req, res) => {
  try {
    const { siret } = req.body
    const user_id = req.user.id

    if (!siret || siret.length !== 14) {
      return res.status(400).json({ message: 'Le SIRET doit contenir 14 chiffres' })
    }

    const response = await axios.get(`https://recherche-entreprises.api.gouv.fr/search?q=${siret}`)

    const resultats = response.data.results

    if (!resultats || resultats.length === 0) {
      return res.status(404).json({ message: 'Ce SIRET n\'existe pas dans le registre officiel' })
    }

    const entreprise = resultats[0]
    const etablissementTrouve = entreprise.matching_etablissements?.find(e => e.siret === siret) || entreprise.siege

    if (!etablissementTrouve || etablissementTrouve.siret !== siret) {
      return res.status(404).json({ message: 'Ce SIRET n\'a pas été trouvé précisément' })
    }

    const estActif = etablissementTrouve.etat_administratif === 'A'

    if (!estActif) {
      return res.status(400).json({ message: 'Cette entreprise n\'est plus active' })
    }

    const { data, error } = await supabase
      .from('users')
      .update({ siret, verifie: true })
      .eq('id', user_id)
      .select()

    if (error) throw error

    res.json({
      message: 'SIRET vérifié avec succès ! Votre profil est maintenant certifié.',
      verifie: true,
      entreprise: entreprise.nom_complet || entreprise.nom_raison_sociale,
      user: data[0]
    })
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'SIRET introuvable dans le registre officiel' })
    }
    res.status(500).json({ message: 'Erreur lors de la vérification', error: error.message })
  }
}

module.exports = { verifierSiret }