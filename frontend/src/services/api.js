import axios from 'axios'

const API = axios.create({
  baseURL: 'https://loving-nature-production-145d.up.railway.app/api'
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const inscription = (data) => API.post('/auth/inscription', data)
export const connexion = (data) => API.post('/auth/connexion', data)
export const getServices = (categorie, ville) => API.get('/services', { params: { categorie, ville } })
export const creerService = (data) => API.post('/services', data)
export const modifierService = (id, data) => API.put(`/services/${id}`, data)
export const supprimerService = (id) => API.delete(`/services/${id}`)
export const mesServices = () => API.get('/services/mes-services')
export const creerReservation = (data) => API.post('/bookings', data)
export const mesReservationsClient = () => API.get('/bookings/client')
export const mesReservationsPrestataire = () => API.get('/bookings/prestataire')
export const modifierStatut = (id, statut) => API.put(`/bookings/${id}/statut`, { statut })
export const annulerReservation = (id) => API.put(`/bookings/${id}/annuler`)
export const modifierReservation = (id, data) => API.put(`/bookings/${id}/modifier`, data)
export const laisserAvis = (data) => API.post('/reviews', data)
export const getAvisService = (service_id) => API.get(`/reviews/service/${service_id}`)
export const getMesAvis = () => API.get('/reviews/mes-avis')
export const repondreAvis = (id, reponse) => API.put(`/reviews/${id}/repondre`, { reponse })
export const creerPaiement = (data) => API.post('/stripe/paiement', data)
export const recupererPaiementIntent = (session_id) => API.get(`/stripe/session/${session_id}`)
export const getProfil = () => API.get('/profil')
export const modifierProfil = (data) => API.put('/profil', data)
export const changerMotDePasse = (data) => API.put('/profil/mot-de-passe', data)
export const supprimerCompte = () => API.delete('/profil')
export const modifierConfirmationAuto = (confirmation_auto) => API.put('/profil/confirmation-auto', { confirmation_auto })
export const modifierDisponibilites = (data) => API.put('/profil/disponibilites', data)
export const getProfilPublicPrestataire = (id) => API.get(`/prestataire/${id}`)
export const getCreneauxOccupes = (prestataire_id) => API.get(`/prestataire/${prestataire_id}/creneaux-occupes`)
export const envoyerMessage = (data) => API.post('/messages', data)
export const getMessages = (booking_id) => API.get(`/messages/${booking_id}`)
export const getMessagesNonLus = () => API.get('/messages/non-lus')
export const getMesConversations = () => API.get('/messages/conversations')
export const verifierSiret = (siret) => API.post('/verification/siret', { siret })
export const getPrestatairesCarte = () => API.get('/carte')
export const getStatsPrestataire = () => API.get('/stats/prestataire')
export const ajouterFavori = (prestataire_id) => API.post('/favoris', { prestataire_id })
export const retirerFavori = (prestataire_id) => API.delete(`/favoris/${prestataire_id}`)
export const getMesFavoris = () => API.get('/favoris')
export const verifierFavori = (prestataire_id) => API.get(`/favoris/verifier/${prestataire_id}`)
export const getPrestatairesListe = (categorie, ville) => API.get('/prestataires', { params: { categorie, ville } })
export const ajouterRealisation = (data) => API.post('/realisations', data)
export const getMesRealisations = () => API.get('/realisations/mes-realisations')
export const getRealisationsPrestataire = (prestataire_id) => API.get(`/realisations/prestataire/${prestataire_id}`)
export const supprimerRealisation = (id) => API.delete(`/realisations/${id}`)
export const getMonParrainage = () => API.get('/parrainage')
export const creerSignalement = (data) => API.post('/signalements', data)
export const getSignalements = () => API.get('/signalements')
export const modifierStatutSignalement = (id, statut) => API.put(`/signalements/${id}/statut`, { statut })
export const telechargerFacture = async (booking_id) => {
  const token = localStorage.getItem('token')
  const response = await fetch(`https://loving-nature-production-145d.up.railway.app/api/facture/${booking_id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!response.ok) throw new Error('Erreur lors du téléchargement')
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `facture-${booking_id.slice(0, 8)}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}