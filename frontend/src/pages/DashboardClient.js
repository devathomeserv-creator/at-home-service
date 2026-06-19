import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getServices, creerReservation, mesReservationsClient, laisserAvis, creerPaiement, annulerReservation, modifierReservation, getProfilPublicPrestataire, getCreneauxOccupes, getMesConversations, getMesFavoris, retirerFavori } from '../services/api'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { registerLocale } from 'react-datepicker'
import fr from 'date-fns/locale/fr'
import ChatModal from '../components/ChatModal'
registerLocale('fr', fr)

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" fill="#2B6CB0"/>
      </svg>
    </div>
    <div>
      <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', lineHeight: 1.1 }}>At Home Service</div>
      <div style={{ fontSize: '9px', color: '#FEB2B2', letterSpacing: '2px', textTransform: 'uppercase' }}>services à domicile</div>
    </div>
  </div>
)

const Etoiles = ({ note, onSelect }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} onClick={() => onSelect && onSelect(i)} style={{ fontSize: '24px', cursor: onSelect ? 'pointer' : 'default', color: i <= note ? '#F6AD55' : '#CBD5E0' }}>★</span>
    ))}
  </div>
)

const joursMap = { 0: 'dimanche', 1: 'lundi', 2: 'mardi', 3: 'mercredi', 4: 'jeudi', 5: 'vendredi', 6: 'samedi' }

const DashboardClient = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [reservations, setReservations] = useState([])
  const [conversations, setConversations] = useState([])
  const [favoris, setFavoris] = useState([])
  const [vue, setVue] = useState('services')
  const [categorie, setCategorie] = useState('')
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
  const [joursTravail, setJoursTravail] = useState([])
  const [heureDebut, setHeureDebut] = useState('09:00')
  const [heureFin, setHeureFin] = useState('18:00')
  const [creneauxOccupes, setCreneauxOccupes] = useState([])

  const categories = ['coiffure', 'barber', 'esthetique', 'massage', 'plomberie', 'electricite', 'maconnerie', 'renovation', 'coach sportif', 'photographe']

  useEffect(() => {
    chargerServices()
    chargerReservations()
    chargerConversations()
    chargerFavoris()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paiement = params.get('paiement')
    const service_id = params.get('service_id')
    const date_rdv = params.get('date_rdv')
    const adresseParam = params.get('adresse')

    if (paiement === 'succes' && service_id && date_rdv && adresseParam) {
      creerReservation({
        service_id,
        date_rdv,
        adresse_intervention: decodeURIComponent(adresseParam)
      }).then(() => {
        setMessage('Paiement réussi ! Votre réservation est confirmée !')
        setVue('reservations')
        chargerReservations()
        window.history.replaceState({}, '', '/client')
      }).catch(() => {
        setMessage('Erreur lors de la création de la réservation')
      })
    }

    if (paiement === 'annule') {
      setMessage('Paiement annulé. Vous pouvez réessayer.')
      window.history.replaceState({}, '', '/client')
    }
  }, [])

  const chargerServices = async (cat) => {
    try {
      const res = await getServices(cat)
      setServices(res.data.services)
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

  const handleRetirerFavori = async (prestataire_id) => {
    try {
      await retirerFavori(prestataire_id)
      setMessage('Retiré des favoris')
      chargerFavoris()
    } catch (err) {
      console.error(err)
    }
  }

  const ouvrirReservation = async (service) => {
    setServiceSelectionne(service)
    setDateSelectionnee(null)
    setAdresse('')
    setShowReservationModal(true)

    try {
      const prestataireId = service.users?.id || service.prestataire_id
      const resProfil = await getProfilPublicPrestataire(prestataireId)
      setJoursTravail(resProfil.data.prestataire.jours_travail || [])
      setHeureDebut(resProfil.data.prestataire.heure_debut || '09:00')
      setHeureFin(resProfil.data.prestataire.heure_fin || '18:00')

      const resCreneaux = await getCreneauxOccupes(prestataireId)
      setCreneauxOccupes(resCreneaux.data.creneauxOccupes || [])
    } catch (err) {
      console.error(err)
    }
  }

  const filtrerJourValide = (date) => {
    const jour = joursMap[date.getDay()]
    return joursTravail.includes(jour)
  }

  const filtrerHeureValide = (time) => {
    const heures = time.getHours()
    const minutes = time.getMinutes()
    const heureActuelle = `${String(heures).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

    if (heureActuelle < heureDebut || heureActuelle >= heureFin) return false

    const estOccupe = creneauxOccupes.some(creneau => {
      const dateCreneau = new Date(creneau)
      return dateCreneau.getTime() === time.getTime()
    })

    return !estOccupe
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
    try {
      const res = await creerPaiement({
        service_id: serviceSelectionne.id,
        date_rdv: dateSelectionnee.toISOString(),
        adresse_intervention: adresse
      })
      window.location.href = res.data.url
    } catch (err) {
      setMessage('Erreur lors du paiement')
    }
  }

  const handleAnnuler = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return
    try {
      await annulerReservation(id)
      setMessage('Réservation annulée avec succès')
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

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const filtrerCategorie = (cat) => {
    setCategorie(cat)
    chargerServices(cat)
  }

  const statutColor = (statut) => {
    if (statut === 'confirme') return { bg: '#d1fae5', color: '#065f46' }
    if (statut === 'annule') return { bg: '#fee2e2', color: '#991b1b' }
    if (statut === 'termine') return { bg: '#EBF8FF', color: '#2B6CB0' }
    return { bg: '#fef3c7', color: '#92400e' }
  }

  const totalNonLus = conversations.reduce((acc, c) => acc + c.nonLus, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#C8A97A', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @media (max-width: 600px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: block !important; }
          .tabs { flex-wrap: wrap !important; }
          .tabs button { flex: 1 !important; font-size: 12px !important; padding: 8px !important; }
          .cats { gap: 6px !important; }
          .cats button { padding: 4px 10px !important; font-size: 11px !important; }
        }
      `}</style>

      <nav style={{ background: '#2B6CB0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <Logo />
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#BEE3F8', fontSize: '14px' }}>Bonjour {user?.prenom} !</span>
          <button onClick={() => navigate('/profil')} style={{ background: 'white', color: '#2B6CB0', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Mon profil</button>
          <button onClick={handleLogout} style={{ background: '#C53030', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Déconnexion</button>
        </div>
        <button onClick={() => setMenuOuvert(!menuOuvert)} className="nav-mobile" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'none' }}>
          <div style={{ width: '24px', height: '2px', background: 'white', margin: '5px 0' }}></div>
          <div style={{ width: '24px', height: '2px', background: 'white', margin: '5px 0' }}></div>
          <div style={{ width: '24px', height: '2px', background: 'white', margin: '5px 0' }}></div>
        </button>
        {menuOuvert && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#2B6CB0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 100, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <p style={{ color: '#BEE3F8', fontSize: '14px', margin: 0 }}>Bonjour {user?.prenom} !</p>
            <button onClick={() => { navigate('/profil'); setMenuOuvert(false) }} style={{ background: 'white', color: '#2B6CB0', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Mon profil</button>
            <button onClick={handleLogout} style={{ background: '#C53030', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Déconnexion</button>
          </div>
        )}
      </nav>

      <div className="tabs" style={{ background: '#B8926A', padding: '16px 2rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => setVue('services')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === 'services' ? '#2B6CB0' : '#F5ECD8', color: vue === 'services' ? 'white' : '#1A365D', fontFamily: 'Georgia, serif' }}>Services disponibles</button>
        <button onClick={() => setVue('reservations')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === 'reservations' ? '#2B6CB0' : '#F5ECD8', color: vue === 'reservations' ? 'white' : '#1A365D', fontFamily: 'Georgia, serif' }}>Mes réservations</button>
        <button onClick={() => { setVue('favoris'); chargerFavoris() }} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === 'favoris' ? '#2B6CB0' : '#F5ECD8', color: vue === 'favoris' ? 'white' : '#1A365D', fontFamily: 'Georgia, serif' }}>❤️ Favoris</button>
        <button onClick={() => { setVue('messages'); chargerConversations() }} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === 'messages' ? '#2B6CB0' : '#F5ECD8', color: vue === 'messages' ? 'white' : '#1A365D', fontFamily: 'Georgia, serif', position: 'relative' }}>
          💬 Messages
          {totalNonLus > 0 && <span style={{ background: '#C53030', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', marginLeft: '6px' }}>{totalNonLus}</span>}
        </button>
      </div>

      <div style={{ flex: 1, maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem', width: '100%' }}>
        {message && <p style={{ background: '#F5ECD8', color: '#1A365D', padding: '10px 16px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #A07840' }}>{message}</p>}

        {showChat && bookingChat && <ChatModal booking={bookingChat} onClose={fermerChat} />}

        {showReservationModal && serviceSelectionne && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: '#F5ECD8', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '480px', border: '1px solid #A07840', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ color: '#1A365D', marginBottom: '0.5rem' }}>Réserver — {serviceSelectionne.titre}</h3>
              <p style={{ color: '#C53030', fontWeight: 'bold', marginBottom: '1rem' }}>{serviceSelectionne.prix}€ · {serviceSelectionne.duree} min</p>
              <p style={{ color: '#3D2B0F', fontSize: '12px', marginBottom: '1rem', fontStyle: 'italic' }}>
                Disponible : {joursTravail.join(', ')} de {heureDebut} à {heureFin}
              </p>
              <p style={{ color: '#3D2B0F', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Choisissez une date et heure :</p>
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
              <p style={{ color: '#3D2B0F', margin: '1rem 0 8px', fontSize: '14px', fontWeight: 'bold' }}>Votre adresse :</p>
              <input placeholder="Ex: 12 rue de la Paix, Nice" value={adresse} onChange={(e) => setAdresse(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #90CDF4', background: 'white', color: '#1A202C', fontSize: '14px', marginBottom: '1.5rem', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={confirmerReservation} style={{ flex: 1, background: '#C53030', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>Payer et réserver</button>
                <button onClick={() => setShowReservationModal(false)} style={{ background: '#F5ECD8', color: '#1A365D', border: '1px solid #A07840', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {showModifierModal && reservationSelectionnee && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: '#F5ECD8', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '480px', border: '1px solid #A07840', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ color: '#1A365D', marginBottom: '1.5rem' }}>Modifier la réservation</h3>
              <p style={{ color: '#3D2B0F', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Nouvelle date et heure :</p>
              <DatePicker selected={dateModifiee} onChange={(date) => setDateModifiee(date)} showTimeSelect timeFormat="HH:mm" timeIntervals={30} dateFormat="dd/MM/yyyy à HH:mm" minDate={new Date()} locale="fr" inline />
              <p style={{ color: '#3D2B0F', margin: '1rem 0 8px', fontSize: '14px', fontWeight: 'bold' }}>Adresse :</p>
              <input value={adresseModifiee} onChange={(e) => setAdresseModifiee(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #90CDF4', background: 'white', color: '#1A202C', fontSize: '14px', marginBottom: '1.5rem', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={handleModifier} style={{ flex: 1, background: '#2B6CB0', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>Confirmer la modification</button>
                <button onClick={() => setShowModifierModal(false)} style={{ background: '#F5ECD8', color: '#1A365D', border: '1px solid #A07840', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {showAvisForm && (
          <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #A07840' }}>
            <h3 style={{ color: '#1A365D', marginBottom: '1rem' }}>Laisser un avis</h3>
            <p style={{ color: '#3D2B0F', marginBottom: '8px', fontSize: '14px' }}>Votre note :</p>
            <Etoiles note={avisForm.note} onSelect={(n) => setAvisForm({ ...avisForm, note: n })} />
            <textarea placeholder="Votre commentaire..." value={avisForm.commentaire} onChange={(e) => setAvisForm({ ...avisForm, commentaire: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 14px', marginTop: '12px', marginBottom: '12px', borderRadius: '8px', border: '1.5px solid #90CDF4', background: 'white', color: '#1A202C', fontSize: '14px', fontFamily: 'Georgia, serif' }} />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={envoyerAvis} style={{ background: '#2B6CB0', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Publier l'avis</button>
              <button onClick={() => setShowAvisForm(false)} style={{ background: '#F5ECD8', color: '#1A365D', border: '1px solid #A07840', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Annuler</button>
            </div>
          </div>
        )}

        {vue === 'services' && (
          <>
            <div className="cats" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <button onClick={() => filtrerCategorie('')} style={{ padding: '6px 16px', borderRadius: '20px', border: '1.5px solid #90CDF4', cursor: 'pointer', background: categorie === '' ? '#2B6CB0' : '#F5ECD8', color: categorie === '' ? 'white' : '#1A365D', fontFamily: 'Georgia, serif' }}>Tous</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => filtrerCategorie(cat)} style={{ padding: '6px 16px', borderRadius: '20px', border: '1.5px solid #90CDF4', cursor: 'pointer', background: categorie === cat ? '#2B6CB0' : '#F5ECD8', color: categorie === cat ? 'white' : '#1A365D', textTransform: 'capitalize', fontFamily: 'Georgia, serif' }}>{cat}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {services.length === 0 && <p style={{ color: '#3D2B0F' }}>Aucun service disponible pour le moment.</p>}
              {services.map(service => (
                <div key={service.id} style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                    {service.users && (
                      <span onClick={() => navigate(`/prestataire/${service.users.id}`)} style={{ fontSize: '13px', color: '#2B6CB0', cursor: 'pointer', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                        👤 {service.users.prenom} {service.users.nom} {service.users.ville && `· ${service.users.ville}`}
                        {service.users.verifie && <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '10px', padding: '1px 6px', borderRadius: '20px', textDecoration: 'none' }}>✅</span>}
                      </span>
                    )}
                    <span style={{ background: '#EBF8FF', color: '#2B6CB0', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', textTransform: 'capitalize' }}>{service.categorie}</span>
                  </div>
                  <h3 style={{ margin: '0.5rem 0', color: '#1A365D' }}>{service.titre}</h3>
                  <p style={{ color: '#3D2B0F', fontSize: '14px', marginBottom: '1rem' }}>{service.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#C53030' }}>{service.prix}€</span>
                      <span style={{ color: '#3D2B0F', fontSize: '13px', marginLeft: '6px' }}>{service.duree} min</span>
                    </div>
                    <button onClick={() => ouvrirReservation(service)} style={{ background: '#C53030', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Réserver</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {vue === 'reservations' && (
          <div>
            {reservations.length === 0 && <p style={{ color: '#3D2B0F' }}>Aucune réservation pour le moment.</p>}
            {reservations.map(res => {
              const sc = statutColor(res.statut)
              return (
                <div key={res.id} style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid #A07840' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ margin: 0, color: '#1A365D' }}>{res.services?.titre}</h3>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', background: sc.bg, color: sc.color }}>{res.statut}</span>
                  </div>
                  <p style={{ color: '#3D2B0F', marginTop: '0.5rem' }}>Date : {new Date(res.date_rdv).toLocaleString('fr-FR')}</p>
                  <p style={{ color: '#3D2B0F' }}>Adresse : {res.adresse_intervention}</p>

                  {(res.statut === 'en_attente' || res.statut === 'confirme') && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', flexWrap: 'wrap' }}>
                      <button onClick={() => ouvrirModifier(res)} style={{ background: '#2B6CB0', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px' }}>✏️ Modifier</button>
                      <button onClick={() => handleAnnuler(res.id)} style={{ background: '#C53030', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px' }}>✗ Annuler</button>
                    </div>
                  )}

                  {res.statut === 'termine' && (
                    <button onClick={() => ouvrirAvis(res)} style={{ background: '#F6AD55', color: '#1A365D', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>⭐ Laisser un avis</button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {vue === 'favoris' && (
          <div>
            {favoris.length === 0 && <p style={{ color: '#3D2B0F' }}>Aucun favori pour le moment. Cliquez sur le ❤️ sur un profil prestataire pour l'ajouter !</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {favoris.map(fav => (
                <div key={fav.id} style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 4px', color: '#1A365D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {fav.users?.prenom} {fav.users?.nom}
                      {fav.users?.verifie && <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '10px', padding: '1px 6px', borderRadius: '20px' }}>✅</span>}
                    </h3>
                    <button onClick={() => handleRetirerFavori(fav.prestataire_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>❤️</button>
                  </div>
                  {fav.users?.ville && <p style={{ color: '#3D2B0F', fontSize: '13px', margin: '0 0 8px' }}>📍 {fav.users.ville} {fav.users.code_postal}</p>}
                  {fav.services?.length > 0 && (
                    <p style={{ color: '#3D2B0F', fontSize: '12px', marginBottom: '1rem' }}>
                      {fav.services.map(s => s.categorie).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                    </p>
                  )}
                  <button onClick={() => navigate(`/prestataire/${fav.prestataire_id}`)} style={{ width: '100%', background: '#2B6CB0', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Voir le profil</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {vue === 'messages' && (
          <div>
            {conversations.length === 0 && <p style={{ color: '#3D2B0F' }}>Aucune conversation pour le moment. Envoyez un message depuis une réservation !</p>}
            {conversations.map(conv => (
              <div key={conv.id} onClick={() => ouvrirChat(conv)} style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid #A07840', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', color: '#1A365D' }}>{conv.users?.prenom} {conv.users?.nom}</h3>
                  <p style={{ color: '#3D2B0F', fontSize: '13px', margin: 0 }}>{conv.services?.titre} — {new Date(conv.date_rdv).toLocaleDateString('fr-FR')}</p>
                </div>
                {conv.nonLus > 0 && (
                  <span style={{ background: '#C53030', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>{conv.nonLus}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{ background: '#1A365D', color: '#BEE3F8', textAlign: 'center', padding: '1rem', fontSize: '13px' }}>
        © 2026 At Home Service — Tous droits réservés
      </footer>
    </div>
  )
}

export default DashboardClient