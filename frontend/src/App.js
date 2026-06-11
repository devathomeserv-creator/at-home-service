import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Accueil from './pages/Accueil'
import Auth from './pages/Auth'
import DashboardClient from './pages/DashboardClient'
import DashboardPrestataire from './pages/DashboardPrestataire'
import DashboardAdmin from './pages/DashboardAdmin'
import MentionsLegales from './pages/MentionsLegales'
import Profil from './pages/Profil'

const RoutePrategee = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Chargement...</div>
  if (!user) return <Navigate to="/auth" />
  if (role && user.role !== role) return <Navigate to="/" />
  return children
}

const RouteAuth = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Chargement...</div>
  if (user) {
    if (user.role === 'client') return <Navigate to="/client" />
    if (user.role === 'prestataire') return <Navigate to="/prestataire" />
    if (user.role === 'admin') return <Navigate to="/admin" />
  }
  return children
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/auth" element={<RouteAuth><Auth /></RouteAuth>} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/profil" element={<RoutePrategee><Profil /></RoutePrategee>} />
        <Route path="/client" element={<RoutePrategee role="client"><DashboardClient /></RoutePrategee>} />
        <Route path="/prestataire" element={<RoutePrategee role="prestataire"><DashboardPrestataire /></RoutePrategee>} />
        <Route path="/admin" element={<RoutePrategee role="admin"><DashboardAdmin /></RoutePrategee>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App