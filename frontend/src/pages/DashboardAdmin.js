import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { useNavigate } from 'react-router-dom'
import { getRevenusPlateforme, getModeMaintenance, modifierModeMaintenance, telechargerExportComptable } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'

const drapeaux = { fr: '🇫🇷', en: '🇬🇧', it: '🇮🇹', ru: '🇷🇺' }

const DashboardAdmin = () => {
  const { user, logout, token } = useAuth()
  const { mode: themeMode, toggleTheme, couleurs: c } = useTheme()
  const { langue, changerLangue, t } = useLanguage()
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
  const [selecteurLangueOuvert, setSelecteurLangueOuvert] = useState(false)
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [exportEnCours, setExportEnCours] = useState(false)

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

    const maintenant = new Date()
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
    setDateDebut(debutMois.toISOString().split('T')[0])
    setDateFin(maintenant.toISOString().split('T')[0])
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

  const handleExportComptable = async () => {
    if (!dateDebut || !dateFin) {
      setMessage('Veuillez sélectionner une période')
      return
    }
    setExportEnCours(true)
    try {
      await telechargerExportComptable(dateDebut, dateFin, langue)
      setMessage('Export comptable téléchargé avec succès !')
    } catch (err) {
      setMessage('Erreur lors de la génération de l\'export')
    } finally {
      setExportEnCours(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const statCards = [
    { label: t('total_utilisateurs'), value: stats.totalUsers },
    { label: t('clients_label'), value: stats.totalClients },
    { label: t('prestataires_label'), value: stats.totalPrestataires },
    { label: t('mes_reservations'), value: stats.totalReservations }
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

  const inputStyle = { width: '100%', padding: '10px 14px', marginBottom: '10px', borderRadius: '8px', border: `1.5px solid ${c.bleuClair}`, background: c.inputFond, color: c.inputTexte, fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Georgia, serif' }

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
            <div style={{ fontSize: '9px', color: '#FEB2B2', letterSpacing: '2px', textTransform: 'uppercase' }}>{t('panneau_admin')}</div>
          </div>
        </div>
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
          {maintenanceActive && (
            <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{t('maintenance_active_badge')}</span>
          )}
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
        {['stats', 'revenus', 'users', 'reservations', 'signalements', 'parametres'].map(v => (
          <button key={v} onClick={() => setVue(v)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === v ? c.bleu : c.fondClair, color: vue === v ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif', position: 'relative' }}>
            {v === 'stats' ? t('onglet_statistiques') : v === 'revenus' ? t('onglet_revenus') : v === 'users' ? t('onglet_utilisateurs') : v === 'reservations' ? t('mes_reservations') : v === 'signalements' ? t('onglet_signalements') : t('onglet_parametres')}
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
                <p style={{ color: c.texte, fontSize: '13px', margin: '0 0 0.5rem' }}>{t('commission_mois')}</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: c.rouge, margin: 0 }}>{revenus.commissionMois}€</p>
              </div>
              <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}`, textAlign: 'center' }}>
                <p style={{ color: c.texte, fontSize: '13px', margin: '0 0 0.5rem' }}>{t('commission_totale')}</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: c.bleu, margin: 0 }}>{revenus.commissionTotale}€</p>
              </div>
              <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}`, textAlign: 'center' }}>
                <p style={{ color: c.texte, fontSize: '13px', margin: '0 0 0.5rem' }}>{t('volume_total')}</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: c.texteFonce, margin: 0 }}>{revenus.volumeTotal}€</p>
              </div>
              <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}`, textAlign: 'center' }}>
                <p style={{ color: c.texte, fontSize: '13px', margin: '0 0 0.5rem' }}>{t('taux_commission')}</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669', margin: 0 }}>{revenus.tauxCommission}%</p>
              </div>
            </div>

            <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}` }}>
              <h3 style={{ color: c.texteFonce, marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>{t('evolution_commission')}</h3>
              {donneesGraphique.length === 0 ? (
                <p style={{ color: c.texte, fontSize: '14px' }}>{t('pas_assez_graphique')}</p>
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
                  <button onClick={() => supprimerUser(u.id)} style={{ background: c.rouge, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{t('supprimer_btn')}</button>
                )}
              </div>
            ))}
          </div>
        )}

        {vue === 'reservations' && (
          <div>
            {reservations.length === 0 && <p style={{ color: c.texte }}>{t('aucune_reservation')}</p>}
            {reservations.map(res => (
              <div key={res.id} style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: `1px solid ${c.bordure}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, color: c.texteFonce }}>{res.services?.titre}</h3>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', background: res.statut === 'confirme' ? '#d1fae5' : res.statut === 'annule' ? '#fee2e2' : '#fef3c7', color: res.statut === 'confirme' ? '#065f46' : res.statut === 'annule' ? '#991b1b' : '#92400e' }}>{res.statut}</span>
                </div>
                <p style={{ color: c.texte, marginTop: '0.5rem', fontSize: '14px' }}>{t('date_label')} {new Date(res.date_rdv).toLocaleString('fr-FR')}</p>
                <p style={{ color: c.texte, fontSize: '14px' }}>{t('adresse_intervention_label')} {res.adresse_intervention}</p>
              </div>
            ))}
          </div>
        )}

        {vue === 'signalements' && (
          <div>
            {signalements.length === 0 && <p style={{ color: c.texte }}>{t('aucun_signalement')}</p>}
            {signalements.map(s => {
              const sc = statutColorSignalement(s.statut)
              return (
                <div key={s.id} style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: `1px solid ${c.bordure}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ margin: 0, color: c.texteFonce }}>{s.motif}</h3>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', background: sc.bg, color: sc.color }}>{s.statut}</span>
                  </div>
                  <p style={{ color: c.texte, marginTop: '0.5rem', fontSize: '14px' }}>{t('signale_par')} {s.client?.prenom} {s.client?.nom} ({s.client?.email})</p>
                  <p style={{ color: c.texte, fontSize: '14px' }}>{t('prestataire_concerne')} {s.prestataire?.prenom} {s.prestataire?.nom} ({s.prestataire?.email})</p>
                  {s.description && <p style={{ color: c.texte, fontSize: '14px', fontStyle: 'italic', marginTop: '0.5rem' }}>"{s.description}"</p>}
                  <p style={{ color: c.bordure, fontSize: '12px', marginTop: '0.5rem' }}>{new Date(s.created_at).toLocaleDateString('fr-FR')}</p>
                  {s.statut === 'en_attente' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                      <button onClick={() => changerStatutSignalement(s.id, 'traite')} style={{ background: c.bleu, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px' }}>{t('marquer_traite')}</button>
                      <button onClick={() => changerStatutSignalement(s.id, 'rejete')} style={{ background: c.rouge, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px' }}>{t('rejeter')}</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {vue === 'parametres' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}` }}>
              <h3 style={{ color: c.texteFonce, marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>{t('parametres_plateforme')}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: c.blanc, borderRadius: '8px', border: `1px solid ${c.bordure}` }}>
                <div>
                  <p style={{ color: c.texteFonce, fontWeight: 'bold', margin: '0 0 4px', fontSize: '14px' }}>{t('mode_maintenance_titre')}</p>
                  <p style={{ color: c.texte, fontSize: '12px', margin: 0, maxWidth: '400px' }}>{t('mode_maintenance_desc')}</p>
                </div>
                <div onClick={toggleMaintenance} style={{ width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer', flexShrink: 0, marginLeft: '1rem', background: maintenanceActive ? c.rouge : '#CBD5E0', position: 'relative', transition: 'background 0.3s' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', transition: 'left 0.3s', left: maintenanceActive ? '25px' : '3px' }} />
                </div>
              </div>
            </div>

            <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}` }}>
              <h3 style={{ color: c.texteFonce, marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>{t('export_comptable_titre')}</h3>
              <p style={{ color: c.texte, fontSize: '13px', marginBottom: '1.5rem' }}>{t('export_comptable_desc')}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <p style={{ color: c.texte, fontSize: '12px', marginBottom: '4px' }}>{t('date_debut')}</p>
                  <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <p style={{ color: c.texte, fontSize: '12px', marginBottom: '4px' }}>{t('date_fin')}</p>
                  <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <button onClick={handleExportComptable} disabled={exportEnCours} style={{ width: '100%', padding: '12px', background: c.bleu, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>
                {exportEnCours ? t('generation_en_cours') : t('telecharger_export')}
              </button>
            </div>
          </div>
        )}
      </div>

      <footer style={{ background: c.texteFonce, color: '#BEE3F8', textAlign: 'center', padding: '1rem', fontSize: '13px' }}>
        {t('footer_droits')}
      </footer>
    </div>
  )
}

export default DashboardAdmin