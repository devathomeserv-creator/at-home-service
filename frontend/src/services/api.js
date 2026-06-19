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
export const getServices = (categorie) => API.get('/services', { params: { categorie } })
export const creerService = (data) => API.post('/services', data)
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
export const creerPaiement = (data) => API.post('/stripe/paiement', data)
export const getProfil = () => API.get('/profil')
export const modifierProfil = (data) => API.put('/profil', data)
export const changerMotDePasse = (data) => API.put('/profil/mot-de-passe', data)
export const supprimerCompte = () => API.delete('/profil')
export const modifierConfirmationAuto = (confirmation_auto) => API.put('/profil/confirmation-auto', { confirmation_auto })
export const modifierDisponibilites = (data) => API.put('/profil/disponibilites', data)
export const getProfilPublicPrestataire = (id) => API.get(`/prestataire/${id}`)
export const getCreneauxOccupes = (prestataire_id) => API.get(`/prestataire/${prestataire_id}/creneaux-occupes`)