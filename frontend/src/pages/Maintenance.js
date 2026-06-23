import React from 'react'
import { useTheme } from '../context/ThemeContext'

const Maintenance = () => {
  const { couleurs: c } = useTheme()

  return (
    <div style={{ minHeight: '100vh', background: c.fond, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ width: '64px', height: '64px', background: c.bleu, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
          <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" fill="white"/>
        </svg>
      </div>
      <h1 style={{ color: c.texteFonce, fontSize: '28px', marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>On revient très vite !</h1>
      <p style={{ color: c.texte, fontSize: '16px', maxWidth: '480px', lineHeight: 1.6, marginBottom: '0.5rem' }}>
        At Home Service est actuellement en maintenance pour vous offrir une meilleure expérience.
      </p>
      <p style={{ color: c.texte, fontSize: '14px', maxWidth: '480px', lineHeight: 1.6 }}>
        Merci de votre patience, nous serons de retour dans quelques instants.
      </p>
      <p style={{ color: c.bordure, fontSize: '13px', marginTop: '2rem' }}>devathomeserv@gmail.com</p>
    </div>
  )
}

export default Maintenance