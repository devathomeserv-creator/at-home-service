import React, { useState, useEffect, useRef } from 'react'
import { creerSalleVideo } from '../services/api'
import { useLanguage } from '../context/LanguageContext'

const VideoModal = ({ booking, onClose }) => {
  const { t } = useLanguage()
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const containerRef = useRef(null)
  const callFrameRef = useRef(null)
  const dejaDemarre = useRef(false)

  useEffect(() => {
    if (!dejaDemarre.current) {
      dejaDemarre.current = true
      demarrerAppel()
    }
    return () => {
      if (callFrameRef.current) {
        try {
          callFrameRef.current.destroy()
        } catch (e) {
          console.log('destroy error:', e)
        }
        callFrameRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const demarrerAppel = async () => {
    try {
      const res = await creerSalleVideo(booking.id)
      const { url, token } = res.data

      if (!url) {
        setErreur('URL de salle introuvable')
        setChargement(false)
        return
      }

      const DailyIframe = window.DailyIframe
      if (!DailyIframe) {
        setErreur('Module vidéo non chargé')
        setChargement(false)
        return
      }

      if (callFrameRef.current) {
        try { callFrameRef.current.destroy() } catch (e) {}
        callFrameRef.current = null
      }

      const callFrame = DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: true,
        showFullscreenButton: true,
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '12px'
        }
      })

      callFrameRef.current = callFrame

      callFrame.on('left-meeting', () => {
        console.log('left-meeting déclenché')
        onClose()
      })

      callFrame.on('error', (err) => {
        console.error('Daily error:', err)
        setErreur('Erreur : ' + (err.errorMsg || JSON.stringify(err)))
        setChargement(false)
      })

      callFrame.on('joined-meeting', () => {
        console.log('joined-meeting !')
        setChargement(false)
      })

      await callFrame.join({ url, token })

    } catch (err) {
      console.error('Video error:', err)
      setErreur('Impossible de démarrer : ' + err.message)
      setChargement(false)
    }
  }

  const terminerAppel = () => {
    if (callFrameRef.current) {
      try { callFrameRef.current.leave() } catch (e) {}
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
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: '#FEB2B2', fontFamily: 'Georgia, serif', textAlign: 'center', padding: '2rem' }}>{erreur}</p>
              <button onClick={demarrerAppel} style={{ background: '#2B6CB0', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                Réessayer
              </button>
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