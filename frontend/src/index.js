import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker enregistré:', registration)
      })
      .catch((error) => {
        console.log('Erreur Service Worker:', error)
      })
  })
}