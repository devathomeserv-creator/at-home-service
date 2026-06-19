import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getProfil, modifierProfil, changerMotDePasse, supprimerCompte, modifierConfirmationAuto, modifierDisponibilites, verifierSiret } from '../services/api'

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" fill="#2B6CB0"/>
      </svg>
    </div>
    <div>
      <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', lineHeight: 1.1 }}>At Home Service</div>
      <div style={{ fontSize: '9px', color: '#FEB2B2', letterSpacing: '2px', textTransform: 'uppercase' }}>services à domicile</div>
    </div>
  </div>
)

const Profil = () => {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const [vue, setVue] = useState('infos')
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [confirmationAuto, setConfirmationAuto] = useState(false)
  const [joursTravail, setJoursTravail] = useState([])
  const [heureDebut, setHeureDebut] = useState('09:00')
  const [heureFin, setHeureFin] = useState('18:00')
  const [siretInput, setSiretInput] = useState('')
  const [verifie, setVerifie] = useState(false)
  const [chargementSiret, setChargementSiret] = useState(false)
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', adresse: '', description: '', ville: '', code_postal: '' })
  const [mdpForm, setMdpForm] = useState({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirmer: '' })

  const joursDisponibles = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']

  useEffect(() => {
    chargerProfil()
  }, [])

  const chargerProfil = async () => {
    try {
      const res = await getProfil()
      const u = res.data.user
      setForm({ nom: u.nom || '', prenom: u.prenom || '', telephone: u.telephone || '', adresse: u.adresse || '', description: u.description || '', ville: u.ville || '', code_postal: u.code_postal || '' })
      setConfirmationAuto(u.confirmation_auto || false)
      setJoursTravail(u.jours_travail || [])
      setHeureDebut(u.heure_debut || '09:00')
      setHeureFin(u.heure_fin || '18:00')
      setVerifie(u.verifie || false)
      setSiretInput(u.siret || '')
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleMdpChange = (e) => {
    setMdpForm({ ...mdpForm, [e.target.name]: e.target.value })
  }

  const handleModifier = async (e) => {
    e.preventDefault()
    setMessage('')
    setErreur('')
    try {
      const res = await modifierProfil(form)
      login(res.data.user, localStorage.getItem('token'))
      setMessage('Profil mis à jour avec succès !')
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la mise à jour')
    }
  }

  const handleMdp = async (e) => {
    e.preventDefault()
    setMessage('')
    setErreur('')
    if (mdpForm.nouveau_mot_de_passe !== mdpForm.confirmer) {
      setErreur('Les mots de passe ne correspondent pas')
      return
    }
    try {
      await changerMotDePasse({ ancien_mot_de_passe: mdpForm.ancien_mot_de_passe, nouveau_mot_de_passe: mdpForm.nouveau_mot_de_passe })
      setMessage('Mot de passe modifié avec succès !')
      setMdpForm({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirmer: '' })
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors du changement')
    }
  }

  const handleConfirmationAuto = async (valeur) => {
    try {
      await modifierConfirmationAuto(valeur)
      setConfirmationAuto(valeur)
      setMessage(valeur ? 'Confirmation automatique activée !' : 'Confirmation automatique désactivée !')
    } catch (err) {
      setErreur('Erreur lors de la mise à jour')
    }
  }

  const toggleJour = (jour) => {
    if (joursTravail.includes(jour)) {
      setJoursTravail(joursTravail.filter(j => j !== jour))
    } else {
      setJoursTravail([...joursTravail, jour])
    }
  }

  const handleDisponibilites = async () => {
    setMessage('')
    setErreur('')
    try {
      await modifierDisponibilites({ jours_travail: joursTravail, heure_debut: heureDebut, heure_fin: heureFin })
      setMessage('Disponibilités mises à jour avec succès !')
    } catch (err) {
      setErreur('Erreur lors de la mise à jour des disponibilités')
    }
  }

  const handleVerifierSiret = async (e) => {
    e.preventDefault()
    setMessage('')
    setErreur('')
    setChargementSiret(true)
    try {
      const res = await verifierSiret(siretInput.replace(/\s/g, ''))
      setVerifie(true)
      setMessage(`✅ ${res.data.message} (${res.data.entreprise})`)
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la vérification')
    } finally {
      setChargementSiret(false)
    }
  }

  const handleSupprimer = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return
    try {
      await supprimerCompte()
      logout()
      navigate('/')
    } catch (err) {
      setErreur('Erreur lors de la suppression')
    }
  }

  const retourDashboard = () => {
    if (user?.role === 'client') navigate('/client')
    else if (user?.role === 'prestataire') navigate('/prestataire')
    else if (user?.role === 'admin') navigate('/admin')
  }

  const inputStyle = { width: '100%', padding: '10px 14px', marginBottom: '10px', borderRadius: '8px', border: '1.5px solid #90CDF4', background: 'white', color: '#1A202C', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Georgia, serif' }

  const tabs = user?.role === 'prestataire'
    ? ['infos', 'verification', 'parametres', 'disponibilites', 'mot-de-passe', 'supprimer']
    : ['infos', 'mot-de-passe', 'supprimer']

  return (
    <div style={{ minHeight: '100vh', background: '#C8A97A', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#2B6CB0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={retourDashboard} style={{ background: 'white', color: '#2B6CB0', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>← Mon espace</button>
          <button onClick={() => { logout(); navigate('/') }} style={{ background: '#C53030', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Déconnexion</button>
        </div>
      </nav>

      <div style={{ flex: 1, maxWidth: '600px', margin: '2rem auto', padding: '0 1rem', width: '100%' }}>

        <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '60px', height: '60px', background: '#2B6CB0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '22px', fontWeight: 'bold', flexShrink: 0 }}>
            {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
          </div>
          <div>
            <h2 style={{ color: '#1A365D', margin: 0, fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {user?.prenom} {user?.nom}
              {user?.role === 'prestataire' && verifie && <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '11px', padding: '2px 8px', borderRadius: '20px' }}>✅ Vérifié</span>}
            </h2>
            <p style={{ color: '#3D2B0F', fontSize: '13px', margin: '4px 0 0' }}>{user?.email}</p>
            <span style={{ background: '#EBF8FF', color: '#2B6CB0', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {tabs.map(v => (
            <button key={v} onClick={() => setVue(v)} style={{ flex: '1 1 auto', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === v ? '#2B6CB0' : '#F5ECD8', color: vue === v ? 'white' : '#1A365D', fontFamily: 'Georgia, serif', fontSize: '12px' }}>
              {v === 'infos' ? 'Mes infos' : v === 'verification' ? 'Vérification' : v === 'parametres' ? 'Paramètres' : v === 'disponibilites' ? 'Disponibilités' : v === 'mot-de-passe' ? 'Mot de passe' : 'Supprimer'}
            </button>
          ))}
        </div>

        {message && <p style={{ background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #A07840' }}>{message}</p>}
        {erreur && <p style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 16px', borderRadius: '8px', marginBottom: '1rem' }}>{erreur}</p>}

        {vue === 'infos' && (
          <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840' }}>
            <h3 style={{ color: '#1A365D', marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>Mes informations</h3>
            <form onSubmit={handleModifier}>
              <input name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} style={inputStyle} />
              <input name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} style={inputStyle} />
              <input name="telephone" placeholder="Téléphone" value={form.telephone} onChange={handleChange} style={inputStyle} />
              <input name="adresse" placeholder="Adresse" value={form.adresse} onChange={handleChange} style={inputStyle} />
              {user?.role === 'prestataire' && (
                <>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input name="ville" placeholder="Ville (ex: Nice)" value={form.ville} onChange={handleChange} style={{ ...inputStyle, flex: 2 }} />
                    <input name="code_postal" placeholder="Code postal" value={form.code_postal} onChange={handleChange} style={{ ...inputStyle, flex: 1 }} />
                  </div>
                  <textarea name="description" placeholder="Description de votre activité..." value={form.description} onChange={handleChange} rows={3} style={inputStyle} />
                </>
              )}
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#2B6CB0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>Sauvegarder</button>
            </form>
          </div>
        )}

        {vue === 'verification' && user?.role === 'prestataire' && (
          <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840' }}>
            <h3 style={{ color: '#1A365D', marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>Vérification de votre entreprise</h3>

            {verifie ? (
              <div style={{ background: '#d1fae5', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <p style={{ color: '#065f46', margin: 0, fontWeight: 'bold' }}>✅ Votre profil est vérifié !</p>
                <p style={{ color: '#065f46', margin: '4px 0 0', fontSize: '13px' }}>SIRET : {siretInput}</p>
              </div>
            ) : (
              <p style={{ color: '#3D2B0F', fontSize: '13px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Entrez votre numéro SIRET (14 chiffres). Nous vérifions automatiquement auprès du registre officiel des entreprises françaises que votre activité est bien déclarée et active.
              </p>
            )}

            <form onSubmit={handleVerifierSiret}>
              <input
                placeholder="Numéro SIRET (14 chiffres)"
                value={siretInput}
                onChange={(e) => setSiretInput(e.target.value)}
                maxLength={14}
                style={inputStyle}
              />
              <button type="submit" disabled={chargementSiret} style={{ width: '100%', padding: '12px', background: '#2B6CB0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>
                {chargementSiret ? 'Vérification en cours...' : verifie ? 'Mettre à jour mon SIRET' : 'Vérifier mon SIRET'}
              </button>
            </form>
          </div>
        )}

        {vue === 'parametres' && user?.role === 'prestataire' && (
          <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840' }}>
            <h3 style={{ color: '#1A365D', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>Paramètres prestataire</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #A07840' }}>
              <div>
                <p style={{ color: '#1A365D', fontWeight: 'bold', margin: '0 0 4px', fontSize: '14px' }}>Confirmation automatique</p>
                <p style={{ color: '#3D2B0F', fontSize: '12px', margin: 0 }}>Les réservations sont confirmées automatiquement</p>
              </div>
              <div onClick={() => handleConfirmationAuto(!confirmationAuto)} style={{ width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer', flexShrink: 0, marginLeft: '1rem', background: confirmationAuto ? '#2B6CB0' : '#CBD5E0', position: 'relative', transition: 'background 0.3s' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', transition: 'left 0.3s', left: confirmationAuto ? '25px' : '3px' }} />
              </div>
            </div>
          </div>
        )}

        {vue === 'disponibilites' && user?.role === 'prestataire' && (
          <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840' }}>
            <h3 style={{ color: '#1A365D', marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>Mes disponibilités</h3>
            <p style={{ color: '#3D2B0F', fontSize: '13px', marginBottom: '1rem' }}>Sélectionnez vos jours de travail :</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {joursDisponibles.map(jour => (
                <button key={jour} onClick={() => toggleJour(jour)} style={{ padding: '8px 14px', borderRadius: '20px', border: '1.5px solid #90CDF4', cursor: 'pointer', background: joursTravail.includes(jour) ? '#2B6CB0' : 'white', color: joursTravail.includes(jour) ? 'white' : '#1A365D', fontFamily: 'Georgia, serif', fontSize: '13px', textTransform: 'capitalize' }}>{jour}</button>
              ))}
            </div>
            <p style={{ color: '#3D2B0F', fontSize: '13px', marginBottom: '8px' }}>Heure de début :</p>
            <input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} style={inputStyle} />
            <p style={{ color: '#3D2B0F', fontSize: '13px', marginBottom: '8px' }}>Heure de fin :</p>
            <input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} style={inputStyle} />
            <button onClick={handleDisponibilites} style={{ width: '100%', padding: '12px', background: '#2B6CB0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px', marginTop: '8px' }}>Sauvegarder mes disponibilités</button>
          </div>
        )}

        {vue === 'mot-de-passe' && (
          <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840' }}>
            <h3 style={{ color: '#1A365D', marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>Changer mon mot de passe</h3>
            <form onSubmit={handleMdp}>
              <input name="ancien_mot_de_passe" type="password" placeholder="Ancien mot de passe" value={mdpForm.ancien_mot_de_passe} onChange={handleMdpChange} style={inputStyle} />
              <input name="nouveau_mot_de_passe" type="password" placeholder="Nouveau mot de passe" value={mdpForm.nouveau_mot_de_passe} onChange={handleMdpChange} style={inputStyle} />
              <input name="confirmer" type="password" placeholder="Confirmer le nouveau mot de passe" value={mdpForm.confirmer} onChange={handleMdpChange} style={inputStyle} />
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#2B6CB0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>Changer le mot de passe</button>
            </form>
          </div>
        )}

        {vue === 'supprimer' && (
          <div style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #C53030' }}>
            <h3 style={{ color: '#C53030', marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>Supprimer mon compte</h3>
            <p style={{ color: '#3D2B0F', fontSize: '14px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              ⚠️ Cette action est <strong>irréversible</strong>. Toutes vos données seront supprimées définitivement.
            </p>
            <button onClick={handleSupprimer} style={{ width: '100%', padding: '12px', background: '#C53030', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>Supprimer définitivement mon compte</button>
          </div>
        )}
      </div>

      <footer style={{ background: '#1A365D', color: '#BEE3F8', textAlign: 'center', padding: '1rem', fontSize: '13px' }}>
        © 2026 At Home Service — Tous droits réservés
      </footer>
    </div>
  )
}

export default Profil