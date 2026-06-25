import React, { useState, useEffect, useRef } from 'react'
import { getMessages, envoyerMessage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { uploadMessageMedia } from '../services/supabaseClient'

const ChatModal = ({ booking, onClose }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [nouveauMessage, setNouveauMessage] = useState('')
  const [chargement, setChargement] = useState(true)
  const [uploadEnCours, setUploadEnCours] = useState(false)
  const [erreur, setErreur] = useState('')
  const messagesEndRef = useRef(null)
  const fichierInputRef = useRef(null)

  useEffect(() => {
    chargerMessages()
    const interval = setInterval(chargerMessages, 5000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const chargerMessages = async () => {
    try {
      const res = await getMessages(booking.id)
      setMessages(res.data.messages)
    } catch (err) {
      console.error(err)
    } finally {
      setChargement(false)
    }
  }

  const handleEnvoyer = async (e) => {
    e.preventDefault()
    if (!nouveauMessage.trim()) return
    try {
      await envoyerMessage({ booking_id: booking.id, contenu: nouveauMessage })
      setNouveauMessage('')
      chargerMessages()
    } catch (err) {
      console.error(err)
    }
  }

  const handleFichierSelectionne = async (e) => {
    const fichier = e.target.files[0]
    if (!fichier) return

    setErreur('')

    const estImage = fichier.type.startsWith('image/')
    const estVideo = fichier.type.startsWith('video/')

    if (!estImage && !estVideo) {
      setErreur('Seules les photos et vidéos sont acceptées')
      return
    }

    if (fichier.size > 25 * 1024 * 1024) {
      setErreur('Le fichier est trop volumineux (max 25 Mo)')
      return
    }

    setUploadEnCours(true)
    try {
      const media_url = await uploadMessageMedia(fichier, user.id)
      await envoyerMessage({
        booking_id: booking.id,
        media_url,
        media_type: estImage ? 'photo' : 'video'
      })
      chargerMessages()
    } catch (err) {
      setErreur('Erreur lors de l\'envoi du fichier')
    } finally {
      setUploadEnCours(false)
      if (fichierInputRef.current) fichierInputRef.current.value = ''
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: '#F5ECD8', borderRadius: '16px', width: '100%', maxWidth: '480px', border: '1px solid #A07840', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
        <div style={{ background: '#2B6CB0', padding: '1rem', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'white', margin: 0, fontSize: '16px', fontFamily: 'Georgia, serif' }}>💬 {booking.services?.titre}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', minHeight: '300px', maxHeight: '400px' }}>
          {chargement && <p style={{ color: '#3D2B0F', textAlign: 'center' }}>Chargement...</p>}
          {!chargement && messages.length === 0 && (
            <p style={{ color: '#3D2B0F', textAlign: 'center', fontSize: '14px' }}>Aucun message pour le moment. Envoyez le premier !</p>
          )}
          {messages.map(msg => {
            const estMoi = msg.expediteur_id === user.id
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: estMoi ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                <div style={{ maxWidth: '75%', background: estMoi ? '#2B6CB0' : 'white', color: estMoi ? 'white' : '#1A365D', padding: '8px 12px', borderRadius: '12px', border: estMoi ? 'none' : '1px solid #A07840' }}>
                  {msg.media_url && msg.media_type === 'photo' && (
                    <img src={msg.media_url} alt="média" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: msg.contenu ? '6px' : 0, display: 'block' }} />
                  )}
                  {msg.media_url && msg.media_type === 'video' && (
                    <video src={msg.media_url} controls style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: msg.contenu ? '6px' : 0, display: 'block' }} />
                  )}
                  {msg.contenu && <p style={{ margin: 0, fontSize: '14px' }}>{msg.contenu}</p>}
                  <p style={{ margin: '4px 0 0', fontSize: '10px', opacity: 0.7 }}>{new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {erreur && <p style={{ color: '#C53030', fontSize: '12px', padding: '0 1rem', margin: '0 0 8px' }}>{erreur}</p>}
        {uploadEnCours && <p style={{ color: '#3D2B0F', fontSize: '12px', padding: '0 1rem', margin: '0 0 8px' }}>Envoi en cours...</p>}

        <form onSubmit={handleEnvoyer} style={{ display: 'flex', gap: '8px', padding: '1rem', borderTop: '1px solid #A07840' }}>
          <input
            ref={fichierInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFichierSelectionne}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fichierInputRef.current?.click()}
            disabled={uploadEnCours}
            style={{ background: '#A07840', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
            title="Envoyer une photo ou vidéo"
          >
            📎
          </button>
          <input
            value={nouveauMessage}
            onChange={(e) => setNouveauMessage(e.target.value)}
            placeholder="Écrire un message..."
            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #90CDF4', background: 'white', color: '#1A202C', fontSize: '14px', fontFamily: 'Georgia, serif' }}
          />
          <button type="submit" style={{ background: '#C53030', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Envoyer</button>
        </form>
      </div>
    </div>
  )
}

export default ChatModal