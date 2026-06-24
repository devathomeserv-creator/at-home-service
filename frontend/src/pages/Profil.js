import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { useNavigate } from 'react-router-dom'
import { getProfil, modifierProfil, changerMotDePasse, supprimerCompte, modifierConfirmationAuto, modifierDisponibilites, verifierSiret, getMonParrainage } from '../services/api'

const drapeaux = { fr: '🇫🇷', en: '🇬🇧', it: '🇮🇹', ru: '🇷🇺' }

const Profil = () => {
  const { user, login, logout } = useAuth()
  const { mode: themeMode, toggleTheme, couleurs: c } = useTheme()
  const { langue, changerLangue, t } = useLanguage()
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
  const [parrainage, setParrainage] = useState(null)
  const [lienParrainCopie, setLienParrainCopie] = useState(false)
  const [selecteurLangueOuvert, setSelecteurLangueOuvert] = useState(false)
  const [languesParlees, setLanguesParlees] = useState([])
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', adresse: '', description: '', ville: '', code_postal: '', lien_google: '' })
  const [mdpForm, setMdpForm] = useState({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirmer: '' })

  const joursDisponibles = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
  const languesDisponibles = ['fr', 'en', 'it', 'ru']

  useEffect(() => {
    chargerProfil()
    chargerParrainage()
  }, [])

  const chargerProfil = async () => {
    try {
      const res = await getProfil()
      const u = res.data.user
      setForm({ nom: u.nom || '', prenom: u.prenom || '', telephone: u.telephone || '', adresse: u.adresse || '', description: u.description || '', ville: u.ville || '', code_postal: u.code_postal || '', lien_google: u.lien_google || '' })
      setConfirmationAuto(u.confirmation_auto || false)
      setJoursTravail(u.jours_travail || [])
      setHeureDebut(u.heure_debut || '09:00')
      setHeureFin(u.heure_fin || '18:00')
      setVerifie(u.verifie || false)
      setSiretInput(u.siret || '')
      setLanguesParlees(u.langues_parlees || [])
    } catch (err) {
      console.error(err)
    }
  }

  const chargerParrainage = async () => {
    try {
      const res = await getMonParrainage()
      setParrainage(res.data)
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

  const toggleLangueParlee = (l) => {
    if (languesParlees.includes(l)) {
      setLanguesParlees(languesParlees.filter(x => x !== l))
    } else {
      setLanguesParlees([...languesParlees, l])
    }
  }

  const handleModifier = async (e) => {
    e.preventDefault()
    setMessage('')
    setErreur('')
    try {
      const res = await modifierProfil({ ...form, langues_parlees: languesParlees })
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

  const handleCopierLienParrainage = async () => {
    if (!parrainage) return
    const lien = `${window.location.origin}/auth?parrain=${parrainage.code_parrainage}`
    try {
      await navigator.clipboard.writeText(lien)
      setLienParrainCopie(true)
      setTimeout(() => setLienParrainCopie(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const handlePartagerParrainage = async () => {
    if (!parrainage) return
    const lien = `${window.location.origin}/auth?parrain=${parrainage.code_parrainage}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Rejoins At Home Service', text: `Utilise mon code ${parrainage.code_parrainage} pour t'inscrire !`, url: lien })
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err)
      }
    } else {
      handleCopierLienParrainage()
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

  const inputStyle = { width: '100%', padding: '10px 14px', marginBottom: '10px', borderRadius: '8px', border: `1.5px solid ${c.bleuClair}`, background: c.inputFond, color: c.inputTexte, fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Georgia, serif' }

  const tabs = user?.role === 'prestataire'
    ? ['infos', 'verification', 'parametres', 'disponibilites', 'parrainage', 'mot-de-passe', 'supprimer']
    : ['infos', 'parrainage', 'mot-de-passe', 'supprimer']

  const jourKey = (j) => t(j)
  const langueLabelKey = (l) => t(`${l}_label`)

  return (
    <div style={{ minHeight: '100vh', background: c.fond, display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: c.bleu, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
          <button onClick={() => setSelecteurLangueOuvert(!selecteurLangueOuvert)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>
            {drapeaux[langue]}
          </button>
          {selecteurLangueOuvert && (
            <div style={{ position: 'absolute', top: '100%', right: '6rem', marginTop: '8px', background: c.fondClair, borderRadius: '8px', border: `1px solid ${c.bordure}`, overflow: 'hidden', zIndex: 200 }}>
              {Object.keys(drapeaux).map(l => (
                <div key={l} onClick={() => { changerLangue(l); setSelecteurLangueOuvert(false) }} style={{ padding: '10px 16px', cursor: 'pointer', color: c.texteFonce, fontSize: '14px', background: langue === l ? c.bleuFond : 'transparent', whiteSpace: 'nowrap' }}>
                  {drapeaux[l]} {l.toUpperCase()}
                </div>
              ))}
            </div>
          )}
          <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>
            {themeMode === 'clair' ? '🌙' : '☀️'}
          </button>
          <button onClick={retourDashboard} style={{ background: 'white', color: c.bleu, border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{t('mon_espace')}</button>
          <button onClick={() => { logout(); navigate('/') }} style={{ background: c.rouge, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{t('deconnexion')}</button>
        </div>
      </nav>

      <div style={{ flex: 1, maxWidth: '600px', margin: '2rem auto', padding: '0 1rem', width: '100%' }}>

        <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}`, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '60px', height: '60px', background: c.bleu, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '22px', fontWeight: 'bold', flexShrink: 0 }}>
            {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
          </div>
          <div>
            <h2 style={{ color: c.texteFonce, margin: 0, fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {user?.prenom} {user?.nom}
              {user?.role === 'prestataire' && verifie && <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '11px', padding: '2px 8px', borderRadius: '20px' }}>{t('verifie')}</span>}
            </h2>
            <p style={{ color: c.texte, fontSize: '13px', margin: '4px 0 0' }}>{user?.email}</p>
            <span style={{ background: c.bleuFond, color: c.bleu, padding: '2px 10px', borderRadius: '20px', fontSize: '11px', textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {tabs.map(v => (
            <button key={v} onClick={() => setVue(v)} style={{ flex: '1 1 auto', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vue === v ? c.bleu : c.fondClair, color: vue === v ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif', fontSize: '12px' }}>
              {v === 'infos' ? t('mes_infos') : v === 'verification' ? t('verification') : v === 'parametres' ? t('parametres') : v === 'disponibilites' ? t('disponibilites') : v === 'parrainage' ? t('parrainage_onglet') : v === 'mot-de-passe' ? t('mdp_onglet') : t('supprimer_onglet')}
            </button>
          ))}
        </div>

        {message && <p style={{ background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: '8px', marginBottom: '1rem', border: `1px solid ${c.bordure}` }}>{message}</p>}
        {erreur && <p style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 16px', borderRadius: '8px', marginBottom: '1rem' }}>{erreur}</p>}

        {vue === 'infos' && (
          <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}` }}>
            <h3 style={{ color: c.texteFonce, marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>{t('mes_informations')}</h3>
            <form onSubmit={handleModifier}>
              <input name="prenom" placeholder={t('prenom')} value={form.prenom} onChange={handleChange} style={inputStyle} />
              <input name="nom" placeholder={t('nom')} value={form.nom} onChange={handleChange} style={inputStyle} />
              <input name="telephone" placeholder={t('telephone')} value={form.telephone} onChange={handleChange} style={inputStyle} />
              <input name="adresse" placeholder={t('adresse')} value={form.adresse} onChange={handleChange} style={inputStyle} />
              {user?.role === 'prestataire' && (
                <>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input name="ville" placeholder={t('ville')} value={form.ville} onChange={handleChange} style={{ ...inputStyle, flex: 2 }} />
                    <input name="code_postal" placeholder={t('code_postal')} value={form.code_postal} onChange={handleChange} style={{ ...inputStyle, flex: 1 }} />
                  </div>
                  <textarea name="description" placeholder={t('description_activite')} value={form.description} onChange={handleChange} rows={3} style={inputStyle} />
                  <input name="lien_google" placeholder={t('lien_google_placeholder')} value={form.lien_google} onChange={handleChange} style={inputStyle} />
                  <p style={{ color: c.texte, fontSize: '12px', marginBottom: '12px' }}>{t('lien_google_info')}</p>

                  <p style={{ color: c.texteFonce, fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>{t('langues_parlees_label')}</p>
                  <p style={{ color: c.texte, fontSize: '12px', marginBottom: '10px' }}>{t('langues_parlees_info')}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {languesDisponibles.map(l => (
                      <button key={l} type="button" onClick={() => toggleLangueParlee(l)} style={{ padding: '8px 14px', borderRadius: '20px', border: `1.5px solid ${c.bleuClair}`, cursor: 'pointer', background: languesParlees.includes(l) ? c.bleu : c.blanc, color: languesParlees.includes(l) ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {drapeaux[l]} {langueLabelKey(l)}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <button type="submit" style={{ width: '100%', padding: '12px', background: c.bleu, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>{t('sauvegarder')}</button>
            </form>
          </div>
        )}

        {vue === 'verification' && user?.role === 'prestataire' && (
          <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}` }}>
            <h3 style={{ color: c.texteFonce, marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>{t('verification_entreprise')}</h3>

            {verifie ? (
              <div style={{ background: '#d1fae5', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <p style={{ color: '#065f46', margin: 0, fontWeight: 'bold' }}>{t('profil_verifie')}</p>
                <p style={{ color: '#065f46', margin: '4px 0 0', fontSize: '13px' }}>{t('siret_label')} {siretInput}</p>
              </div>
            ) : (
              <p style={{ color: c.texte, fontSize: '13px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {t('siret_info')}
              </p>
            )}

            <form onSubmit={handleVerifierSiret}>
              <input
                placeholder={t('siret_placeholder')}
                value={siretInput}
                onChange={(e) => setSiretInput(e.target.value)}
                maxLength={14}
                style={inputStyle}
              />
              <button type="submit" disabled={chargementSiret} style={{ width: '100%', padding: '12px', background: c.bleu, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>
                {chargementSiret ? t('verification_en_cours') : verifie ? t('mettre_a_jour_siret') : t('verifier_siret')}
              </button>
            </form>
          </div>
        )}

        {vue === 'parametres' && user?.role === 'prestataire' && (
          <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}` }}>
            <h3 style={{ color: c.texteFonce, marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>{t('parametres_prestataire')}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: c.blanc, borderRadius: '8px', border: `1px solid ${c.bordure}` }}>
              <div>
                <p style={{ color: c.texteFonce, fontWeight: 'bold', margin: '0 0 4px', fontSize: '14px' }}>{t('confirmation_auto_titre')}</p>
                <p style={{ color: c.texte, fontSize: '12px', margin: 0 }}>{t('confirmation_auto_desc')}</p>
              </div>
              <div onClick={() => handleConfirmationAuto(!confirmationAuto)} style={{ width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer', flexShrink: 0, marginLeft: '1rem', background: confirmationAuto ? c.bleu : '#CBD5E0', position: 'relative', transition: 'background 0.3s' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', transition: 'left 0.3s', left: confirmationAuto ? '25px' : '3px' }} />
              </div>
            </div>
          </div>
        )}

        {vue === 'disponibilites' && user?.role === 'prestataire' && (
          <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}` }}>
            <h3 style={{ color: c.texteFonce, marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>{t('mes_disponibilites')}</h3>
            <p style={{ color: c.texte, fontSize: '13px', marginBottom: '1rem' }}>{t('jours_travail_info')}</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {joursDisponibles.map(jour => (
                <button key={jour} onClick={() => toggleJour(jour)} style={{ padding: '8px 14px', borderRadius: '20px', border: `1.5px solid ${c.bleuClair}`, cursor: 'pointer', background: joursTravail.includes(jour) ? c.bleu : c.blanc, color: joursTravail.includes(jour) ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif', fontSize: '13px' }}>{jourKey(jour)}</button>
              ))}
            </div>
            <p style={{ color: c.texte, fontSize: '13px', marginBottom: '8px' }}>{t('heure_debut')}</p>
            <input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} style={inputStyle} />
            <p style={{ color: c.texte, fontSize: '13px', marginBottom: '8px' }}>{t('heure_fin')}</p>
            <input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} style={inputStyle} />
            <button onClick={handleDisponibilites} style={{ width: '100%', padding: '12px', background: c.bleu, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px', marginTop: '8px' }}>{t('sauvegarder_disponibilites')}</button>
          </div>
        )}

        {vue === 'parrainage' && parrainage && (
          <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}` }}>
            <h3 style={{ color: c.texteFonce, marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>{t('parrainez_amis')}</h3>
            <p style={{ color: c.texte, fontSize: '13px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {t('parrainage_info')}
            </p>

            <div style={{ background: c.blanc, borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem', border: `2px dashed ${c.bleu}` }}>
              <p style={{ color: c.texte, fontSize: '12px', margin: '0 0 8px' }}>{t('code_parrainage_titre')}</p>
              <p style={{ color: c.bleu, fontSize: '28px', fontWeight: 'bold', margin: 0, letterSpacing: '2px' }}>{parrainage.code_parrainage}</p>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button onClick={handlePartagerParrainage} style={{ flex: 1, background: c.rouge, color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{t('partager_lien')}</button>
              <button onClick={handleCopierLienParrainage} style={{ background: c.blanc, color: c.texteFonce, border: `1.5px solid ${c.texteFonce}`, padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                {lienParrainCopie ? t('copie') : t('copier')}
              </button>
            </div>

            <div style={{ borderTop: `1px solid ${c.bordure}`, paddingTop: '1rem' }}>
              <p style={{ color: c.texteFonce, fontWeight: 'bold', marginBottom: '0.8rem' }}>{t('vos_filleuls')} ({parrainage.totalFilleuls})</p>
              {parrainage.filleuls.length === 0 && <p style={{ color: c.texte, fontSize: '13px' }}>{t('aucun_filleul')}</p>}
              {parrainage.filleuls.map(f => (
                <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${c.bordure}` }}>
                  <span style={{ color: c.texteFonce, fontSize: '14px' }}>{f.prenom} {f.nom}</span>
                  <span style={{ color: c.texte, fontSize: '12px' }}>{new Date(f.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {vue === 'mot-de-passe' && (
          <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}` }}>
            <h3 style={{ color: c.texteFonce, marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>{t('changer_mdp')}</h3>
            <form onSubmit={handleMdp}>
              <input name="ancien_mot_de_passe" type="password" placeholder={t('ancien_mdp')} value={mdpForm.ancien_mot_de_passe} onChange={handleMdpChange} style={inputStyle} />
              <input name="nouveau_mot_de_passe" type="password" placeholder={t('nouveau_mdp')} value={mdpForm.nouveau_mot_de_passe} onChange={handleMdpChange} style={inputStyle} />
              <input name="confirmer" type="password" placeholder={t('confirmer_mdp')} value={mdpForm.confirmer} onChange={handleMdpChange} style={inputStyle} />
              <button type="submit" style={{ width: '100%', padding: '12px', background: c.bleu, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>{t('changer_mdp_btn')}</button>
            </form>
          </div>
        )}

        {vue === 'supprimer' && (
          <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.rouge}` }}>
            <h3 style={{ color: c.rouge, marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>{t('supprimer_compte_titre')}</h3>
            <p style={{ color: c.texte, fontSize: '14px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              ⚠️ {t('supprimer_compte_avertissement')}
            </p>
            <button onClick={handleSupprimer} style={{ width: '100%', padding: '12px', background: c.rouge, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>{t('supprimer_definitivement')}</button>
          </div>
        )}
      </div>

      <footer style={{ background: c.texteFonce, color: '#BEE3F8', textAlign: 'center', padding: '1rem', fontSize: '13px' }}>
        {t('footer_droits')}
      </footer>
    </div>
  )
}

export default Profil