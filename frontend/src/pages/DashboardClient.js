import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { getPrestatairesListe, creerReservation, mesReservationsClient, laisserAvis, creerPaiement, annulerReservation, modifierReservation, getProfilPublicPrestataire, getCreneauxOccupes, getMesConversations, getMesFavoris, retirerFavori, telechargerFacture, recupererPaiementIntent, ajouterListeAttente, getMaListeAttente, retirerListeAttente } from '../services/api'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { registerLocale } from 'react-datepicker'
import fr from 'date-fns/locale/fr'
import ChatModal from '../components/ChatModal'
registerLocale('fr', fr)

const imagesParCategorie = {
  coiffure: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=200&fit=crop',
  barber: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=200&fit=crop',
  esthetique: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=200&fit=crop',
  massage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=200&fit=crop',
  plomberie: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=300&h=200&fit=crop',
  electricite: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=200&fit=crop',
  maconnerie: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
  renovation: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop',
  'coach sportif': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
  photographe: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=300&h=200&fit=crop'
}

const EtoilesPetit = ({ note }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ fontSize: '14px', color: i <= Math.round(note) ? '#F6AD55' : '#CBD5E0' }}>★</span>
    ))}
  </div>
)

const joursMap = { 0: 'dimanche', 1: 'lundi', 2: 'mardi', 3: 'mercredi', 4: 'jeudi', 5: 'vendredi', 6: 'samedi' }
const drapeaux = { fr: '🇫🇷', en: '🇬🇧', it: '🇮🇹', ru: '🇷🇺' }

const DashboardClient = () => {
  const { user, logout } = useAuth()
  const { mode: themeMode, toggleTheme, couleurs: c } = useTheme()
  const { langue, changerLangue, t } = useLanguage()
  const navigate = useNavigate()
  const [prestataires, setPrestataires] = useState([])
  const [reservations, setReservations] = useState([])
  const [conversations, setConversations] = useState([])
  const [favoris, setFavoris] = useState([])
  const [listeAttente, setListeAttente] = useState([])
  const [vue, setVue] = useState('services')
  const [categorie, setCategorie] = useState('')
  const [recherche, setRecherche] = useState('')
  const [message, setMessage] = useState('')
  const [avisForm, setAvisForm] = useState({ booking_id: null, service_id: null, note: 5, commentaire: '' })
  const [showAvisForm, setShowAvisForm] = useState(false)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [showModifierModal, setShowModifierModal] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [bookingChat, setBookingChat] = useState(null)
  const [serviceSelectionne, setServiceSelectionne] = useState(null)
  const [reservationSelectionnee, setReservationSelectionnee] = useState(null)
  const [dateSelectionnee, setDateSelectionnee] = useState(null)
  const [dateModifiee, setDateModifiee] = useState(null)
  const [adresse, setAdresse] = useState('')
  const [adresseModifiee, setAdresseModifiee] = useState('')
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [selecteurLangueOuvert, setSelecteurLangueOuvert] = useState(false)
  const [joursTravail, setJoursTravail] = useState([])
  const [heureDebut, setHeureDebut] = useState('09:00')
  const [heureFin, setHeureFin] = useState('18:00')
  const [creneauxOccupes, setCreneauxOccupes] = useState([])
  const [telechargementEnCours, setTelechargementEnCours] = useState(null)
  const [consentementDonnees, setConsentementDonnees] = useState(false)

  const categories = ['coiffure', 'barber', 'esthetique', 'massage', 'plomberie', 'electricite', 'maconnerie', 'renovation', 'coach sportif', 'photographe']
  const categorieKey = (nom) => nom.replace(' ', '_')

  useEffect(() => {
    chargerPrestataires()
    chargerReservations()
    chargerConversations()
    chargerFavoris()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorie])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paiement = params.get('paiement')
    const service_id = params.get('service_id')
    const date_rdv = params.get('date_rdv')
    const adresseParam = params.get('adresse')
    const session_id = params.get('session_id')
    const consentementParam = params.get('consentement')

    if (paiement === 'succes' && service_id && date_rdv && adresseParam) {
      const finaliserReservation = async () => {
        let payment_intent_id = null
        try {
          if (session_id) {
            const resSession = await recupererPaiementIntent(session_id)
            payment_intent_id = resSession.data.payment_intent_id
          }
        } catch (err) {
          console.error(err)
        }

        try {
          await creerReservation({
            service_id,
            date_rdv,
            adresse_intervention: decodeURIComponent(adresseParam),
            payment_intent_id,
            consentement_donnees: consentementParam === 'true'
          })
          setMessage('Paiement réussi ! Votre réservation est confirmée !')
          setVue('reservations')
          chargerReservations()
          window.history.replaceState({}, '', '/client')
        } catch (err) {
          setMessage('Erreur lors de la création de la réservation')
        }
      }
      finaliserReservation()
    }

    if (paiement === 'annule') {
      setMessage('Paiement annulé. Vous pouvez réessayer.')
      window.history.replaceState({}, '', '/client')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const chargerPrestataires = async () => {
    try {
      const res = await getPrestatairesListe(categorie)
      setPrestataires(res.data.prestataires)
    } catch (err) {
      console.error(err)
    }
  }

  const chargerReservations = async () => {
    try {
      const res = await mesReservationsClient()
      setReservations(res.data.reservations)
    } catch (err) {
      console.error(err)
    }
  }

  const chargerConversations = async () => {
    try {
      const res = await getMesConversations()
      setConversations(res.data.conversations)
    } catch (err) {
      console.error(err)
    }
  }

  const chargerFavoris = async () => {
    try {
      const res = await getMesFavoris()
      setFavoris(res.data.favoris)
    } catch (err) {
      console.error(err)
    }
  }

  const chargerListeAttente = async () => {
    try {
      const res = await getMaListeAttente()
      setListeAttente(res.data.liste)
    } catch (err) {
      console.error(err)
    }
  }

  const handleRetirerFavori = async (prestataire_id) => {
    try {
      await retirerFavori(prestataire_id)
      setMessage('Retiré des favoris')
      chargerFavoris()
    } catch (err) {
      console.error(err)
    }
  }

  const ouvrirReservation = async (service, prestataire) => {
    setServiceSelectionne({ ...service, prestataire_id: prestataire.id })
    setDateSelectionnee(null)
    setAdresse('')
    setConsentementDonnees(false)
    setShowReservationModal(true)

    try {
      const resProfil = await getProfilPublicPrestataire(prestataire.id)
      setJoursTravail(resProfil.data.prestataire.jours_travail || [])
      setHeureDebut(resProfil.data.prestataire.heure_debut || '09:00')
      setHeureFin(resProfil.data.prestataire.heure_fin || '18:00')

      const resCreneaux = await getCreneauxOccupes(prestataire.id)
      setCreneauxOccupes(resCreneaux.data.creneauxOccupes || [])
    } catch (err) {
      console.error(err)
    }
  }

  const filtrerJourValide = (date) => {
    const jour = joursMap[date.getDay()]
    return joursTravail.includes(jour)
  }

  const estCreneauOccupe = (time) => {
    return creneauxOccupes.some(creneau => {
      const dateCreneau = new Date(creneau)
      return dateCreneau.getTime() === time.getTime()
    })
  }

  const filtrerHeureValide = (time) => {
    const heures = time.getHours()
    const minutes = time.getMinutes()
    const heureActuelle = `${String(heures).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

    if (heureActuelle < heureDebut || heureActuelle >= heureFin) return false

    return true
  }

  const confirmerReservation = async () => {
    if (!dateSelectionnee) {
      setMessage('Veuillez choisir une date et heure')
      return
    }
    if (!adresse) {
      setMessage('Veuillez entrer votre adresse')
      return
    }

    if (estCreneauOccupe(dateSelectionnee)) {
      setMessage('Ce créneau est déjà pris. Vous pouvez vous inscrire en liste d\'attente.')
      return
    }

    try {
      const res = await creerPaiement({
        service_id: serviceSelectionne.id,
        date_rdv: dateSelectionnee.toISOString(),
        adresse_intervention: adresse,
        consentement_donnees: consentementDonnees
      })
      window.location.href = res.data.url
    } catch (err) {
      setMessage('Erreur lors du paiement')
    }
  }

  const handleListeAttente = async () => {
    if (!dateSelectionnee) {
      setMessage('Veuillez choisir une date et heure pour la liste d\'attente')
      return
    }
    try {
      await ajouterListeAttente({
        service_id: serviceSelectionne.id,
        date_souhaitee: dateSelectionnee.toISOString()
      })
      setMessage('Vous êtes inscrit en liste d\'attente pour ce créneau ! Vous serez notifié par email s\'il se libère.')
      setShowReservationModal(false)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de l\'inscription')
    }
  }

  const handleRetirerListeAttente = async (id) => {
    try {
      await retirerListeAttente(id)
      setMessage('Retiré de la liste d\'attente')
      chargerListeAttente()
    } catch (err) {
      setMessage('Erreur lors du retrait')
    }
  }

  const handleAnnuler = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return
    try {
      const res = await annulerReservation(id)
      setMessage(res.data.message)
      chargerReservations()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de l\'annulation')
    }
  }

  const ouvrirModifier = (reservation) => {
    setReservationSelectionnee(reservation)
    setDateModifiee(new Date(reservation.date_rdv))
    setAdresseModifiee(reservation.adresse_intervention)
    setShowModifierModal(true)
  }

  const handleModifier = async () => {
    if (!dateModifiee) {
      setMessage('Veuillez choisir une date')
      return
    }
    try {
      await modifierReservation(reservationSelectionnee.id, {
        date_rdv: dateModifiee.toISOString(),
        adresse_intervention: adresseModifiee
      })
      setMessage('Réservation modifiée avec succès !')
      setShowModifierModal(false)
      chargerReservations()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de la modification')
    }
  }

  const ouvrirAvis = (reservation) => {
    setAvisForm({ booking_id: reservation.id, service_id: reservation.service_id, note: 5, commentaire: '' })
    setShowAvisForm(true)
  }

  const envoyerAvis = async () => {
    try {
      await laisserAvis(avisForm)
      setMessage('Merci pour votre avis !')
      setShowAvisForm(false)
      chargerReservations()
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de l'envoi")
    }
  }

  const ouvrirChat = (reservation) => {
    setBookingChat(reservation)
    setShowChat(true)
  }

  const fermerChat = () => {
    setShowChat(false)
    chargerConversations()
  }

  const handleTelechargerFacture = async (booking_id) => {
    setTelechargementEnCours(booking_id)
    try {
      await telechargerFacture(booking_id)
    } catch (err) {
      setMessage('Erreur lors du téléchargement de la facture')
    } finally {
      setTelechargementEnCours(null)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const filtrerCategorie = (cat) => {
    setCategorie(cat)
  }

  const statutColor = (statut) => {
    if (statut === 'confirme') return { bg: '#d1fae5', color: '#065f46' }
    if (statut === 'annule') return { bg: '#fee2e2', color: '#991b1b' }
    if (statut === 'termine') return { bg: '#EBF8FF', color: '#2B6CB0' }
    return { bg: '#fef3c7', color: '#92400e' }
  }

  const totalNonLus = conversations.reduce((acc, c2) => acc + c2.nonLus, 0)

  const prestatairesFiltres = recherche
    ? prestataires.filter(p =>
        `${p.prenom} ${p.nom}`.toLowerCase().includes(recherche.toLowerCase()) ||
        p.services.some(s => s.titre.toLowerCase().includes(recherche.toLowerCase()))
      )
    : prestataires

  return (
    <div style={{ minHeight: '100vh', background: c.fond, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @media (max-width: 600px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: block !important; }
          .tabs { flex-wrap: wrap !important; }
          .tabs button { flex: 1 !important; font-size: 12px !important; padding: 8px !important; }
          .cats { gap: 6px !important; }
          .cats button { padding: 4px 10px !important; font-size: 11px !important; }
          .presta-card { flex-direction: column !important; }
          .presta-image { width: 100% !important; height: 160px !important; }
        }
      `}</style>

      <nav style={{ background: c.bleu, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" fill={c.bleu}/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', lineHeight: 1.1 }}>At Home Service</div>
            <div style={{ fontSize: '9px', color: '#FEB2B2', letterSpacing: '2px', textTransform: 'uppercase' }}>services à domicile</div>
          </div>
        </div>
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
          <button onClick={() => setSelecteurLangueOuvert(!selecteurLangueOuvert)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>
            {drapeaux[langue]}
          </button>
          {selecteurLangueOuvert && (
            <div style={{ position: 'absolute', top: '100%', right: '7rem', marginTop: '8px', background: c.fondClair, borderRadius: '8px', border: `1px solid ${c.bordure}`, overflow: 'hidden', zIndex: 200 }}>
              {Object.keys(drapeaux).map(l => (
                <div key={l} onClick={() => { changerLangue(l); setSelecteurLangueOuvert(false) }} style={{ padding: '10px 16px', cursor: 'pointer', color: c.texteFonce, fontSize: '14px', background: langue === l ? c.bleuFond : 'transparent', whiteSpace: 'nowrap' }}>
                  {drapeaux[l]} {l.toUpperCase()}
                </div>
              ))}
            </div>
          )}
          <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>
            {themeMode === 'clair' ? '🌙' : '☀️'}
          </button>
          <span style={{ color: '#BEE3F8', fontSize: '14px' }}>{t('bonjour')} {user?.prenom} !</span>
          <button onClick={() => navigate('/profil')} style={{ background: 'white', color: c.bleu, border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{t('mon_profil')}</button>
          <button onClick={handleLogout} style={{ background: c.rouge, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{t('deconnexion')}</button>
        </div>
        <button onClick={() => setMenuOuvert(!menuOuvert)} className="nav-mobile" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'none' }}>
          <div style={{ width: '24px', height: '2px', background: 'white', margin: '5px 0' }}></div>
          <div style={{ width: '24px', height: '2px', background: 'white', margin: '5px 0' }}></div>
          <div style={{ width: '24px', height: '2px', background: 'white', margin: '5px 0' }}></div>
        </button>
        {menuOuvert && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: c.bleu, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 100, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {Object.keys(drapeaux).map(l => (
                <button key={l} onClick={() => changerLangue(l)} style={{ background: langue === l ? 'white' : 'rgba(255,255,255,0.2)', color: langue === l ? c.bleu : 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>{drapeaux[l]}</button>
              ))}
            </div>
            <p style={{ color: '#BEE3F8', fontSize: '14px', margin: 0 }}>{t('bonjour')} {user?.prenom} !</p>
            <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{themeMode === 'clair' ? '🌙' : '☀️'}</button>
            <button onClick={() => { navigate('/profil'); setMenuOuvert(false) }} style={{ background: 'white', color: c.bleu, border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{t('mon_profil')}</button>
            <button onClick={handleLogout} style={{ background: c.rouge, color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{t('deconnexion')}</button>
          </div>
        )}
      </nav>

      <div className="tabs" style={{ background: c.fondMoyen, padding: '16px 2rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => setVue('services')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === 'services' ? c.bleu : c.fondClair, color: vue === 'services' ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif' }}>{t('services_disponibles')}</button>
        <button onClick={() => setVue('reservations')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === 'reservations' ? c.bleu : c.fondClair, color: vue === 'reservations' ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif' }}>{t('mes_reservations')}</button>
        <button onClick={() => { setVue('attente'); chargerListeAttente() }} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === 'attente' ? c.bleu : c.fondClair, color: vue === 'attente' ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif' }}>{t('liste_attente')}</button>
        <button onClick={() => { setVue('favoris'); chargerFavoris() }} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === 'favoris' ? c.bleu : c.fondClair, color: vue === 'favoris' ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif' }}>{t('favoris')}</button>
        <button onClick={() => { setVue('messages'); chargerConversations() }} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === 'messages' ? c.bleu : c.fondClair, color: vue === 'messages' ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif', position: 'relative' }}>
          {t('messages')}
          {totalNonLus > 0 && <span style={{ background: c.rouge, color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', marginLeft: '6px' }}>{totalNonLus}</span>}
        </button>
      </div>

      <div style={{ flex: 1, maxWidth: '900px', margin: '2rem auto', padding: '0 1rem', width: '100%' }}>
        {message && <p style={{ background: c.fondClair, color: c.texteFonce, padding: '10px 16px', borderRadius: '8px', marginBottom: '1rem', border: `1px solid ${c.bordure}` }}>{message}</p>}

        {showChat && bookingChat && <ChatModal booking={bookingChat} onClose={fermerChat} />}

        {showReservationModal && serviceSelectionne && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: c.fondClair, borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '480px', border: `1px solid ${c.bordure}`, maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ color: c.texteFonce, marginBottom: '0.5rem' }}>{t('reserver_titre')} {serviceSelectionne.titre}</h3>
              <p style={{ color: c.rouge, fontWeight: 'bold', marginBottom: '1rem' }}>{serviceSelectionne.prix}€ · {serviceSelectionne.duree} min</p>
              <p style={{ color: c.texte, fontSize: '12px', marginBottom: '1rem', fontStyle: 'italic' }}>
                {t('disponible_label')} {joursTravail.join(', ')} {t('de_a')} {heureDebut} - {heureFin}
              </p>
              <p style={{ color: c.texte, marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>{t('choisir_date_heure')}</p>
              <DatePicker
                selected={dateSelectionnee}
                onChange={(date) => setDateSelectionnee(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="dd/MM/yyyy à HH:mm"
                minDate={new Date()}
                locale="fr"
                placeholderText="Cliquez pour choisir..."
                inline
                filterDate={filtrerJourValide}
                filterTime={filtrerHeureValide}
              />
              {dateSelectionnee && estCreneauOccupe(dateSelectionnee) && (
                <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '12px', marginBottom: '1rem', border: '1px solid #F6AD55' }}>
                  <p style={{ color: '#92400e', fontSize: '13px', margin: 0 }}>{t('creneau_pris_attente')}</p>
                </div>
              )}
              <p style={{ color: c.texte, margin: '1rem 0 8px', fontSize: '14px', fontWeight: 'bold' }}>{t('votre_adresse')}</p>
              <input placeholder={t('placeholder_adresse')} value={adresse} onChange={(e) => setAdresse(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: `1.5px solid ${c.bleuClair}`, background: c.inputFond, color: c.inputTexte, fontSize: '14px', marginBottom: '1rem', boxSizing: 'border-box' }} />

              <div style={{ background: c.blanc, borderRadius: '8px', padding: '12px', marginBottom: '1rem', border: `1px solid ${c.bleuClair}` }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={consentementDonnees}
                    onChange={(e) => setConsentementDonnees(e.target.checked)}
                    style={{ marginTop: '3px', flexShrink: 0 }}
                  />
                  <span style={{ color: c.texte, fontSize: '12px', lineHeight: 1.5 }}>
                    {t('consentement_texte')} <span onClick={() => navigate('/confidentialite')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>{t('en_savoir_plus')}</span>.
                  </span>
                </label>
              </div>

              <p style={{ color: c.texte, fontSize: '11px', marginBottom: '1rem', fontStyle: 'italic' }}>
                {t('annulation_gratuite_info')}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {dateSelectionnee && estCreneauOccupe(dateSelectionnee) ? (
                  <button onClick={handleListeAttente} style={{ flex: 1, background: '#F6AD55', color: '#1A365D', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: 'bold' }}>{t('rejoindre_liste_attente')}</button>
                ) : (
                  <button onClick={confirmerReservation} style={{ flex: 1, background: c.rouge, color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>{t('payer_reserver')}</button>
                )}
                <button onClick={() => setShowReservationModal(false)} style={{ background: c.fondClair, color: c.texteFonce, border: `1px solid ${c.bordure}`, padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{t('annuler')}</button>
              </div>
            </div>
          </div>
        )}

        {showModifierModal && reservationSelectionnee && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: c.fondClair, borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '480px', border: `1px solid ${c.bordure}`, maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ color: c.texteFonce, marginBottom: '1.5rem' }}>{t('modifier_reservation')}</h3>
              <p style={{ color: c.texte, marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>{t('nouvelle_date_heure')}</p>
              <DatePicker selected={dateModifiee} onChange={(date) => setDateModifiee(date)} showTimeSelect timeFormat="HH:mm" timeIntervals={30} dateFormat="dd/MM/yyyy à HH:mm" minDate={new Date()} locale="fr" inline />
              <p style={{ color: c.texte, margin: '1rem 0 8px', fontSize: '14px', fontWeight: 'bold' }}>{t('adresse_label')}</p>
              <input value={adresseModifiee} onChange={(e) => setAdresseModifiee(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: `1.5px solid ${c.bleuClair}`, background: c.inputFond, color: c.inputTexte, fontSize: '14px', marginBottom: '1.5rem', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={handleModifier} style={{ flex: 1, background: c.bleu, color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>{t('confirmer_modification')}</button>
                <button onClick={() => setShowModifierModal(false)} style={{ background: c.fondClair, color: c.texteFonce, border: `1px solid ${c.bordure}`, padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{t('annuler')}</button>
              </div>
            </div>
          </div>
        )}

        {showAvisForm && (
          <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: `1px solid ${c.bordure}` }}>
            <h3 style={{ color: c.texteFonce, marginBottom: '1rem' }}>{t('laisser_avis')}</h3>
            <p style={{ color: c.texte, marginBottom: '8px', fontSize: '14px' }}>{t('votre_note')}</p>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <span key={i} onClick={() => setAvisForm({ ...avisForm, note: i })} style={{ fontSize: '24px', cursor: 'pointer', color: i <= avisForm.note ? '#F6AD55' : '#CBD5E0' }}>★</span>
              ))}
            </div>
            <textarea placeholder={t('placeholder_commentaire')} value={avisForm.commentaire} onChange={(e) => setAvisForm({ ...avisForm, commentaire: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 14px', marginTop: '12px', marginBottom: '12px', borderRadius: '8px', border: `1.5px solid ${c.bleuClair}`, background: c.inputFond, color: c.inputTexte, fontSize: '14px', fontFamily: 'Georgia, serif' }} />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={envoyerAvis} style={{ background: c.bleu, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{t('publier_avis')}</button>
              <button onClick={() => setShowAvisForm(false)} style={{ background: c.fondClair, color: c.texteFonce, border: `1px solid ${c.bordure}`, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{t('annuler')}</button>
            </div>
          </div>
        )}

        {vue === 'services' && (
          <>
            <input placeholder={t('placeholder_recherche_presta')} value={recherche} onChange={(e) => setRecherche(e.target.value)} style={{ width: '100%', padding: '10px 14px', marginBottom: '1rem', borderRadius: '8px', border: `1.5px solid ${c.bleuClair}`, background: c.inputFond, color: c.inputTexte, fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Georgia, serif' }} />
            <div className="cats" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <button onClick={() => filtrerCategorie('')} style={{ padding: '6px 16px', borderRadius: '20px', border: `1.5px solid ${c.bleuClair}`, cursor: 'pointer', background: categorie === '' ? c.bleu : c.fondClair, color: categorie === '' ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif' }}>{t('tous')}</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => filtrerCategorie(cat)} style={{ padding: '6px 16px', borderRadius: '20px', border: `1.5px solid ${c.bleuClair}`, cursor: 'pointer', background: categorie === cat ? c.bleu : c.fondClair, color: categorie === cat ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif' }}>{t(categorieKey(cat))}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {prestatairesFiltres.length === 0 && <p style={{ color: c.texte }}>{t('aucun_prestataire_trouve')}</p>}
              {prestatairesFiltres.map(p => {
                const categoriePrincipale = p.services[0]?.categorie || 'coiffure'
                const prixMin = Math.min(...p.services.map(s => s.prix))
                return (
                  <div key={p.id} className="presta-card" style={{ background: c.fondClair, borderRadius: '12px', border: `1px solid ${c.bordure}`, display: 'flex', overflow: 'hidden' }}>
                    <div className="presta-image" onClick={() => navigate(`/prestataire/${p.id}`)} style={{ width: '180px', height: '160px', flexShrink: 0, overflow: 'hidden', cursor: 'pointer' }}>
                      {p.photo_url
                        ? <img src={p.photo_url} alt={p.prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <img src={imagesParCategorie[categoriePrincipale] || imagesParCategorie.coiffure} alt={categoriePrincipale} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      }
                    </div>
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 onClick={() => navigate(`/prestataire/${p.id}`)} style={{ margin: '0 0 4px', color: c.texteFonce, fontFamily: 'Georgia, serif', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', cursor: 'pointer' }}>
                          {p.prenom} {p.nom}
                          {p.verifie && <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '10px', padding: '2px 8px', borderRadius: '20px' }}>{t('verifie')}</span>}
                        </h3>
                        {(p.ville || p.code_postal) && <p style={{ color: c.texte, fontSize: '13px', margin: '0 0 6px' }}>📍 {p.ville} {p.code_postal}</p>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <EtoilesPetit note={p.moyenne} />
                          <span style={{ color: c.texte, fontSize: '12px' }}>{p.moyenne} ({p.totalAvis} {t('avis')})</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {p.services.map(s => (
                            <span key={s.titre} style={{ background: c.bleuFond, color: c.bleu, padding: '2px 8px', borderRadius: '20px', fontSize: '11px' }}>{s.titre} — {s.prix}€</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                        <span style={{ color: c.texte, fontSize: '13px' }}>{t('a_partir_de')} <strong style={{ color: c.rouge, fontSize: '16px' }}>{prixMin}€</strong></span>
                        <button onClick={() => ouvrirReservation(p.services[0], p)} style={{ background: c.rouge, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{t('reserver')}</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {vue === 'reservations' && (
          <div>
            {reservations.length === 0 && <p style={{ color: c.texte }}>{t('aucune_reservation')}</p>}
            {reservations.map(res => {
              const sc = statutColor(res.statut)
              return (
                <div key={res.id} style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: `1px solid ${c.bordure}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ margin: 0, color: c.texteFonce }}>{res.services?.titre}</h3>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', background: sc.bg, color: sc.color }}>{res.statut}</span>
                  </div>
                  <p style={{ color: c.texte, marginTop: '0.5rem' }}>{t('date_label')} {new Date(res.date_rdv).toLocaleString('fr-FR')}</p>
                  <p style={{ color: c.texte }}>{t('adresse_intervention_label')} {res.adresse_intervention}</p>
                  {res.statut === 'annule' && res.rembourse && (
                    <p style={{ color: '#065f46', fontSize: '13px', marginTop: '4px' }}>{t('rembourse_auto')}</p>
                  )}

                  {(res.statut === 'en_attente' || res.statut === 'confirme') && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', flexWrap: 'wrap' }}>
                      <button onClick={() => ouvrirModifier(res)} style={{ background: c.bleu, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px' }}>{t('modifier')}</button>
                      <button onClick={() => handleAnnuler(res.id)} style={{ background: c.rouge, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px' }}>✗ {t('annuler')}</button>
                    </div>
                  )}

                  {res.statut === 'termine' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', flexWrap: 'wrap' }}>
                      <button onClick={() => ouvrirAvis(res)} style={{ background: '#F6AD55', color: '#1A365D', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>{t('laisser_avis_btn')}</button>
                      <button onClick={() => handleTelechargerFacture(res.id)} disabled={telechargementEnCours === res.id} style={{ background: c.texteFonce, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px' }}>
                        {telechargementEnCours === res.id ? t('telechargement_facture') : t('telecharger_facture')}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {vue === 'attente' && (
          <div>
            {listeAttente.length === 0 && <p style={{ color: c.texte }}>{t('aucune_liste_attente')}</p>}
            {listeAttente.map(item => (
              <div key={item.id} style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: `1px solid ${c.bordure}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, color: c.texteFonce }}>{item.services?.titre}</h3>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', background: item.statut === 'notifie' ? '#d1fae5' : '#fef3c7', color: item.statut === 'notifie' ? '#065f46' : '#92400e' }}>
                    {item.statut === 'notifie' ? t('creneau_libere') : t('en_attente_statut')}
                  </span>
                </div>
                <p style={{ color: c.texte, marginTop: '0.5rem' }}>{t('prestataire_label')} {item.services?.users?.prenom} {item.services?.users?.nom}</p>
                <p style={{ color: c.texte }}>{t('date_souhaitee_label')} {new Date(item.date_souhaitee).toLocaleString('fr-FR')}</p>
                {item.statut === 'en_attente' && (
                  <button onClick={() => handleRetirerListeAttente(item.id)} style={{ background: c.rouge, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px', marginTop: '1rem' }}>{t('quitter_attente')}</button>
                )}
              </div>
            ))}
          </div>
        )}

        {vue === 'favoris' && (
          <div>
            {favoris.length === 0 && <p style={{ color: c.texte }}>{t('aucun_favori')}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {favoris.map(fav => (
                <div key={fav.id} style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 4px', color: c.texteFonce, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {fav.users?.prenom} {fav.users?.nom}
                      {fav.users?.verifie && <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '10px', padding: '1px 6px', borderRadius: '20px' }}>✅</span>}
                    </h3>
                    <button onClick={() => handleRetirerFavori(fav.prestataire_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>❤️</button>
                  </div>
                  {fav.users?.ville && <p style={{ color: c.texte, fontSize: '13px', margin: '0 0 8px' }}>📍 {fav.users.ville} {fav.users.code_postal}</p>}
                  {fav.services?.length > 0 && (
                    <p style={{ color: c.texte, fontSize: '12px', marginBottom: '1rem' }}>
                      {fav.services.map(s => s.categorie).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                    </p>
                  )}
                  <button onClick={() => navigate(`/prestataire/${fav.prestataire_id}`)} style={{ width: '100%', background: c.bleu, color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{t('voir_profil')}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {vue === 'messages' && (
          <div>
            {conversations.length === 0 && <p style={{ color: c.texte }}>{t('aucune_conversation')}</p>}
            {conversations.map(conv => (
              <div key={conv.id} onClick={() => ouvrirChat(conv)} style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: `1px solid ${c.bordure}`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', color: c.texteFonce }}>{conv.users?.prenom} {conv.users?.nom}</h3>
                  <p style={{ color: c.texte, fontSize: '13px', margin: 0 }}>{conv.services?.titre} — {new Date(conv.date_rdv).toLocaleDateString('fr-FR')}</p>
                </div>
                {conv.nonLus > 0 && (
                  <span style={{ background: c.rouge, color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>{conv.nonLus}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{ background: c.texteFonce, color: '#BEE3F8', textAlign: 'center', padding: '1rem', fontSize: '13px' }}>
        {t('footer_droits')}
      </footer>
    </div>
  )
}

export default DashboardClient