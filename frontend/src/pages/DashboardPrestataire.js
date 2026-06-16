import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { creerService, mesServices, mesReservationsPrestataire, modifierStatut, getMesAvis } from '../services/api'
import { useNavigate } from 'react-router-dom'

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
  const [avis, setAvis] = useState([])
  const [moyenneAvis, setMoyenneAvis] = useState(0)
  const [vue, setVue] = useState('reservations')
  const [message, setMessage] = useState('')
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [form, setForm] = useState({
    categorie: 'coiffure', titre: '', description: '', prix: '', duree: ''
  })

  const categories = ['coiffure', 'barber', 'esthetique', 'massage', 'plomberie', 'electricite', 'maconnerie', 'renovation']

  useEffect(() => {
    chargerServices()
    chargerReservations()
    chargerAvis()
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCreerService = async (e) => {
    e.preventDefault()
    try {
      await creerService({ ...form, prix: parseFloat(form.prix), duree: parseInt(form.duree) })
      setMessage('Service créé avec succès !')
      setForm({ categorie: 'coiffure', titre: '', description: '', prix: '', duree: '' })
      chargerServices()
      setVue('services')
    } catch (err) {
      setMessage('Erreur lors de la création')
    }
  }

  const changerStatut = async (id, statut) => {
    try {
      await modifierStatut(id, statut)
      setMessage('Statut mis à jour !')
      chargerReservations()
    } catch (err) {
      setMessage('Erreur lors de la mise à jour')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#C8A97A' }}>
      <style>{`
        @media (max-width: 600px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: block !important; }
          .tabs { flex-wrap: wrap !important; }
          .tabs button { flex: 1 !important; font-size: 11px !important; padding: 8px 6px !important; }
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
        {['reservations', 'services', 'avis', 'ajouter'].map(v => (
          <button key={v} onClick={() => setVue(v)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === v ? '#2B6CB0' : '#F5ECD8', color: vue === v ? 'white' : '#1A365D', fontFamily: 'Georgia, serif' }}>
            {v === 'reservations' ? 'Réservations' : v === 'services' ? 'Services' : v === 'avis' ? `Avis (${moyenneAvis}★)` : 'Ajouter'}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
        {message && <p style={{ background: '#F5ECD8', color: '#1A365D', padding: '10px 16px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #A07840' }}>{message}</p>}

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
                {res.statut === 'en_attente' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => changerStatut(res.id, 'confirme')} style={{ background: '#2B6CB0', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Confirmer</button>
                    <button onClick={() => changerStatut(res.id, 'annule')} style={{ background: '#C53030', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Annuler</button>
                  </div>
                )}
                {res.statut === 'confirme' && (
                  <button onClick={() => changerStatut(res.id, 'termine')} style={{ background: '#1A365D', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem', fontFamily: 'Georgia, serif' }}>Marquer terminé</button>
                )}
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
              </div>
            ))}
          </div>
        )}

        {vue === 'ajouter' && (
          <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '2rem', border: '1px solid #A07840', maxWidth: '500px', margin: '0 auto' }}>
            <h3 style={{ marginTop: 0, color: '#1A365D', marginBottom: '1.5rem' }}>Ajouter un nouveau service</h3>
            <form onSubmit={handleCreerService}>
              <select name="categorie" value={form.categorie} onChange={handleChange} style={{ width: '100%', padding: '10px 14px', marginBottom: '10px', borderRadius: '8px', border: '1.5px solid #90CDF4', background: 'white', color: '#1A202C', fontSize: '14px' }}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input name="titre" placeholder="Titre du service" value={form.titre} onChange={handleChange} required style={{ width: '100%', padding: '10px 14px', marginBottom: '10px', borderRadius: '8px', border: '1.5px solid #90CDF4', background: 'white', color: '#1A202C', fontSize: '14px' }} />
              <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} style={{ width: '100%', padding: '10px 14px', marginBottom: '10px', borderRadius: '8px', border: '1.5px solid #90CDF4', background: 'white', color: '#1A202C', fontSize: '14px', fontFamily: 'Georgia, serif' }} />
              <input name="prix" type="number" placeholder="Prix en euros" value={form.prix} onChange={handleChange} required style={{ width: '100%', padding: '10px 14px', marginBottom: '10px', borderRadius: '8px', border: '1.5px solid #90CDF4', background: 'white', color: '#1A202C', fontSize: '14px' }} />
              <input name="duree" type="number" placeholder="Durée en minutes" value={form.duree} onChange={handleChange} required style={{ width: '100%', padding: '10px 14px', marginBottom: '10px', borderRadius: '8px', border: '1.5px solid #90CDF4', background: 'white', color: '#1A202C', fontSize: '14px' }} />
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#C53030', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontFamily: 'Georgia, serif' }}>Créer le service</button>
            </form>
          </div>
        )}
      </div>

      <footer style={{ background: '#1A365D', color: '#BEE3F8', textAlign: 'center', padding: '1rem', marginTop: '2rem', fontSize: '13px' }}>
        © 2026 At Home Service — Tous droits réservés
      </footer>
    </div>
  )
}

export default DashboardPrestataire