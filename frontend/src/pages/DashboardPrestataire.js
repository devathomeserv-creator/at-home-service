import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { creerService, mesServices, mesReservationsPrestataire, modifierStatut, getMesAvis, getMesConversations, getStatsPrestataire, modifierService, supprimerService, repondreAvis, ajouterRealisation, getMesRealisations, supprimerRealisation } from '../services/api'
import { uploadRealisation } from '../services/supabaseClient'
import { useNavigate } from 'react-router-dom'
import ChatModal from '../components/ChatModal'

const Logo = ({ onClick }) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
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

const Etoiles = ({ note }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ fontSize: '18px', color: i <= note ? '#F6AD55' : '#CBD5E0' }}>★</span>
    ))}
  </div>
)

const DashboardPrestataire = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [reservations, setReservations] = useState([])
  const [conversations, setConversations] = useState([])
  const [avis, setAvis] = useState([])
  const [moyenneAvis, setMoyenneAvis] = useState(0)
  const [stats, setStats] = useState(null)
  const [realisations, setRealisations] = useState([])
  const [vue, setVue] = useState('reservations')
  const [message, setMessage] = useState('')
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [bookingChat, setBookingChat] = useState(null)
  const [showModifierService, setShowModifierService] = useState(false)
  const [serviceAModifier, setServiceAModifier] = useState(null)
  const [avisEnReponse, setAvisEnReponse] = useState(null)
  const [texteReponse, setTexteReponse] = useState('')
  const [formRealisation, setFormRealisation] = useState({ titre: '', description: '', type_media: 'photo' })
  const [fichierSelectionne, setFichierSelectionne] = useState(null)
  const [uploadEnCours, setUploadEnCours] = useState(false)
  const [form, setForm] = useState({
    categorie: 'coiffure', titre: '', description: '', prix: '', duree: '', photo_url: ''
  })
  const [formModif, setFormModif] = useState({
    categorie: '', titre: '', description: '', prix: '', duree: '', photo_url: ''
  })

  const categories = ['coiffure', 'barber', 'esthetique', 'massage', 'plomberie', 'electricite', 'maconnerie', 'renovation', 'coach sportif', 'photographe']

  useEffect(() => {
    chargerServices()
    chargerReservations()
    chargerAvis()
    chargerConversations()
    chargerStats()
    chargerRealisations()
  }, [])

  const chargerServices = async () => {
    try {
      const res = await mesServices()
      setServices(res.data.services)
    } catch (err) {
      console.error(err)
    }
  }

  const chargerReservations = async () => {
    try {
      const res = await mesReservationsPrestataire()
      setReservations(res.data.reservations)
    } catch (err) {
      console.error(err)
    }
  }

  const chargerAvis = async () => {
    try {
      const res = await getMesAvis()
      setAvis(res.data.avis)
      setMoyenneAvis(res.data.moyenne)
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

  const chargerStats = async () => {
    try {
      const res = await getStatsPrestataire()
      setStats(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const chargerRealisations = async () => {
    try {
      const res = await getMesRealisations()
      setRealisations(res.data.realisations)
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCreerService = async (e) => {
    e.preventDefault()
    try {
      await creerService({ ...form, prix: parseFloat(form.prix), duree: parseInt(form.duree) })
      setMessage('Service créé avec succès !')
      setForm({ categorie: 'coiffure', titre: '', description: '', prix: '', duree: '', photo_url: '' })
      chargerServices()
      setVue('services')
    } catch (err) {
      setMessage('Erreur lors de la création')
    }
  }

  const ouvrirModifierService = (service) => {
    setServiceAModifier(service)
    setFormModif({
      categorie: service.categorie,
      titre: service.titre,
      description: service.description || '',
      prix: service.prix,
      duree: service.duree,
      photo_url: service.photo_url || ''
    })
    setShowModifierService(true)
  }

  const handleModifChange = (e) => {
    setFormModif({ ...formModif, [e.target.name]: e.target.value })
  }

  const handleModifierService = async (e) => {
    e.preventDefault()
    try {
      await modifierService(serviceAModifier.id, { ...formModif, prix: parseFloat(formModif.prix), duree: parseInt(formModif.duree) })
      setMessage('Service modifié avec succès !')
      setShowModifierService(false)
      chargerServices()
    } catch (err) {
      setMessage('Erreur lors de la modification')
    }
  }

  const handleSupprimerService = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return
    try {
      await supprimerService(id)
      setMessage('Service supprimé avec succès')
      chargerServices()
    } catch (err) {
      setMessage('Erreur lors de la suppression')
    }
  }

  const changerStatut = async (id, statut) => {
    try {
      await modifierStatut(id, statut)
      setMessage('Statut mis à jour !')
      chargerReservations()
      chargerStats()
    } catch (err) {
      setMessage('Erreur lors de la mise à jour')
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

  const ouvrirReponseAvis = (avisItem) => {
    setAvisEnReponse(avisItem.id)
    setTexteReponse(avisItem.reponse_prestataire || '')
  }

  const handleRepondreAvis = async (id) => {
    if (!texteReponse.trim()) return
    try {
      await repondreAvis(id, texteReponse)
      setMessage('Réponse publiée avec succès !')
      setAvisEnReponse(null)
      setTexteReponse('')
      chargerAvis()
    } catch (err) {
      setMessage('Erreur lors de la publication')
    }
  }

  const handleFormRealisationChange = (e) => {
    setFormRealisation({ ...formRealisation, [e.target.name]: e.target.value })
  }

  const handleFichierChange = (e) => {
    setFichierSelectionne(e.target.files[0])
  }

  const handleAjouterRealisation = async (e) => {
    e.preventDefault()
    if (!fichierSelectionne) {
      setMessage('Veuillez sélectionner un fichier')
      return
    }
    setUploadEnCours(true)
    try {
      const media_url = await uploadRealisation(fichierSelectionne, user.id)
      await ajouterRealisation({ ...formRealisation, media_url })
      setMessage('Réalisation ajoutée avec succès !')
      setFormRealisation({ titre: '', description: '', type_media: 'photo' })
      setFichierSelectionne(null)
      document.getElementById('fichier-input').value = ''
      chargerRealisations()
    } catch (err) {
      setMessage('Erreur lors de l\'ajout : ' + err.message)
    } finally {
      setUploadEnCours(false)
    }
  }

  const handleSupprimerRealisation = async (id) => {
    if (!window.confirm('Supprimer cette réalisation ?')) return
    try {
      await supprimerRealisation(id)
      setMessage('Réalisation supprimée')
      chargerRealisations()
    } catch (err) {
      setMessage('Erreur lors de la suppression')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const totalNonLus = conversations.reduce((acc, c) => acc + c.nonLus, 0)

  const inputStyle = { width: '100%', padding: '10px 14px', marginBottom: '10px', borderRadius: '8px', border: '1.5px solid #90CDF4', background: 'white', color: '#1A202C', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Georgia, serif' }

  return (
    <div style={{ minHeight: '100vh', background: '#C8A97A', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @media (max-width: 600px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: block !important; }
          .tabs { flex-wrap: wrap !important; }
          .tabs button { flex: 1 !important; font-size: 11px !important; padding: 8px 6px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <nav style={{ background: '#2B6CB0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <Logo onClick={() => navigate('/')} />
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
        {['stats', 'reservations', 'services', 'realisations', 'messages', 'avis', 'ajouter'].map(v => (
          <button key={v} onClick={() => { setVue(v); if (v === 'messages') chargerConversations(); if (v === 'stats') chargerStats() }} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === v ? '#2B6CB0' : '#F5ECD8', color: vue === v ? 'white' : '#1A365D', fontFamily: 'Georgia, serif', position: 'relative' }}>
            {v === 'stats' ? '📊 Stats' : v === 'reservations' ? 'Réservations' : v === 'services' ? 'Services' : v === 'realisations' ? '📸 Réalisations' : v === 'messages' ? '💬 Messages' : v === 'avis' ? `Avis (${moyenneAvis}★)` : 'Ajouter'}
            {v === 'messages' && totalNonLus > 0 && <span style={{ background: '#C53030', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', marginLeft: '6px' }}>{totalNonLus}</span>}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem', width: '100%' }}>
        {message && <p style={{ background: '#F5ECD8', color: '#1A365D', padding: '10px 16px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #A07840' }}>{message}</p>}

        {showChat && bookingChat && <ChatModal booking={bookingChat} onClose={fermerChat} />}

        {showModifierService && serviceAModifier && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: '#F5ECD8', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '480px', border: '1px solid #A07840', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ color: '#1A365D', marginBottom: '1.5rem' }}>Modifier le service</h3>
              <form onSubmit={handleModifierService}>
                <select name="categorie" value={formModif.categorie} onChange={handleModifChange} style={inputStyle}>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input name="titre" placeholder="Titre du service" value={formModif.titre} onChange={handleModifChange} required style={inputStyle} />
                <textarea name="description" placeholder="Description" value={formModif.description} onChange={handleModifChange} rows={3} style={inputStyle} />
                <input name="prix" type="number" placeholder="Prix en euros" value={formModif.prix} onChange={handleModifChange} required style={inputStyle} />
                <input name="duree" type="number" placeholder="Durée en minutes" value={formModif.duree} onChange={handleModifChange} required style={inputStyle} />
                <input name="photo_url" placeholder="URL de la photo (optionnel)" value={formModif.photo_url} onChange={handleModifChange} style={inputStyle} />
                <p style={{ color: '#3D2B0F', fontSize: '12px', marginBottom: '12px' }}>Si vide, une photo par défaut selon la catégorie sera utilisée.</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" style={{ flex: 1, padding: '12px', background: '#2B6CB0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>Sauvegarder</button>
                  <button type="button" onClick={() => setShowModifierService(false)} style={{ background: 'white', color: '#1A365D', border: '1px solid #A07840', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Annuler</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {vue === 'stats' && stats && (
          <div>
            <div style={{ background: '#EBF8FF', borderRadius: '12px', padding: '1rem 1.5rem', border: '1px solid #90CDF4', marginBottom: '1rem', fontSize: '13px', color: '#1A365D' }}>
              ℹ️ At Home Service prélève une commission de <strong>{stats.tauxCommission}%</strong> sur chaque réservation. Les montants ci-dessous correspondent à ce que vous touchez réellement (net de commission).
            </div>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840', textAlign: 'center' }}>
                <p style={{ color: '#3D2B0F', fontSize: '13px', margin: '0 0 0.5rem' }}>Net à percevoir ce mois</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#C53030', margin: 0 }}>{stats.revenusMois}€</p>
              </div>
              <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840', textAlign: 'center' }}>
                <p style={{ color: '#3D2B0F', fontSize: '13px', margin: '0 0 0.5rem' }}>Net total perçu</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2B6CB0', margin: 0 }}>{stats.revenusTotal}€</p>
              </div>
              <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840', textAlign: 'center' }}>
                <p style={{ color: '#3D2B0F', fontSize: '13px', margin: '0 0 0.5rem' }}>Réservations ce mois</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1A365D', margin: 0 }}>{stats.reservationsMois}</p>
              </div>
              <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840', textAlign: 'center' }}>
                <p style={{ color: '#3D2B0F', fontSize: '13px', margin: '0 0 0.5rem' }}>Taux de confirmation</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669', margin: 0 }}>{stats.tauxConfirmation}%</p>
              </div>
              <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840', textAlign: 'center' }}>
                <p style={{ color: '#3D2B0F', fontSize: '13px', margin: '0 0 0.5rem' }}>Note moyenne</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#F6AD55', margin: 0 }}>{stats.moyenneAvis}★</p>
              </div>
              <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840', textAlign: 'center' }}>
                <p style={{ color: '#3D2B0F', fontSize: '13px', margin: '0 0 0.5rem' }}>Total réservations</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1A365D', margin: 0 }}>{stats.totalReservations}</p>
              </div>
            </div>

            <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840' }}>
              <h3 style={{ color: '#1A365D', marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>Services les plus demandés</h3>
              {stats.servicePopulaire.length === 0 && <p style={{ color: '#3D2B0F', fontSize: '14px' }}>Pas encore assez de données.</p>}
              {stats.servicePopulaire.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < stats.servicePopulaire.length - 1 ? '1px solid #E2D9C8' : 'none' }}>
                  <span style={{ color: '#1A365D', fontSize: '14px' }}>{s.titre}</span>
                  <span style={{ background: '#2B6CB0', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '12px' }}>{s.count} réservation{s.count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {vue === 'reservations' && (
          <div>
            {reservations.length === 0 && <p style={{ color: '#3D2B0F' }}>Aucune réservation pour le moment.</p>}
            {reservations.map(res => (
              <div key={res.id} style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid #A07840' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, color: '#1A365D' }}>{res.services?.titre}</h3>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', background: res.statut === 'confirme' ? '#d1fae5' : res.statut === 'annule' ? '#fee2e2' : '#fef3c7', color: res.statut === 'confirme' ? '#065f46' : res.statut === 'annule' ? '#991b1b' : '#92400e' }}>{res.statut}</span>
                </div>
                <p style={{ color: '#3D2B0F', marginTop: '0.5rem' }}>Client : {res.users?.prenom} {res.users?.nom}</p>
                <p style={{ color: '#3D2B0F' }}>Date : {new Date(res.date_rdv).toLocaleString('fr-FR')}</p>
                <p style={{ color: '#3D2B0F' }}>Adresse : {res.adresse_intervention}</p>
                {res.montant_net > 0 && (
                  <p style={{ color: '#065f46', fontSize: '13px', marginTop: '4px' }}>Net à percevoir : <strong>{res.montant_net}€</strong> (sur {res.services?.prix}€)</p>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {res.statut === 'en_attente' && (
                    <>
                      <button onClick={() => changerStatut(res.id, 'confirme')} style={{ background: '#2B6CB0', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Confirmer</button>
                      <button onClick={() => changerStatut(res.id, 'annule')} style={{ background: '#C53030', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Annuler</button>
                    </>
                  )}
                  {res.statut === 'confirme' && (
                    <button onClick={() => changerStatut(res.id, 'termine')} style={{ background: '#1A365D', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Marquer terminé</button>
                  )}
                  {res.statut !== 'annule' && (
                    <button onClick={() => ouvrirChat(res)} style={{ background: '#1A365D', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>💬 Message</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {vue === 'services' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {services.length === 0 && <p style={{ color: '#3D2B0F' }}>Aucun service créé pour le moment.</p>}
            {services.map(service => (
              <div key={service.id} style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840' }}>
                <span style={{ background: '#EBF8FF', color: '#2B6CB0', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', textTransform: 'capitalize' }}>{service.categorie}</span>
                <h3 style={{ margin: '0.8rem 0 0.5rem', color: '#1A365D' }}>{service.titre}</h3>
                <p style={{ color: '#3D2B0F', fontSize: '14px' }}>{service.description}</p>
                <p style={{ fontWeight: 'bold', color: '#C53030', marginTop: '0.5rem' }}>{service.prix}€ — {service.duree} min</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                  <button onClick={() => ouvrirModifierService(service)} style={{ flex: 1, background: '#2B6CB0', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px' }}>✏️ Modifier</button>
                  <button onClick={() => handleSupprimerService(service.id)} style={{ background: '#C53030', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {vue === 'realisations' && (
          <div>
            <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#1A365D', marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>Ajouter une réalisation</h3>
              <form onSubmit={handleAjouterRealisation}>
                <select name="type_media" value={formRealisation.type_media} onChange={handleFormRealisationChange} style={inputStyle}>
                  <option value="photo">📷 Photo</option>
                  <option value="video">🎥 Vidéo</option>
                </select>
                <input name="titre" placeholder="Titre (ex: Coupe avant/après)" value={formRealisation.titre} onChange={handleFormRealisationChange} style={inputStyle} />
                <textarea name="description" placeholder="Description (optionnel)" value={formRealisation.description} onChange={handleFormRealisationChange} rows={2} style={inputStyle} />
                <input id="fichier-input" type="file" accept={formRealisation.type_media === 'photo' ? 'image/*' : 'video/*'} onChange={handleFichierChange} style={inputStyle} />
                <p style={{ color: '#3D2B0F', fontSize: '12px', marginBottom: '12px' }}>Sélectionnez une photo ou vidéo depuis votre appareil.</p>
                <button type="submit" disabled={uploadEnCours} style={{ width: '100%', padding: '12px', background: '#C53030', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontFamily: 'Georgia, serif' }}>
                  {uploadEnCours ? 'Envoi en cours...' : 'Ajouter'}
                </button>
              </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {realisations.length === 0 && <p style={{ color: '#3D2B0F' }}>Aucune réalisation ajoutée pour le moment.</p>}
              {realisations.map(r => (
                <div key={r.id} style={{ background: '#F5ECD8', borderRadius: '12px', border: '1px solid #A07840', overflow: 'hidden' }}>
                  <div style={{ height: '160px', background: '#1A365D', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {r.type_media === 'photo' ? (
                      <img src={r.media_url} alt={r.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <video src={r.media_url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ padding: '1rem' }}>
                    {r.titre && <h4 style={{ margin: '0 0 4px', color: '#1A365D', fontFamily: 'Georgia, serif' }}>{r.titre}</h4>}
                    {r.description && <p style={{ color: '#3D2B0F', fontSize: '13px', margin: '0 0 8px' }}>{r.description}</p>}
                    <button onClick={() => handleSupprimerRealisation(r.id)} style={{ background: '#C53030', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px' }}>🗑️ Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {vue === 'messages' && (
          <div>
            {conversations.length === 0 && <p style={{ color: '#3D2B0F' }}>Aucune conversation pour le moment. Vous recevrez vos messages clients ici !</p>}
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

        {vue === 'avis' && (
          <div>
            <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #A07840', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#2B6CB0' }}>{moyenneAvis}</div>
              <div>
                <Etoiles note={Math.round(moyenneAvis)} />
                <p style={{ color: '#3D2B0F', fontSize: '14px', marginTop: '4px' }}>{avis.length} avis au total</p>
              </div>
            </div>
            {avis.length === 0 && <p style={{ color: '#3D2B0F' }}>Aucun avis pour le moment.</p>}
            {avis.map(a => (
              <div key={a.id} style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid #A07840' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#1A365D' }}>{a.users?.prenom} {a.users?.nom}</span>
                    <span style={{ color: '#3D2B0F', fontSize: '13px', marginLeft: '8px' }}>— {a.services?.titre}</span>
                  </div>
                  <Etoiles note={a.note} />
                </div>
                {a.commentaire && <p style={{ color: '#3D2B0F', fontSize: '14px', fontStyle: 'italic' }}>"{a.commentaire}"</p>}
                <p style={{ color: '#A07840', fontSize: '12px', marginTop: '8px' }}>{new Date(a.created_at).toLocaleDateString('fr-FR')}</p>

                {a.reponse_prestataire && avisEnReponse !== a.id && (
                  <div style={{ background: 'white', borderRadius: '8px', padding: '12px', marginTop: '12px', borderLeft: '3px solid #2B6CB0' }}>
                    <p style={{ color: '#2B6CB0', fontSize: '12px', fontWeight: 'bold', margin: '0 0 4px' }}>Votre réponse :</p>
                    <p style={{ color: '#3D2B0F', fontSize: '13px', margin: 0 }}>{a.reponse_prestataire}</p>
                  </div>
                )}

                {avisEnReponse === a.id ? (
                  <div style={{ marginTop: '12px' }}>
                    <textarea
                      value={texteReponse}
                      onChange={(e) => setTexteReponse(e.target.value)}
                      placeholder="Répondre à cet avis..."
                      rows={3}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #90CDF4', background: 'white', color: '#1A202C', fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box', marginBottom: '8px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleRepondreAvis(a.id)} style={{ background: '#2B6CB0', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px' }}>Publier la réponse</button>
                      <button onClick={() => setAvisEnReponse(null)} style={{ background: 'white', color: '#1A365D', border: '1px solid #A07840', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px' }}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => ouvrirReponseAvis(a)} style={{ background: 'none', border: '1px solid #2B6CB0', color: '#2B6CB0', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', marginTop: '12px' }}>
                    {a.reponse_prestataire ? '✏️ Modifier ma réponse' : '💬 Répondre'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {vue === 'ajouter' && (
          <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '2rem', border: '1px solid #A07840', maxWidth: '500px', margin: '0 auto' }}>
            <h3 style={{ marginTop: 0, color: '#1A365D', marginBottom: '1.5rem' }}>Ajouter un nouveau service</h3>
            <form onSubmit={handleCreerService}>
              <select name="categorie" value={form.categorie} onChange={handleChange} style={inputStyle}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input name="titre" placeholder="Titre du service" value={form.titre} onChange={handleChange} required style={inputStyle} />
              <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} style={inputStyle} />
              <input name="prix" type="number" placeholder="Prix en euros" value={form.prix} onChange={handleChange} required style={inputStyle} />
              <input name="duree" type="number" placeholder="Durée en minutes" value={form.duree} onChange={handleChange} required style={inputStyle} />
              <input name="photo_url" placeholder="URL de la photo (optionnel)" value={form.photo_url} onChange={handleChange} style={inputStyle} />
              <p style={{ color: '#3D2B0F', fontSize: '12px', marginBottom: '12px' }}>Si vide, une photo par défaut selon la catégorie sera utilisée.</p>
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#C53030', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontFamily: 'Georgia, serif' }}>Créer le service</button>
            </form>
          </div>
        )}
      </div>

      <footer style={{ background: '#1A365D', color: '#BEE3F8', textAlign: 'center', padding: '1rem', fontSize: '13px' }}>
        © 2026 At Home Service — Tous droits réservés
      </footer>
    </div>
  )
}

export default DashboardPrestataire