const CLE_STOCKAGE = 'ahs_historique_recherche'
const MAX_HISTORIQUE = 5

export const ajouterRecherche = (terme) => {
  if (!terme || !terme.trim()) return

  const historique = getHistorique()
  const termeNettoye = terme.trim()

  const sansDoublon = historique.filter(h => h.toLowerCase() !== termeNettoye.toLowerCase())

  const nouvelHistorique = [termeNettoye, ...sansDoublon].slice(0, MAX_HISTORIQUE)

  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(nouvelHistorique))
}

export const getHistorique = () => {
  try {
    const data = localStorage.getItem(CLE_STOCKAGE)
    return data ? JSON.parse(data) : []
  } catch (err) {
    return []
  }
}

export const effacerHistorique = () => {
  localStorage.removeItem(CLE_STOCKAGE)
}

export const retirerRecherche = (terme) => {
  const historique = getHistorique()
  const nouvelHistorique = historique.filter(h => h !== terme)
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(nouvelHistorique))
}