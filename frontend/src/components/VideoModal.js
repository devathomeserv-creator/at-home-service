import React, { useState, useEffect, useRef } from 'react'
import DailyIframe from '@daily-co/daily-js'
import { creerSalleVideo } from '../services/api'
import { useLanguage } from '../context/LanguageContext'

const VideoModal = ({ booking, onClose }) => {
  const { t } = useLanguage()
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const callRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    demarrerAppel()
    return () => {
      if (callRef.current) {
        callRef.current.destroy()
        callRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const demarrerAppel = async () => {
    try {
      const res = await creerSalleVideo(booking.id)
      const { url, token } = res.data

      const call = DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: true,
        showFullscreenButton: true,
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '12px'
        }
      })

      callRef.current = call

      call.on('left-meeting', () => {
        onClose()
      })

      call.on('error', (err) => {
        setErreur('Erreur lors de la connexion à l\'appel vidéo')
        console.error(err)
      })

      await call.join({ url, token })
      setChargement(false)
    } catch (err) {
      setErreur('Impossible de démarrer l\'appel vidéo')
      setChargement(false)
      console.error(err)
    }
  }

  const terminerAppel = () => {
    if (callRef.current) {
      callRef.current.destroy()
      callRef.current = null
    }
    onClose()
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '900px', height: '80vh', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'white', margin: 0, fontFamily: 'Georgia, serif', fontSize: '16px' }}>
            📹 {t('appel_video')} — {booking.services?.titre}
          </h3>
          <button onClick={terminerAppel} style={{ background: '#C53030', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
            {t('terminer_appel')}
          </button>
        </div>

        <div ref={containerRef} style={{ flex: 1, background: '#1A365D', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
          {chargement && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'white', fontFamily: 'Georgia, serif' }}>{t('appel_en_cours')}</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}
          {erreur && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#FEB2B2', fontFamily: 'Georgia, serif', textAlign: 'center', padding: '2rem' }}>{erreur}</p>
            </div>
          )}
        </div>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textAlign: 'center', margin: 0 }}>
          At Home Service — Appel vidéo sécurisé · Max 2 participants · Durée max 1h
        </p>
      </div>
    </div>
  )
}

export default VideoModal