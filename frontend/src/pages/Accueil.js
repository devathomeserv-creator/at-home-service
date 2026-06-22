import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPrestatairesListe } from '../services/api'
import { ajouterRecherche, getHistorique, retirerRecherche } from '../services/historiqueRecherche'
import { useTheme } from '../context/ThemeContext'

const imagesParCategorie = {
  coiffure: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=200&fit=crop',
  barber: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=200&fit=crop',
  esthetique: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=200&fit=crop',
  massage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=200&fit=crop',
  plomberie: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=300&h=200&fit=crop',
  electricite: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=200&fit=crop',
  maconnerie: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
  renovation: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop',
  'coach sportif': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
  photographe: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=300&h=200&fit=crop'
}

const Etoiles = ({ note }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ fontSize: '14px', color: i <= Math.round(note) ? '#F6AD55' : '#CBD5E0' }}>★</span>
    ))}
  </div>
)

const Accueil = () => {
  const navigate = useNavigate()
  const { mode, toggleTheme, couleurs: c } = useTheme()
  const [prestataires, setPrestataires] = useState([])
  const [recherche, setRecherche] = useState('')
  const [ville, setVille] = useState('')
  const [categorie, setCategorie] = useState('')
  const [prestatairesFiltres, setPrestatairesFiltres] = useState([])
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [historique, setHistorique] = useState([])

  const categories = [
    { nom: 'coiffure', image: imagesParCategorie.coiffure },
    { nom: 'barber', image: imagesParCategorie.barber },
    { nom: 'esthetique', image: imagesParCategorie.esthetique },
    { nom: 'massage', image: imagesParCategorie.massage },
    { nom: 'plomberie', image: imagesParCategorie.plomberie },
    { nom: 'electricite', image: imagesParCategorie.electricite },
    { nom: 'maconnerie', image: imagesParCategorie.maconnerie },
    { nom: 'renovation', image: imagesParCategorie.renovation },
    { nom: 'coach sportif', image: imagesParCategorie['coach sportif'] },
    { nom: 'photographe', image: imagesParCategorie.photographe }
  ]

  useEffect(() => {
    chargerPrestataires()
    setHistorique(getHistorique())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ville, categorie])

  useEffect(() => {
    filtrer()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recherche, prestataires])

  const chargerPrestataires = async () => {
    try {
      const res = await getPrestatairesListe(categorie, ville)
      setPrestataires(res.data.prestataires)
      setPrestatairesFiltres(res.data.prestataires)
    } catch (err) {
      console.error(err)
    }
  }

  const filtrer = () => {
    let resultats = prestataires
    if (recherche) {
      resultats = resultats.filter(p =>
        `${p.prenom} ${p.nom}`.toLowerCase().includes(recherche.toLowerCase()) ||
        p.services.some(s => s.titre.toLowerCase().includes(recherche.toLowerCase()) || s.categorie.toLowerCase().includes(recherche.toLowerCase()))
      )
    }
    setPrestatairesFiltres(resultats)
  }

  const filtrerCategorie = (cat) => {
    setCategorie(categorie === cat ? '' : cat)
  }

  const handleRecherche = () => {
    if (recherche.trim()) {
      ajouterRecherche(recherche.trim())
      setHistorique(getHistorique())
    }
  }

  const handleClicHistorique = (terme) => {
    setRecherche(terme)
  }

  const handleRetirerHistorique = (terme, e) => {
    e.stopPropagation()
    retirerRecherche(terme)
    setHistorique(getHistorique())
  }

  return (
    <div style={{ minHeight: '100vh', background: c.fond, display: 'flex', flexDirection: 'column' }}>

      <nav style={{ background: c.bleu, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" fill={c.bleu}/>
            </svg>
          </div>
          <div>
            <div style={{ color: 'white', fontSize: '16px', fontWeight: '500', lineHeight: 1.1 }}>At Home Service</div>
            <div style={{ color: '#FEB2B2', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase' }}>services à domicile</div>
          </div>
        </div>
        <div className="nav-desktop" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }} title={mode === 'clair' ? 'Mode sombre' : 'Mode clair'}>
            {mode === 'clair' ? '🌙' : '☀️'}
          </button>
          <button onClick={() => navigate('/carte')} style={{ background: c.texteFonce, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>🗺️ Carte</button>
          <button onClick={() => navigate('/auth')} style={{ background: 'white', color: c.bleu, border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Connexion</button>
          <button onClick={() => navigate('/auth')} style={{ background: c.rouge, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>S'inscrire</button>
        </div>
        <button onClick={() => setMenuOuvert(!menuOuvert)} className="nav-mobile" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'none' }}>
          <div style={{ width: '24px', height: '2px', background: 'white', margin: '5px 0' }}></div>
          <div style={{ width: '24px', height: '2px', background: 'white', margin: '5px 0' }}></div>
          <div style={{ width: '24px', height: '2px', background: 'white', margin: '5px 0' }}></div>
        </button>
        {menuOuvert && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: c.bleu, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 100, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <button onClick={() => { toggleTheme() }} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>{mode === 'clair' ? '🌙 Mode sombre' : '☀️ Mode clair'}</button>
            <button onClick={() => { navigate('/carte'); setMenuOuvert(false) }} style={{ background: c.texteFonce, color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>🗺️ Carte</button>
            <button onClick={() => { navigate('/auth'); setMenuOuvert(false) }} style={{ background: 'white', color: c.bleu, border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>Connexion</button>
            <button onClick={() => { navigate('/auth'); setMenuOuvert(false) }} style={{ background: c.rouge, color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>S'inscrire</button>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 600px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: block !important; }
          .hero-title { font-size: 22px !important; }
          .search-box { flex-direction: column !important; }
          .footer-grid { flex-direction: column !important; }
          .presta-card { flex-direction: column !important; }
          .presta-image { width: 100% !important; height: 160px !important; }
        }
      `}</style>

      <div style={{ background: c.fondMoyen, padding: '40px 16px', textAlign: 'center' }}>
        <h1 className="hero-title" style={{ fontSize: '32px', color: c.texteFonce, marginBottom: '8px', lineHeight: 1.3, fontFamily: 'Georgia, serif' }}>Des pros à domicile,<br />quand vous en avez besoin</h1>
        <p style={{ color: c.texte, fontSize: '15px', fontStyle: 'italic', marginBottom: '32px', padding: '0 8px' }}>Plus besoin de chercher, un clic et trouvez votre artisan à domicile</p>
        <div className="search-box" style={{ background: c.fondClair, borderRadius: '12px', padding: '16px', maxWidth: '700px', margin: '0 auto', display: 'flex', gap: '8px', border: `1px solid ${c.bordure}` }}>
          <input placeholder="Quel service ou prestataire ?" value={recherche} onChange={(e) => setRecherche(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRecherche()} style={{ flex: 2, padding: '12px 16px', borderRadius: '8px', border: `1.5px solid ${c.bleuClair}`, fontSize: '14px', fontFamily: 'Georgia, serif', width: '100%', background: c.inputFond, color: c.inputTexte }} />
          <input placeholder="📍 Ville (ex: Nice)" value={ville} onChange={(e) => setVille(e.target.value)} style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: `1.5px solid ${c.bleuClair}`, fontSize: '14px', fontFamily: 'Georgia, serif', width: '100%', background: c.inputFond, color: c.inputTexte }} />
          <button onClick={handleRecherche} style={{ background: c.rouge, color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '14px', whiteSpace: 'nowrap' }}>Rechercher</button>
        </div>
        {historique.length > 0 && (
          <div style={{ maxWidth: '700px', margin: '12px auto 0', display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            <span style={{ color: c.texteFonce, fontSize: '12px', marginRight: '4px' }}>Récentes :</span>
            {historique.map(terme => (
              <span key={terme} onClick={() => handleClicHistorique(terme)} style={{ background: c.fondClair, color: c.texteFonce, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', border: `1px solid ${c.bordure}`, display: 'flex', alignItems: 'center', gap: '6px' }}>
                🕐 {terme}
                <span onClick={(e) => handleRetirerHistorique(terme, e)} style={{ color: c.rouge, fontWeight: 'bold' }}>✕</span>
              </span>
            ))}
          </div>
        )}
        {ville && (
          <p style={{ color: c.texteFonce, fontSize: '13px', marginTop: '12px' }}>
            Résultats pour : <strong>{ville}</strong> <span onClick={() => setVille('')} style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: '8px' }}>✕ effacer</span>
          </p>
        )}
        <p style={{ marginTop: '16px' }}>
          <span onClick={() => navigate('/carte')} style={{ color: c.texteFonce, fontSize: '13px', textDecoration: 'underline', cursor: 'pointer' }}>🗺️ Voir tous les prestataires sur une carte</span>
        </p>
      </div>

      <div style={{ background: c.fond, padding: '32px 16px' }}>
        <h2 style={{ color: c.texteFonce, textAlign: 'center', marginBottom: '24px', fontFamily: 'Georgia, serif', fontSize: '20px' }}>Nos services à domicile</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', maxWidth: '1100px', margin: '0 auto' }}>
          {categories.map(cat => (
            <div key={cat.nom} onClick={() => filtrerCategorie(cat.nom)} style={{ borderRadius: '12px', overflow: 'hidden', border: categorie === cat.nom ? `3px solid ${c.bleu}` : `1px solid ${c.bordure}`, cursor: 'pointer', background: c.fondClair }}>
              <div style={{ height: '100px', overflow: 'hidden' }}>
                <img src={cat.image} alt={cat.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: categorie === cat.nom ? c.bleu : c.texteFonce, fontWeight: '500', textTransform: 'capitalize', fontFamily: 'Georgia, serif' }}>{cat.nom}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: '900px', margin: '2rem auto', padding: '0 1rem', width: '100%' }}>
        <h2 style={{ color: c.texteFonce, marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>
          {prestatairesFiltres.length} prestataire{prestatairesFiltres.length > 1 ? 's' : ''} disponible{prestatairesFiltres.length > 1 ? 's' : ''}
        </h2>
        {prestatairesFiltres.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: c.texte }}>
            <p style={{ fontSize: '18px' }}>Aucun prestataire trouvé</p>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {prestatairesFiltres.map(p => {
            const categoriePrincipale = p.services[0]?.categorie || 'coiffure'
            const prixMin = Math.min(...p.services.map(s => s.prix))
            return (
              <div key={p.id} className="presta-card" onClick={() => navigate(`/prestataire/${p.id}`)} style={{ background: c.fondClair, borderRadius: '12px', border: `1px solid ${c.bordure}`, display: 'flex', overflow: 'hidden', cursor: 'pointer' }}>
                <div className="presta-image" style={{ width: '180px', height: '160px', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                  {p.photo_url
                    ? <img src={p.photo_url} alt={p.prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <img src={imagesParCategorie[categoriePrincipale] || imagesParCategorie.coiffure} alt={categoriePrincipale} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  }
                </div>
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', color: c.texteFonce, fontFamily: 'Georgia, serif', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {p.prenom} {p.nom}
                      {p.verifie && <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '10px', padding: '2px 8px', borderRadius: '20px' }}>✅ Vérifié</span>}
                    </h3>
                    {(p.ville || p.code_postal) && <p style={{ color: c.texte, fontSize: '13px', margin: '0 0 6px' }}>📍 {p.ville} {p.code_postal}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Etoiles note={p.moyenne} />
                      <span style={{ color: c.texte, fontSize: '12px' }}>{p.moyenne} ({p.totalAvis} avis)</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[...new Set(p.services.map(s => s.categorie))].map(cat => (
                        <span key={cat} style={{ background: c.bleuFond, color: c.bleu, padding: '2px 8px', borderRadius: '20px', fontSize: '11px', textTransform: 'capitalize' }}>{cat}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <span style={{ color: c.texte, fontSize: '13px' }}>À partir de <strong style={{ color: c.rouge, fontSize: '16px' }}>{prixMin}€</strong></span>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/prestataire/${p.id}`) }} style={{ background: c.rouge, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Voir le profil</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ background: c.fondClair, padding: '40px 16px', textAlign: 'center' }}>
        <h2 style={{ color: c.texteFonce, fontSize: '22px', marginBottom: '32px', fontFamily: 'Georgia, serif' }}>Comment ça marche ?</h2>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '700px', margin: '0 auto' }}>
          {[
            { num: '1', titre: 'Cherchez un service', desc: 'Tapez le service et la ville dont vous avez besoin et trouvez les pros disponibles près de chez vous' },
            { num: '2', titre: 'Choisissez et réservez', desc: 'Consultez les avis, les tarifs et réservez en quelques clics avec notre calendrier' },
            { num: '3', titre: 'Le pro vient chez vous', desc: "Votre artisan se déplace à domicile à l'heure convenue. Profitez !" }
          ].map(step => (
            <div key={step.num} style={{ flex: 1, minWidth: '200px', background: c.blanc, borderRadius: '12px', padding: '20px', border: `1px solid ${c.bordure}` }}>
              <div style={{ width: '36px', height: '36px', background: c.bleu, borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', margin: '0 auto 12px' }}>{step.num}</div>
              <div style={{ color: c.texteFonce, fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>{step.titre}</div>
              <div style={{ color: c.texte, fontSize: '12px', lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: c.bleu, padding: '40px 16px', textAlign: 'center' }}>
        <h2 style={{ color: 'white', fontSize: '20px', marginBottom: '28px', fontFamily: 'Georgia, serif' }}>At Home Service en chiffres</h2>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '700px', margin: '0 auto' }}>
          {[
            { num: '10', label: 'Corps de métiers' },
            { num: '100%', label: 'Pros vérifiés' },
            { num: '24/7', label: 'Réservation en ligne' },
            { num: '🔒', label: 'Paiement sécurisé' }
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ color: 'white', fontSize: '28px', fontWeight: '500' }}>{stat.num}</div>
              <div style={{ color: '#BEE3F8', fontSize: '12px', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: c.fond, padding: '40px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', textAlign: 'center' }}>
        <div>
          <h2 style={{ color: c.texteFonce, fontSize: '20px', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>Vous êtes un professionnel ?</h2>
          <p style={{ color: c.texte, fontSize: '13px', maxWidth: '300px', lineHeight: 1.6, margin: '0 auto' }}>Rejoignez At Home Service et développez votre clientèle. Créez votre profil gratuitement et commencez à recevoir des réservations dès aujourd'hui.</p>
        </div>
        <button onClick={() => navigate('/auth')} style={{ background: c.rouge, color: 'white', border: 'none', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>Rejoindre la plateforme</button>
      </div>

      <footer style={{ background: c.texteFonce, padding: '28px 16px' }}>
        <div className="footer-grid" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '24px', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div>
            <div style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '10px' }}>At Home Service</div>
            <p style={{ color: '#90CDF4', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.6 }}>Plus besoin de chercher,<br />un clic et trouvez votre<br />artisan à domicile</p>
          </div>
          <div>
            <div style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '10px' }}>Services</div>
            <div style={{ color: '#90CDF4', fontSize: '12px', lineHeight: 1.8 }}>Coiffure · Barber<br />Massage · Esthétique<br />Plomberie · Électricité<br />Maçonnerie · Rénovation<br />Coach sportif · Photographe</div>
          </div>
          <div>
            <div style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '10px' }}>Liens utiles</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span onClick={() => navigate('/carte')} style={{ color: '#90CDF4', fontSize: '12px', cursor: 'pointer' }}>Carte des prestataires</span>
              <span onClick={() => navigate('/mentions-legales')} style={{ color: '#90CDF4', fontSize: '12px', cursor: 'pointer' }}>Mentions légales et CGU</span>
              <span onClick={() => navigate('/confidentialite')} style={{ color: '#90CDF4', fontSize: '12px', cursor: 'pointer' }}>Politique de confidentialité</span>
              <span onClick={() => navigate('/auth')} style={{ color: '#90CDF4', fontSize: '12px', cursor: 'pointer' }}>Connexion</span>
              <span onClick={() => navigate('/auth')} style={{ color: '#90CDF4', fontSize: '12px', cursor: 'pointer' }}>Créer un compte</span>
              <span onClick={() => navigate('/auth')} style={{ color: '#90CDF4', fontSize: '12px', cursor: 'pointer' }}>Devenir prestataire</span>
            </div>
          </div>
          <div>
            <div style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '10px' }}>Contact</div>
            <p style={{ color: '#90CDF4', fontSize: '12px' }}>devathomeserv@gmail.com</p>
            <p style={{ color: '#90CDF4', fontSize: '12px', marginTop: '4px' }}>France</p>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${c.bleu}`, paddingTop: '14px', textAlign: 'center', color: '#90CDF4', fontSize: '12px' }}>
          © 2026 At Home Service — Tous droits réservés
        </div>
      </footer>
    </div>
  )
}

export default Accueil