import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { getRevenusPlateforme, getModeMaintenance, modifierModeMaintenance } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'

const DashboardAdmin = () => {
  const { user, logout, token } = useAuth()
  const { mode: themeMode, toggleTheme, couleurs: c } = useTheme()
  const navigate = useNavigate()
  const [vue, setVue] = useState('stats')
  const [users, setUsers] = useState([])
  const [reservations, setReservations] = useState([])
  const [signalements, setSignalements] = useState([])
  const [revenus, setRevenus] = useState(null)
  const [maintenanceActive, setMaintenanceActive] = useState(false)
  const [stats, setStats] = useState({ totalUsers: 0, totalClients: 0, totalPrestataires: 0, totalReservations: 0 })
  const [message, setMessage] = useState('')
  const [menuOuvert, setMenuOuvert] = useState(false)

  const API = axios.create({
    baseURL: 'https://loving-nature-production-145d.up.railway.app/api',
    headers: { Authorization: `Bearer ${token}` }
  })

  const chargerUsers = useCallback(async () => {
    try {
      const res = await API.get('/admin/users')
      setUsers(res.data.users)
      setStats(s => ({
        ...s,
        totalUsers: res.data.users.length,
        totalClients: res.data.users.filter(u => u.role === 'client').length,
        totalPrestataires: res.data.users.filter(u => u.role === 'prestataire').length
      }))
    } catch (err) {
      console.error(err)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const chargerReservations = useCallback(async () => {
    try {
      const res = await API.get('/admin/reservations')
      setReservations(res.data.reservations)
      setStats(s => ({ ...s, totalReservations: res.data.reservations.length }))
    } catch (err) {
      console.error(err)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const chargerSignalements = useCallback(async () => {
    try {
      const res = await API.get('/signalements')
      setSignalements(res.data.signalements)
    } catch (err) {
      console.error(err)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const chargerRevenus = useCallback(async () => {
    try {
      const res = await getRevenusPlateforme()
      setRevenus(res.data)
    } catch (err) {
      console.error(err)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const chargerMaintenance = useCallback(async () => {
    try {
      const res = await getModeMaintenance()
      setMaintenanceActive(res.data.mode_maintenance)
    } catch (err) {
      console.error(err)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    chargerUsers()
    chargerReservations()
    chargerSignalements()
    chargerRevenus()
    chargerMaintenance()
  }, [chargerUsers, chargerReservations, chargerSignalements, chargerRevenus, chargerMaintenance])

  const supprimerUser = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return
    try {
      await API.delete(`/admin/users/${id}`)
      setMessage('Utilisateur supprimé !')
      chargerUsers()
    } catch (err) {
      setMessage('Erreur lors de la suppression')
    }
  }

  const changerStatutSignalement = async (id, statut) => {
    try {
      await API.put(`/signalements/${id}/statut`, { statut })
      setMessage('Statut du signalement mis à jour')
      chargerSignalements()
    } catch (err) {
      setMessage('Erreur lors de la mise à jour')
    }
  }

  const toggleMaintenance = async () => {
    const nouvelEtat = !maintenanceActive
    if (nouvelEtat && !window.confirm('Activer le mode maintenance ? Tous les visiteurs (sauf vous) verront une page "On revient bientôt".')) return
    try {
      await modifierModeMaintenance(nouvelEtat)
      setMaintenanceActive(nouvelEtat)
      setMessage(nouvelEtat ? 'Mode maintenance activé' : 'Mode maintenance désactivé')
    } catch (err) {
      setMessage('Erreur lors de la mise à jour du mode maintenance')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const statCards = [
    { label: 'Total utilisateurs', value: stats.totalUsers },
    { label: 'Clients', value: stats.totalClients },
    { label: 'Prestataires', value: stats.totalPrestataires },
    { label: 'Réservations', value: stats.totalReservations }
  ]

  const signalementsEnAttente = signalements.filter(s => s.statut === 'en_attente').length

  const statutColorSignalement = (statut) => {
    if (statut === 'traite') return { bg: '#d1fae5', color: '#065f46' }
    if (statut === 'rejete') return { bg: '#fee2e2', color: '#991b1b' }
    return { bg: '#fef3c7', color: '#92400e' }
  }

  const formaterMois = (cle) => {
    const [annee, mois] = cle.split('-')
    const noms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    return `${noms[parseInt(mois) - 1]} ${annee}`
  }

  const donneesGraphique = revenus?.evolutionMensuelle.map(item => ({
    mois: formaterMois(item.mois),
    revenus: item.montant
  })) || []

  return (
    <div style={{ minHeight: '100vh', background: c.fond, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @media (max-width: 600px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: block !important; }
          .tabs { flex-wrap: wrap !important; }
          .tabs button { flex: 1 !important; font-size: 12px !important; padding: 8px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
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
            <div style={{ fontSize: '9px', color: '#FEB2B2', letterSpacing: '2px', textTransform: 'uppercase' }}>panneau administration</div>
          </div>
        </div>
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {maintenanceActive && (
            <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>🚧 Maintenance active</span>
          )}
          <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>
            {themeMode === 'clair' ? '🌙' : '☀️'}
          </button>
          <span style={{ color: '#BEE3F8', fontSize: '14px' }}>Bonjour {user?.prenom} !</span>
          <button onClick={() => navigate('/profil')} style={{ background: 'white', color: c.bleu, border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Mon profil</button>
          <button onClick={handleLogout} style={{ background: c.rouge, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Déconnexion</button>
        </div>
        <button onClick={() => setMenuOuvert(!menuOuvert)} className="nav-mobile" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'none' }}>
          <div style={{ width: '24px', height: '2px', background: 'white', margin: '5px 0' }}></div>
          <div style={{ width: '24px', height: '2px', background: 'white', margin: '5px 0' }}></div>
          <div style={{ width: '24px', height: '2px', background: 'white', margin: '5px 0' }}></div>
        </button>
        {menuOuvert && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: c.bleu, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 100, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <p style={{ color: '#BEE3F8', fontSize: '14px', margin: 0 }}>Bonjour {user?.prenom} !</p>
            <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{themeMode === 'clair' ? '🌙 Mode sombre' : '☀️ Mode clair'}</button>
            <button onClick={() => { navigate('/profil'); setMenuOuvert(false) }} style={{ background: 'white', color: c.bleu, border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Mon profil</button>
            <button onClick={handleLogout} style={{ background: c.rouge, color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Déconnexion</button>
          </div>
        )}
      </nav>

      <div className="tabs" style={{ background: c.fondMoyen, padding: '16px 2rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['stats', 'revenus', 'users', 'reservations', 'signalements', 'parametres'].map(v => (
          <button key={v} onClick={() => setVue(v)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === v ? c.bleu : c.fondClair, color: vue === v ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif', position: 'relative' }}>
            {v === 'stats' ? 'Statistiques' : v === 'revenus' ? '💰 Revenus' : v === 'users' ? 'Utilisateurs' : v === 'reservations' ? 'Réservations' : v === 'signalements' ? '🚩 Signalements' : '⚙️ Paramètres'}
            {v === 'signalements' && signalementsEnAttente > 0 && <span style={{ background: c.rouge, color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', marginLeft: '6px' }}>{signalementsEnAttente}</span>}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem', width: '100%' }}>
        {message && <p style={{ background: c.fondClair, color: c.texteFonce, padding: '10px 16px', borderRadius: '8px', marginBottom: '1rem', border: `1px solid ${c.bordure}` }}>{message}</p>}

        {vue === 'stats' && (
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {statCards.map(stat => (
              <div key={stat.label} style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}`, textAlign: 'center' }}>
                <p style={{ color: c.texte, fontSize: '14px', margin: '0 0 0.5rem' }}>{stat.label}</p>
                <p style={{ fontSize: '40px', fontWeight: 'bold', color: c.bleu, margin: 0 }}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {vue === 'revenus' && revenus && (
          <div>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}`, textAlign: 'center' }}>
                <p style={{ color: c.texte, fontSize: '13px', margin: '0 0 0.5rem' }}>Commission ce mois</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: c.rouge, margin: 0 }}>{revenus.commissionMois}€</p>
              </div>
              <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}`, textAlign: 'center' }}>
                <p style={{ color: c.texte, fontSize: '13px', margin: '0 0 0.5rem' }}>Commission totale</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: c.bleu, margin: 0 }}>{revenus.commissionTotale}€</p>
              </div>
              <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}`, textAlign: 'center' }}>
                <p style={{ color: c.texte, fontSize: '13px', margin: '0 0 0.5rem' }}>Volume total traité</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: c.texteFonce, margin: 0 }}>{revenus.volumeTotal}€</p>
              </div>
              <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}`, textAlign: 'center' }}>
                <p style={{ color: c.texte, fontSize: '13px', margin: '0 0 0.5rem' }}>Taux de commission</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669', margin: 0 }}>{revenus.tauxCommission}%</p>
              </div>
            </div>

            <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}` }}>
              <h3 style={{ color: c.texteFonce, marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>Évolution de la commission (6 derniers mois)</h3>
              {donneesGraphique.length === 0 ? (
                <p style={{ color: c.texte, fontSize: '14px' }}>Pas encore assez de données pour afficher un graphique.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={donneesGraphique}>
                    <CartesianGrid strokeDasharray="3 3" stroke={c.bordure} />
                    <XAxis dataKey="mois" stroke={c.texte} fontSize={12} />
                    <YAxis stroke={c.texte} fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: c.blanc, border: `1px solid ${c.bordure}`, borderRadius: '8px', fontFamily: 'Georgia, serif' }}
                      formatter={(value) => [`${value}€`, 'Commission']}
                    />
                    <Bar dataKey="revenus" fill={c.bleu} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {vue === 'users' && (
          <div>
            {users.map(u => (
              <div key={u.id} style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: `1px solid ${c.bordure}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.3rem', color: c.texteFonce }}>{u.prenom} {u.nom}</h3>
                  <p style={{ color: c.texte, margin: '0 0 0.5rem', fontSize: '14px' }}>{u.email}</p>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', background: u.role === 'client' ? c.bleuFond : u.role === 'prestataire' ? c.fondClair : '#FEF3C7', color: u.role === 'client' ? c.bleu : u.role === 'prestataire' ? c.bordure : '#92400e', border: '1px solid currentColor' }}>{u.role}</span>
                </div>
                {u.role !== 'admin' && (
                  <button onClick={() => supprimerUser(u.id)} style={{ background: c.rouge, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Supprimer</button>
                )}
              </div>
            ))}
          </div>
        )}

        {vue === 'reservations' && (
          <div>
            {reservations.length === 0 && <p style={{ color: c.texte }}>Aucune réservation pour le moment.</p>}
            {reservations.map(res => (
              <div key={res.id} style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: `1px solid ${c.bordure}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, color: c.texteFonce }}>{res.services?.titre}</h3>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', background: res.statut === 'confirme' ? '#d1fae5' : res.statut === 'annule' ? '#fee2e2' : '#fef3c7', color: res.statut === 'confirme' ? '#065f46' : res.statut === 'annule' ? '#991b1b' : '#92400e' }}>{res.statut}</span>
                </div>
                <p style={{ color: c.texte, marginTop: '0.5rem', fontSize: '14px' }}>Date : {new Date(res.date_rdv).toLocaleString('fr-FR')}</p>
                <p style={{ color: c.texte, fontSize: '14px' }}>Adresse : {res.adresse_intervention}</p>
              </div>
            ))}
          </div>
        )}

        {vue === 'signalements' && (
          <div>
            {signalements.length === 0 && <p style={{ color: c.texte }}>Aucun signalement pour le moment.</p>}
            {signalements.map(s => {
              const sc = statutColorSignalement(s.statut)
              return (
                <div key={s.id} style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: `1px solid ${c.bordure}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ margin: 0, color: c.texteFonce }}>{s.motif}</h3>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', background: sc.bg, color: sc.color }}>{s.statut}</span>
                  </div>
                  <p style={{ color: c.texte, marginTop: '0.5rem', fontSize: '14px' }}>Signalé par : {s.client?.prenom} {s.client?.nom} ({s.client?.email})</p>
                  <p style={{ color: c.texte, fontSize: '14px' }}>Prestataire concerné : {s.prestataire?.prenom} {s.prestataire?.nom} ({s.prestataire?.email})</p>
                  {s.description && <p style={{ color: c.texte, fontSize: '14px', fontStyle: 'italic', marginTop: '0.5rem' }}>"{s.description}"</p>}
                  <p style={{ color: c.bordure, fontSize: '12px', marginTop: '0.5rem' }}>{new Date(s.created_at).toLocaleDateString('fr-FR')}</p>
                  {s.statut === 'en_attente' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                      <button onClick={() => changerStatutSignalement(s.id, 'traite')} style={{ background: c.bleu, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px' }}>Marquer traité</button>
                      <button onClick={() => changerStatutSignalement(s.id, 'rejete')} style={{ background: c.rouge, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px' }}>Rejeter</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {vue === 'parametres' && (
          <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}` }}>
            <h3 style={{ color: c.texteFonce, marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>Paramètres de la plateforme</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: c.blanc, borderRadius: '8px', border: `1px solid ${c.bordure}` }}>
              <div>
                <p style={{ color: c.texteFonce, fontWeight: 'bold', margin: '0 0 4px', fontSize: '14px' }}>🚧 Mode maintenance</p>
                <p style={{ color: c.texte, fontSize: '12px', margin: 0, maxWidth: '400px' }}>Quand activé, tous les visiteurs (sauf vous en tant qu'admin) voient une page "On revient bientôt" au lieu du site.</p>
              </div>
              <div onClick={toggleMaintenance} style={{ width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer', flexShrink: 0, marginLeft: '1rem', background: maintenanceActive ? c.rouge : '#CBD5E0', position: 'relative', transition: 'background 0.3s' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', transition: 'left 0.3s', left: maintenanceActive ? '25px' : '3px' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <footer style={{ background: c.texteFonce, color: '#BEE3F8', textAlign: 'center', padding: '1rem', fontSize: '13px' }}>
        © 2026 At Home Service — Tous droits réservés
      </footer>
    </div>
  )
}

export default DashboardAdmin