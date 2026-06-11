import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getServices, creerReservation, mesReservationsClient, laisserAvis, creerPaiement } from '../services/api'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { registerLocale } from 'react-datepicker'
import fr from 'date-fns/locale/fr'
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

const DashboardClient = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [reservations, setReservations] = useState([])
  const [vue, setVue] = useState('services')
  const [categorie, setCategorie] = useState('')
  const [message, setMessage] = useState('')
  const [avisForm, setAvisForm] = useState({ booking_id: null, service_id: null, note: 5, commentaire: '' })
  const [showAvisForm, setShowAvisForm] = useState(false)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [serviceSelectionne, setServiceSelectionne] = useState(null)
  const [dateSelectionnee, setDateSelectionnee] = useState(null)
  const [adresse, setAdresse] = useState('')

  const categories = ['coiffure', 'barber', 'esthetique', 'massage', 'plomberie', 'electricite', 'maconnerie', 'renovation']

  useEffect(() => {
    chargerServices()
    chargerReservations()
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

  const ouvrirReservation = (service) => {
    setServiceSelectionne(service)
    setDateSelectionnee(null)
    setAdresse('')
    setShowReservationModal(true)
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

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const filtrerCategorie = (cat) => {
    setCategorie(cat)
    chargerServices(cat)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#C8A97A' }}>
      <nav style={{ background: '#2B6CB0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#BEE3F8', fontSize: '14px' }}>Bonjour {user?.prenom} !</span>
          <button onClick={() => navigate('/profil')} style={{ background: 'white', color: '#2B6CB0', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Mon profil</button>
          <button onClick={handleLogout} style={{ background: '#C53030', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Déconnexion</button>
        </div>
      </nav>

      <div style={{ background: '#B8926A', padding: '16px 2rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => setVue('services')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === 'services' ? '#2B6CB0' : '#F5ECD8', color: vue === 'services' ? 'white' : '#1A365D', fontFamily: 'Georgia, serif' }}>Services disponibles</button>
        <button onClick={() => setVue('reservations')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === 'reservations' ? '#2B6CB0' : '#F5ECD8', color: vue === 'reservations' ? 'white' : '#1A365D', fontFamily: 'Georgia, serif' }}>Mes réservations</button>
      </div>

      <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
        {message && <p style={{ background: '#F5ECD8', color: '#1A365D', padding: '10px 16px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #A07840' }}>{message}</p>}

        {showReservationModal && serviceSelectionne && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#F5ECD8', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '480px', border: '1px solid #A07840' }}>
              <h3 style={{ color: '#1A365D', marginBottom: '0.5rem' }}>Réserver — {serviceSelectionne.titre}</h3>
              <p style={{ color: '#C53030', fontWeight: 'bold', marginBottom: '1.5rem' }}>{serviceSelectionne.prix}€ · {serviceSelectionne.duree} min</p>
              <p style={{ color: '#3D2B0F', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Choisissez une date et heure :</p>
              <DatePicker selected={dateSelectionnee} onChange={(date) => setDateSelectionnee(date)} showTimeSelect timeFormat="HH:mm" timeIntervals={30} dateFormat="dd/MM/yyyy à HH:mm" minDate={new Date()} locale="fr" placeholderText="Cliquez pour choisir..." inline />
              <p style={{ color: '#3D2B0F', margin: '1rem 0 8px', fontSize: '14px', fontWeight: 'bold' }}>Votre adresse :</p>
              <input placeholder="Ex: 12 rue de la Paix, Nice" value={adresse} onChange={(e) => setAdresse(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #90CDF4', background: 'white', color: '#1A202C', fontSize: '14px', marginBottom: '1.5rem', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={confirmerReservation} style={{ flex: 1, background: '#C53030', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>Payer et réserver</button>
                <button onClick={() => setShowReservationModal(false)} style={{ background: '#F5ECD8', color: '#1A365D', border: '1px solid #A07840', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Annuler</button>
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={envoyerAvis} style={{ background: '#2B6CB0', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Publier l'avis</button>
              <button onClick={() => setShowAvisForm(false)} style={{ background: '#F5ECD8', color: '#1A365D', border: '1px solid #A07840', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Annuler</button>
            </div>
          </div>
        )}

        {vue === 'services' && (
          <>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <button onClick={() => filtrerCategorie('')} style={{ padding: '6px 16px', borderRadius: '20px', border: '1.5px solid #90CDF4', cursor: 'pointer', background: categorie === '' ? '#2B6CB0' : '#F5ECD8', color: categorie === '' ? 'white' : '#1A365D', fontFamily: 'Georgia, serif' }}>Tous</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => filtrerCategorie(cat)} style={{ padding: '6px 16px', borderRadius: '20px', border: '1.5px solid #90CDF4', cursor: 'pointer', background: categorie === cat ? '#2B6CB0' : '#F5ECD8', color: categorie === cat ? 'white' : '#1A365D', textTransform: 'capitalize', fontFamily: 'Georgia, serif' }}>{cat}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {services.length === 0 && <p style={{ color: '#3D2B0F' }}>Aucun service disponible pour le moment.</p>}
              {services.map(service => (
                <div key={service.id} style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840' }}>
                  <span style={{ background: '#EBF8FF', color: '#2B6CB0', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', textTransform: 'capitalize' }}>{service.categorie}</span>
                  <h3 style={{ margin: '0.8rem 0 0.5rem', color: '#1A365D' }}>{service.titre}</h3>
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
            {reservations.map(res => (
              <div key={res.id} style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid #A07840' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#1A365D' }}>{res.services?.titre}</h3>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', background: res.statut === 'confirme' ? '#d1fae5' : res.statut === 'annule' ? '#fee2e2' : res.statut === 'termine' ? '#EBF8FF' : '#fef3c7', color: res.statut === 'confirme' ? '#065f46' : res.statut === 'annule' ? '#991b1b' : res.statut === 'termine' ? '#2B6CB0' : '#92400e' }}>{res.statut}</span>
                </div>
                <p style={{ color: '#3D2B0F', marginTop: '0.5rem' }}>Date : {new Date(res.date_rdv).toLocaleString('fr-FR')}</p>
                <p style={{ color: '#3D2B0F' }}>Adresse : {res.adresse_intervention}</p>
                {res.statut === 'termine' && (
                  <button onClick={() => ouvrirAvis(res)} style={{ background: '#F6AD55', color: '#1A365D', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>⭐ Laisser un avis</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{ background: '#1A365D', color: '#BEE3F8', textAlign: 'center', padding: '1rem', marginTop: '2rem', fontSize: '13px' }}>
        © 2026 At Home Service — Tous droits réservés
      </footer>
    </div>
  )
}

export default DashboardClient