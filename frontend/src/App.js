import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Auth from './pages/Auth'
import DashboardClient from './pages/DashboardClient'
import DashboardPrestataire from './pages/DashboardPrestataire'
import DashboardAdmin from './pages/DashboardAdmin'
import MentionsLegales from './pages/MentionsLegales'

const RoutePrategee = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Chargement...</div>
  if (!user) return <Navigate to="/" />
  if (role && user.role !== role) return <Navigate to="/" />
  return children
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/client" element={
          <RoutePrategee role="client">
            <DashboardClient />
          </RoutePrategee>
        } />
        <Route path="/prestataire" element={
          <RoutePrategee role="prestataire">
            <DashboardPrestataire />
          </RoutePrategee>
        } />
        <Route path="/admin" element={
          <RoutePrategee role="admin">
            <DashboardAdmin />
          </RoutePrategee>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App