import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProfilPublicPrestataire, ajouterFavori, retirerFavori, verifierFavori, getRealisationsPrestataire, creerSignalement } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const motifsSignalement = [
  'Comportement inapproprié',
  'Service non conforme à la description',
  'Tentative de fraude',
  'Profil suspect ou faux',
  'Autre'
]

const ProfilPrestataire = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mode: themeMode, toggleTheme, couleurs: c } = useTheme()
  const [data, setData] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [estFavori, setEstFavori] = useState(false)
  const [lienCopie, setLienCopie] = useState(false)
  const [realisations, setRealisations] = useState([])
  const [showSignalement, setShowSignalement] = useState(false)
  const [motifSignalement, setMotifSignalement] = useState(motifsSignalement[0])
  const [descriptionSignalement, setDescriptionSignalement] = useState('')
  const [signalementEnvoye, setSignalementEnvoye] = useState(false)
  const [erreurSignalement, setErreurSignalement] = useState('')

  useEffect(() => {
    chargerProfil()
    chargerRealisations()
    if (user?.role === 'client') {
      chargerFavori()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const chargerProfil = async () => {
    try {
      const res = await getProfilPublicPrestataire(id)
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setChargement(false)
    }
  }

  const chargerRealisations = async () => {
    try {
      const res = await getRealisationsPrestataire(id)
      setRealisations(res.data.realisations)
    } catch (err) {
      console.error(err)
    }
  }

  const chargerFavori = async () => {
    try {
      const res = await verifierFavori(id)
      setEstFavori(res.data.estFavori)
    } catch (err) {
      console.error(err)
    }
  }

  const toggleFavori = async () => {
    if (!user) {
      navigate('/auth')
      return
    }
    try {
      if (estFavori) {
        await retirerFavori(id)
        setEstFavori(false)
      } else {
        await ajouterFavori(id)
        setEstFavori(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handlePartager = async () => {
    const lien = `${window.location.origin}/prestataire/${id}`
    const titre = data ? `${data.prestataire.prenom} ${data.prestataire.nom} sur At Home Service` : 'At Home Service'

    if (navigator.share) {
      try {
        await navigator.share({ title: titre, url: lien })
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(lien)
        setLienCopie(true)
        setTimeout(() => setLienCopie(false), 2000)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const ouvrirSignalement = () => {
    if (!user) {
      navigate('/auth')
      return
    }
    setMotifSignalement(motifsSignalement[0])
    setDescriptionSignalement('')
    setSignalementEnvoye(false)
    setErreurSignalement('')
    setShowSignalement(true)
  }

  const handleEnvoyerSignalement = async (e) => {
    e.preventDefault()
    setErreurSignalement('')
    try {
      await creerSignalement({ prestataire_id: id, motif: motifSignalement, description: descriptionSignalement })
      setSignalementEnvoye(true)
    } catch (err) {
      setErreurSignalement(err.response?.data?.message || 'Erreur lors de l\'envoi du signalement')
    }
  }

  const handleReserver = (serviceId) => {
    if (!user) {
      navigate('/auth')
    } else if (user.role === 'client') {
      navigate('/client')
    } else {
      navigate('/auth')
    }
  }

  if (chargement) return (
    <div style={{ minHeight: '100vh', background: c.fond, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: c.texteFonce, fontSize: '18px' }}>Chargement...</p>
    </div>
  )

  if (!data) return (
    <div style={{ minHeight: '100vh', background: c.fond, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: c.rouge, fontSize: '18px' }}>Prestataire introuvable</p>
    </div>
  )

  const { prestataire, services, avis, moyenne, totalAvis } = data

  return (
    <div style={{ minHeight: '100vh', background: c.fond, display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: c.bleu, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" fill={c.bleu}/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', lineHeight: 1.1 }}>At Home Service</div>
            <div style={{ fontSize: '9px', color: '#FEB2B2', letterSpacing: '2px', textTransform: 'uppercase' }}>services à domicile</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>
            {themeMode === 'clair' ? '🌙' : '☀️'}
          </button>
          <button onClick={() => navigate('/')} style={{ background: 'white', color: c.bleu, border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>← Accueil</button>
          {!user && <button onClick={() => navigate('/auth')} style={{ background: c.rouge, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Connexion</button>}
        </div>
      </nav>

      <div style={{ flex: 1, maxWidth: '800px', margin: '2rem auto', padding: '0 1rem', width: '100%' }}>

        {showSignalement && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: c.fondClair, borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '420px', border: `1px solid ${c.bordure}` }}>
              {signalementEnvoye ? (
                <>
                  <h3 style={{ color: c.texteFonce, marginBottom: '1rem' }}>Signalement envoyé</h3>
                  <p style={{ color: c.texte, fontSize: '14px', marginBottom: '1.5rem' }}>Merci, notre équipe va examiner votre signalement dans les plus brefs délais.</p>
                  <button onClick={() => setShowSignalement(false)} style={{ width: '100%', padding: '12px', background: c.bleu, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Fermer</button>
                </>
              ) : (
                <>
                  <h3 style={{ color: c.texteFonce, marginBottom: '1rem' }}>Signaler ce prestataire</h3>
                  <form onSubmit={handleEnvoyerSignalement}>
                    <select value={motifSignalement} onChange={(e) => setMotifSignalement(e.target.value)} style={{ width: '100%', padding: '10px 14px', marginBottom: '10px', borderRadius: '8px', border: `1.5px solid ${c.bleuClair}`, background: c.inputFond, color: c.inputTexte, fontSize: '14px' }}>
                      {motifsSignalement.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <textarea placeholder="Décrivez la situation (optionnel)" value={descriptionSignalement} onChange={(e) => setDescriptionSignalement(e.target.value)} rows={4} style={{ width: '100%', padding: '10px 14px', marginBottom: '12px', borderRadius: '8px', border: `1.5px solid ${c.bleuClair}`, background: c.inputFond, color: c.inputTexte, fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box' }} />
                    {erreurSignalement && <p style={{ color: c.rouge, fontSize: '13px', marginBottom: '10px' }}>{erreurSignalement}</p>}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="submit" style={{ flex: 1, padding: '12px', background: c.rouge, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Envoyer le signalement</button>
                      <button type="button" onClick={() => setShowSignalement(false)} style={{ background: c.blanc, color: c.texteFonce, border: `1px solid ${c.bordure}`, padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Annuler</button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        <div style={{ background: c.fondClair, borderRadius: '16px', padding: '2rem', border: `1px solid ${c.bordure}`, marginBottom: '1.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '8px' }}>
            <button onClick={handlePartager} style={{ background: c.blanc, color: c.texteFonce, border: `1.5px solid ${c.texteFonce}`, borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🔗
            </button>
            {(!user || user.role === 'client') && (
              <button onClick={toggleFavori} style={{ background: estFavori ? c.rouge : c.blanc, color: estFavori ? 'white' : c.rouge, border: `1.5px solid ${c.rouge}`, borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {estFavori ? '❤️' : '🤍'}
              </button>
            )}
          </div>
          {lienCopie && (
            <div style={{ position: 'absolute', top: '4.5rem', right: '1.5rem', background: c.texteFonce, color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
              Lien copié !
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: c.bleu, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', fontWeight: 'bold', flexShrink: 0 }}>
              {prestataire.photo_url
                ? <img src={prestataire.photo_url} alt="profil" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                : `${prestataire.prenom?.charAt(0)}${prestataire.nom?.charAt(0)}`
              }
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ color: c.texteFonce, margin: '0 0 4px', fontFamily: 'Georgia, serif', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {prestataire.prenom} {prestataire.nom}
                {prestataire.verifie && <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '12px', padding: '3px 10px', borderRadius: '20px' }}>✅ Vérifié</span>}
              </h1>
              {(prestataire.ville || prestataire.code_postal) && (
                <p style={{ color: c.texte, fontSize: '13px', margin: '0 0 8px' }}>📍 {prestataire.ville} {prestataire.code_postal}</p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} style={{ fontSize: '18px', color: i <= Math.round(moyenne) ? '#F6AD55' : '#CBD5E0' }}>★</span>
                  ))}
                </div>
                <span style={{ color: c.texte, fontSize: '14px' }}>{moyenne} ({totalAvis} avis)</span>
                {prestataire.lien_google && (
                  <a href={prestataire.lien_google} target="_blank" rel="noopener noreferrer" style={{ background: c.blanc, color: c.bleu, border: `1px solid ${c.bleu}`, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    🔵 Voir les avis Google
                  </a>
                )}
              </div>
              {prestataire.description && (
                <p style={{ color: c.texte, fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{prestataire.description}</p>
              )}
            </div>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <span onClick={ouvrirSignalement} style={{ color: c.bordure, fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>🚩 Signaler ce prestataire</span>
          </div>
        </div>

        {realisations.length > 0 && (
          <>
            <h2 style={{ color: c.texteFonce, fontFamily: 'Georgia, serif', marginBottom: '1rem' }}>📸 Réalisations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {realisations.map(r => (
                <div key={r.id} style={{ background: c.fondClair, borderRadius: '12px', border: `1px solid ${c.bordure}`, overflow: 'hidden' }}>
                  <div style={{ height: '160px', background: c.texteFonce, overflow: 'hidden' }}>
                    {r.type_media === 'photo' ? (
                      <img src={r.media_url} alt={r.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <video src={r.media_url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  {(r.titre || r.description) && (
                    <div style={{ padding: '0.8rem' }}>
                      {r.titre && <p style={{ margin: '0 0 4px', color: c.texteFonce, fontWeight: 'bold', fontSize: '13px' }}>{r.titre}</p>}
                      {r.description && <p style={{ margin: 0, color: c.texte, fontSize: '12px' }}>{r.description}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <h2 style={{ color: c.texteFonce, fontFamily: 'Georgia, serif', marginBottom: '1rem' }}>Services proposés</h2>
        {services.length === 0 && <p style={{ color: c.texte }}>Aucun service disponible pour le moment.</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {services.map(service => (
            <div key={service.id} style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}` }}>
              <span style={{ background: c.bleuFond, color: c.bleu, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', textTransform: 'capitalize' }}>{service.categorie}</span>
              <h3 style={{ margin: '0.8rem 0 0.5rem', color: c.texteFonce, fontFamily: 'Georgia, serif' }}>{service.titre}</h3>
              <p style={{ color: c.texte, fontSize: '14px', marginBottom: '1rem' }}>{service.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '18px', color: c.rouge }}>{service.prix}€</span>
                  <span style={{ color: c.texte, fontSize: '13px', marginLeft: '6px' }}>{service.duree} min</span>
                </div>
                <button onClick={() => handleReserver(service.id)} style={{ background: c.rouge, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Réserver</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ color: c.texteFonce, fontFamily: 'Georgia, serif', margin: 0 }}>Avis clients ({totalAvis})</h2>
          {prestataire.lien_google && (
            <a href={prestataire.lien_google} target="_blank" rel="noopener noreferrer" style={{ background: c.bleu, color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontFamily: 'Georgia, serif' }}>
              ⭐ Laisser un avis sur Google
            </a>
          )}
        </div>
        {avis.length === 0 && <p style={{ color: c.texte, marginBottom: '2rem' }}>Aucun avis pour le moment.</p>}
        {avis.map(a => (
          <div key={a.id} style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: `1px solid ${c.bordure}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontWeight: 'bold', color: c.texteFonce }}>{a.users?.prenom} {a.users?.nom}</span>
                <span style={{ color: c.texte, fontSize: '13px', marginLeft: '8px' }}>— {a.services?.titre}</span>
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} style={{ fontSize: '18px', color: i <= a.note ? '#F6AD55' : '#CBD5E0' }}>★</span>
                ))}
              </div>
            </div>
            {a.commentaire && <p style={{ color: c.texte, fontSize: '14px', fontStyle: 'italic' }}>"{a.commentaire}"</p>}
            <p style={{ color: c.bordure, fontSize: '12px', marginTop: '8px' }}>{new Date(a.created_at).toLocaleDateString('fr-FR')}</p>

            {a.reponse_prestataire && (
              <div style={{ background: c.blanc, borderRadius: '8px', padding: '12px', marginTop: '12px', borderLeft: `3px solid ${c.bleu}` }}>
                <p style={{ color: c.bleu, fontSize: '12px', fontWeight: 'bold', margin: '0 0 4px' }}>Réponse de {prestataire.prenom} :</p>
                <p style={{ color: c.texte, fontSize: '13px', margin: 0 }}>{a.reponse_prestataire}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <footer style={{ background: c.texteFonce, color: '#BEE3F8', textAlign: 'center', padding: '1rem', fontSize: '13px' }}>
        © 2026 At Home Service — Tous droits réservés
      </footer>
    </div>
  )
}

export default ProfilPrestataire