import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getServices } from '../services/api'

const Accueil = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [recherche, setRecherche] = useState('')
  const [ville, setVille] = useState('')
  const [categorie, setCategorie] = useState('')
  const [servicesFiltres, setServicesFiltres] = useState([])
  const [menuOuvert, setMenuOuvert] = useState(false)

  const categories = [
    { nom: 'coiffure', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=200&fit=crop' },
    { nom: 'barber', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=200&fit=crop' },
    { nom: 'esthetique', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=200&fit=crop' },
    { nom: 'massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=200&fit=crop' },
    { nom: 'plomberie', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=300&h=200&fit=crop' },
    { nom: 'electricite', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=200&fit=crop' },
    { nom: 'maconnerie', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop' },
    { nom: 'renovation', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop' },
    { nom: 'coach sportif', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop' },
    { nom: 'photographe', image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=300&h=200&fit=crop' }
  ]

  useEffect(() => {
    chargerServices()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ville])

  useEffect(() => {
    filtrer()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recherche, categorie, services])

  const chargerServices = async () => {
    try {
      const res = await getServices(null, ville)
      setServices(res.data.services)
      setServicesFiltres(res.data.services)
    } catch (err) {
      console.error(err)
    }
  }

  const filtrer = () => {
    let resultats = services
    if (categorie) {
      resultats = resultats.filter(s => s.categorie === categorie)
    }
    if (recherche) {
      resultats = resultats.filter(s =>
        s.titre.toLowerCase().includes(recherche.toLowerCase()) ||
        s.categorie.toLowerCase().includes(recherche.toLowerCase()) ||
        s.description?.toLowerCase().includes(recherche.toLowerCase()) ||
        `${s.users?.prenom} ${s.users?.nom}`.toLowerCase().includes(recherche.toLowerCase())
      )
    }
    setServicesFiltres(resultats)
  }

  const filtrerCategorie = (cat) => {
    setCategorie(categorie === cat ? '' : cat)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#C8A97A', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ background: '#2B6CB0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" fill="#2B6CB0"/>
            </svg>
          </div>
          <div>
            <div style={{ color: 'white', fontSize: '16px', fontWeight: '500', lineHeight: 1.1 }}>At Home Service</div>
            <div style={{ color: '#FEB2B2', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase' }}>services à domicile</div>
          </div>
        </div>
        <div className="nav-desktop" style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate('/auth')} style={{ background: 'white', color: '#2B6CB0', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Connexion</button>
          <button onClick={() => navigate('/auth')} style={{ background: '#C53030', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>S'inscrire</button>
        </div>
        <button onClick={() => setMenuOuvert(!menuOuvert)} className="nav-mobile" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'none' }}>
          <div style={{ width: '24px', height: '2px', background: 'white', margin: '5px 0' }}></div>
          <div style={{ width: '24px', height: '2px', background: 'white', margin: '5px 0' }}></div>
          <div style={{ width: '24px', height: '2px', background: 'white', margin: '5px 0' }}></div>
        </button>
        {menuOuvert && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#2B6CB0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 100, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <button onClick={() => { navigate('/auth'); setMenuOuvert(false) }} style={{ background: 'white', color: '#2B6CB0', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>Connexion</button>
            <button onClick={() => { navigate('/auth'); setMenuOuvert(false) }} style={{ background: '#C53030', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>S'inscrire</button>
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
        }
      `}</style>

      <div style={{ background: '#B8926A', padding: '40px 16px', textAlign: 'center' }}>
        <h1 className="hero-title" style={{ fontSize: '32px', color: '#1A365D', marginBottom: '8px', lineHeight: 1.3, fontFamily: 'Georgia, serif' }}>Des pros à domicile,<br />quand vous en avez besoin</h1>
        <p style={{ color: '#3D2B0F', fontSize: '15px', fontStyle: 'italic', marginBottom: '32px', padding: '0 8px' }}>Plus besoin de chercher, un clic et trouvez votre artisan à domicile</p>
        <div className="search-box" style={{ background: '#F5ECD8', borderRadius: '12px', padding: '16px', maxWidth: '700px', margin: '0 auto', display: 'flex', gap: '8px', border: '1px solid #A07840' }}>
          <input placeholder="Quel service ou prestataire ?" value={recherche} onChange={(e) => setRecherche(e.target.value)} style={{ flex: 2, padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #90CDF4', fontSize: '14px', fontFamily: 'Georgia, serif', width: '100%' }} />
          <input placeholder="📍 Ville (ex: Nice)" value={ville} onChange={(e) => setVille(e.target.value)} style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #90CDF4', fontSize: '14px', fontFamily: 'Georgia, serif', width: '100%' }} />
          <button style={{ background: '#C53030', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '14px', whiteSpace: 'nowrap' }}>Rechercher</button>
        </div>
        {ville && (
          <p style={{ color: '#1A365D', fontSize: '13px', marginTop: '12px' }}>
            Résultats pour : <strong>{ville}</strong> <span onClick={() => setVille('')} style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: '8px' }}>✕ effacer</span>
          </p>
        )}
      </div>

      <div style={{ background: '#C8A97A', padding: '32px 16px' }}>
        <h2 style={{ color: '#1A365D', textAlign: 'center', marginBottom: '24px', fontFamily: 'Georgia, serif', fontSize: '20px' }}>Nos services à domicile</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', maxWidth: '1100px', margin: '0 auto' }}>
          {categories.map(cat => (
            <div key={cat.nom} onClick={() => filtrerCategorie(cat.nom)} style={{ borderRadius: '12px', overflow: 'hidden', border: categorie === cat.nom ? '3px solid #2B6CB0' : '1px solid #A07840', cursor: 'pointer', background: '#F5ECD8' }}>
              <div style={{ height: '100px', overflow: 'hidden' }}>
                <img src={cat.image} alt={cat.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: categorie === cat.nom ? '#2B6CB0' : '#1A365D', fontWeight: '500', textTransform: 'capitalize', fontFamily: 'Georgia, serif' }}>{cat.nom}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem', width: '100%' }}>
        <h2 style={{ color: '#1A365D', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>
          {servicesFiltres.length} service{servicesFiltres.length > 1 ? 's' : ''} disponible{servicesFiltres.length > 1 ? 's' : ''}
        </h2>
        {servicesFiltres.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#3D2B0F' }}>
            <p style={{ fontSize: '18px' }}>Aucun service trouvé</p>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {servicesFiltres.map(service => (
            <div key={service.id} style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ background: '#EBF8FF', color: '#2B6CB0', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', textTransform: 'capitalize' }}>{service.categorie}</span>
                {service.users && (
                  <span onClick={() => navigate(`/prestataire/${service.users.id}`)} style={{ fontSize: '12px', color: '#2B6CB0', cursor: 'pointer', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {service.users.prenom} {service.users.nom} {service.users.ville && `· ${service.users.ville}`}
                    {service.users.verifie && <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '10px', padding: '1px 6px', borderRadius: '20px', textDecoration: 'none' }}>✅</span>}
                  </span>
                )}
              </div>
              <h3 style={{ margin: '0.5rem 0', color: '#1A365D', fontFamily: 'Georgia, serif' }}>{service.titre}</h3>
              <p style={{ color: '#3D2B0F', fontSize: '14px', marginBottom: '1rem' }}>{service.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#C53030' }}>{service.prix}€</span>
                  <span style={{ color: '#3D2B0F', fontSize: '13px', marginLeft: '6px' }}>{service.duree} min</span>
                </div>
                <button onClick={() => navigate('/auth')} style={{ background: '#C53030', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Réserver</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#F5ECD8', padding: '40px 16px', textAlign: 'center' }}>
        <h2 style={{ color: '#1A365D', fontSize: '22px', marginBottom: '32px', fontFamily: 'Georgia, serif' }}>Comment ça marche ?</h2>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '700px', margin: '0 auto' }}>
          {[
            { num: '1', titre: 'Cherchez un service', desc: 'Tapez le service et la ville dont vous avez besoin et trouvez les pros disponibles près de chez vous' },
            { num: '2', titre: 'Choisissez et réservez', desc: 'Consultez les avis, les tarifs et réservez en quelques clics avec notre calendrier' },
            { num: '3', titre: 'Le pro vient chez vous', desc: "Votre artisan se déplace à domicile à l'heure convenue. Profitez !" }
          ].map(step => (
            <div key={step.num} style={{ flex: 1, minWidth: '200px', background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #A07840' }}>
              <div style={{ width: '36px', height: '36px', background: '#2B6CB0', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', margin: '0 auto 12px' }}>{step.num}</div>
              <div style={{ color: '#1A365D', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>{step.titre}</div>
              <div style={{ color: '#3D2B0F', fontSize: '12px', lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#2B6CB0', padding: '40px 16px', textAlign: 'center' }}>
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

      <div style={{ background: '#C8A97A', padding: '40px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', textAlign: 'center' }}>
        <div>
          <h2 style={{ color: '#1A365D', fontSize: '20px', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>Vous êtes un professionnel ?</h2>
          <p style={{ color: '#3D2B0F', fontSize: '13px', maxWidth: '300px', lineHeight: 1.6, margin: '0 auto' }}>Rejoignez At Home Service et développez votre clientèle. Créez votre profil gratuitement et commencez à recevoir des réservations dès aujourd'hui.</p>
        </div>
        <button onClick={() => navigate('/auth')} style={{ background: '#C53030', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>Rejoindre la plateforme</button>
      </div>

      <footer style={{ background: '#1A365D', padding: '28px 16px' }}>
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
              <span onClick={() => navigate('/mentions-legales')} style={{ color: '#90CDF4', fontSize: '12px', cursor: 'pointer' }}>Mentions légales et CGU</span>
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
        <div style={{ borderTop: '1px solid #2B6CB0', paddingTop: '14px', textAlign: 'center', color: '#90CDF4', fontSize: '12px' }}>
          © 2026 At Home Service — Tous droits réservés
        </div>
      </footer>
    </div>
  )
}

export default Accueil