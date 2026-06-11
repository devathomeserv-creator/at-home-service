import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" fill="#2B6CB0"/>
      </svg>
    </div>
    <div>
      <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', lineHeight: 1.1 }}>At Home Service</div>
      <div style={{ fontSize: '9px', color: '#FEB2B2', letterSpacing: '2px', textTransform: 'uppercase' }}>panneau administration</div>
    </div>
  </div>
)

const DashboardAdmin = () => {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const [vue, setVue] = useState('stats')
  const [users, setUsers] = useState([])
  const [reservations, setReservations] = useState([])
  const [stats, setStats] = useState({ totalUsers: 0, totalClients: 0, totalPrestataires: 0, totalReservations: 0 })
  const [message, setMessage] = useState('')

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

  useEffect(() => {
    chargerUsers()
    chargerReservations()
  }, [chargerUsers, chargerReservations])

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
        {['stats', 'users', 'reservations'].map(v => (
          <button key={v} onClick={() => setVue(v)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === v ? '#2B6CB0' : '#F5ECD8', color: vue === v ? 'white' : '#1A365D', fontFamily: 'Georgia, serif' }}>
            {v === 'stats' ? 'Statistiques' : v === 'users' ? 'Utilisateurs' : 'Réservations'}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
        {message && <p style={{ background: '#F5ECD8', color: '#1A365D', padding: '10px 16px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #A07840' }}>{message}</p>}

        {vue === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {statCards.map(stat => (
              <div key={stat.label} style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840', textAlign: 'center' }}>
                <p style={{ color: '#3D2B0F', fontSize: '14px', margin: '0 0 0.5rem' }}>{stat.label}</p>
                <p style={{ fontSize: '40px', fontWeight: 'bold', color: '#2B6CB0', margin: 0 }}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {vue === 'users' && (
          <div>
            {users.map(u => (
              <div key={u.id} style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid #A07840', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.3rem', color: '#1A365D' }}>{u.prenom} {u.nom}</h3>
                  <p style={{ color: '#3D2B0F', margin: '0 0 0.5rem', fontSize: '14px' }}>{u.email}</p>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', background: u.role === 'client' ? '#EBF8FF' : u.role === 'prestataire' ? '#F5ECD8' : '#FEF3C7', color: u.role === 'client' ? '#2B6CB0' : u.role === 'prestataire' ? '#A07840' : '#92400e', border: '1px solid currentColor' }}>{u.role}</span>
                </div>
                {u.role !== 'admin' && (
                  <button onClick={() => supprimerUser(u.id)} style={{ background: '#C53030', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Supprimer</button>
                )}
              </div>
            ))}
          </div>
        )}

        {vue === 'reservations' && (
          <div>
            {reservations.length === 0 && <p style={{ color: '#3D2B0F' }}>Aucune réservation pour le moment.</p>}
            {reservations.map(res => (
              <div key={res.id} style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid #A07840' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#1A365D' }}>{res.services?.titre}</h3>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', background: res.statut === 'confirme' ? '#d1fae5' : res.statut === 'annule' ? '#fee2e2' : '#fef3c7', color: res.statut === 'confirme' ? '#065f46' : res.statut === 'annule' ? '#991b1b' : '#92400e' }}>{res.statut}</span>
                </div>
                <p style={{ color: '#3D2B0F', marginTop: '0.5rem', fontSize: '14px' }}>Date : {new Date(res.date_rdv).toLocaleString('fr-FR')}</p>
                <p style={{ color: '#3D2B0F', fontSize: '14px' }}>Adresse : {res.adresse_intervention}</p>
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

export default DashboardAdmin