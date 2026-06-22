import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { inscription, connexion } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const Auth = () => {
  const [searchParams] = useSearchParams()
  const codeParrainUrl = searchParams.get('parrain') || ''
  const [mode, setMode] = useState(codeParrainUrl ? 'inscription' : 'connexion')
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', mot_de_passe: '', role: 'client', telephone: '', code_parrain: codeParrainUrl
  })
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [appInstallable, setAppInstallable] = useState(false)
  const { login } = useAuth()
  const { mode: themeMode, toggleTheme, couleurs: c } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setAppInstallable(true)
    })
  }, [])

  const installerApp = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setAppInstallable(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      let res
      if (mode === 'connexion') {
        res = await connexion({ email: form.email, mot_de_passe: form.mot_de_passe })
      } else {
        res = await inscription(form)
      }
      login(res.data.user, res.data.token)
      const role = res.data.user.role
      if (role === 'client') navigate('/client')
      else if (role === 'prestataire') navigate('/prestataire')
      else if (role === 'admin') navigate('/admin')
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue')
    } finally {
      setChargement(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', marginBottom: '10px', borderRadius: '8px', border: `1.5px solid ${c.bleuClair}`, background: c.inputFond, color: c.inputTexte, fontSize: '14px', boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', background: c.fond, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>

      <button onClick={toggleTheme} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: c.fondClair, color: c.texteFonce, border: `1px solid ${c.bordure}`, padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }} title={themeMode === 'clair' ? 'Mode sombre' : 'Mode clair'}>
        {themeMode === 'clair' ? '🌙' : '☀️'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
        <div style={{ width: '48px', height: '48px', background: c.bleu, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
            <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" fill="white"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: c.texteFonce, lineHeight: 1.1 }}>At Home Service</div>
          <div style={{ fontSize: '11px', color: c.texte, letterSpacing: '2px', textTransform: 'uppercase' }}>services à domicile</div>
        </div>
      </div>

      {codeParrainUrl && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: '8px', marginBottom: '1rem', fontSize: '13px', maxWidth: '420px', textAlign: 'center' }}>
          🎉 Vous avez été parrainé ! Code : <strong>{codeParrainUrl}</strong>
        </div>
      )}

      <div style={{ background: c.fondClair, borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '420px', border: `1px solid ${c.bordure}` }}>
        <p style={{ textAlign: 'center', color: c.texte, fontSize: '14px', fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Plus besoin de chercher, un clic et trouvez votre artisan à domicile
        </p>

        <div style={{ display: 'flex', marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', border: `1.5px solid ${c.bleuClair}` }}>
          <button onClick={() => setMode('connexion')} style={{ flex: 1, padding: '10px', border: 'none', cursor: 'pointer', background: mode === 'connexion' ? c.bleu : c.blanc, color: mode === 'connexion' ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif' }}>Connexion</button>
          <button onClick={() => setMode('inscription')} style={{ flex: 1, padding: '10px', border: 'none', cursor: 'pointer', background: mode === 'inscription' ? c.bleu : c.blanc, color: mode === 'inscription' ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif' }}>Inscription</button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'inscription' && (
            <>
              <input name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} required style={inputStyle} />
              <input name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} required style={inputStyle} />
              <input name="telephone" placeholder="Téléphone" value={form.telephone} onChange={handleChange} style={inputStyle} />
              <select name="role" value={form.role} onChange={handleChange} style={inputStyle}>
                <option value="client">Je suis un client</option>
                <option value="prestataire">Je suis un prestataire</option>
              </select>
              <input name="code_parrain" placeholder="Code de parrainage (optionnel)" value={form.code_parrain} onChange={handleChange} style={inputStyle} />
            </>
          )}
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={inputStyle} />
          <input name="mot_de_passe" type="password" placeholder="Mot de passe" value={form.mot_de_passe} onChange={handleChange} required style={inputStyle} />

          {erreur && <p style={{ color: c.rouge, fontSize: '14px', marginBottom: '10px', textAlign: 'center' }}>{erreur}</p>}

          <button type="submit" disabled={chargement} style={{ width: '100%', padding: '12px', background: c.rouge, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', marginTop: '4px', fontFamily: 'Georgia, serif' }}>
            {chargement ? 'Chargement...' : mode === 'connexion' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        {appInstallable && (
          <button onClick={installerApp} style={{ width: '100%', padding: '12px', background: c.texteFonce, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginTop: '12px', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            📱 Télécharger l'application
          </button>
        )}
      </div>

      <p style={{ color: c.texte, fontSize: '12px', marginTop: '1rem' }}>
        <span onClick={() => navigate('/mentions-legales')} style={{ cursor: 'pointer', textDecoration: 'underline', color: c.texteFonce }}>Mentions légales et CGU</span>
      </p>

      <p style={{ color: c.texte, fontSize: '12px', marginTop: '0.5rem' }}>© 2026 At Home Service — Tous droits réservés</p>
    </div>
  )
}

export default Auth