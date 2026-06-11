import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getServices } from '../services/api'

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{ width: '40px', height: '40px', background: '#2B6CB0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" fill="white"/>
      </svg>
    </div>
    <div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1A365D', lineHeight: 1.1 }}>At Home Service</div>
      <div style={{ fontSize: '10px', color: '#3D2B0F', letterSpacing: '2px', textTransform: 'uppercase' }}>services à domicile</div>
    </div>
  </div>
)

const Accueil = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [recherche, setRecherche] = useState('')
  const [categorie, setCategorie] = useState('')
  const [servicesFiltres, setServicesFiltres] = useState([])

  const categories = [
    { nom: 'coiffure', emoji: '💇' },
    { nom: 'barber', emoji: '💈' },
    { nom: 'esthetique', emoji: '💅' },
    { nom: 'massage', emoji: '💆' },
    { nom: 'plomberie', emoji: '🔧' },
    { nom: 'electricite', emoji: '⚡' },
    { nom: 'maconnerie', emoji: '🧱' },
    { nom: 'renovation', emoji: '🏠' }
  ]

  useEffect(() => {
    chargerServices()
  }, [])

  useEffect(() => {
    filtrer()
  }, [recherche, categorie, services])

  const chargerServices = async (cat) => {
    try {
      const res = await getServices(cat)
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
        s.description?.toLowerCase().includes(recherche.toLowerCase())
      )
    }
    setServicesFiltres(resultats)
  }

  const filtrerCategorie = (cat) => {
    setCategorie(categorie === cat ? '' : cat)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#C8A97A', display: 'flex', flexDirection: 'column' }}>

      {/* NAVBAR */}
      <nav style={{ background: '#2B6CB0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/auth')} style={{ background: 'white', color: '#2B6CB0', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>Connexion</button>
          <button onClick={() => navigate('/auth')} style={{ background: '#C53030', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>S'inscrire</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: '#B8926A', padding: '3rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', color: '#1A365D', marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>Des pros à domicile,<br />quand vous en avez besoin</h1>
        <p style={{ color: '#3D2B0F', fontSize: '16px', fontStyle: 'italic', marginBottom: '2rem' }}>Plus besoin de chercher, un clic et trouvez votre artisan à domicile</p>

        <div style={{ display: 'flex', gap: '8px', maxWidth: '560px', margin: '0 auto' }}>
          <input
            placeholder="Quel service cherchez-vous ?"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #90CDF4', fontSize: '15px', fontFamily: 'Georgia, serif' }}
          />
          <button style={{ background: '#C53030', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}>Rechercher</button>
        </div>
      </div>

      {/* CATEGORIES */}
      <div style={{ background: '#C8A97A', padding: '1.5rem 2rem', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {categories.map(cat => (
          <button key={cat.nom} onClick={() => filtrerCategorie(cat.nom)} style={{ padding: '8px 16px', borderRadius: '20px', border: '1.5px solid #90CDF4', cursor: 'pointer', background: categorie === cat.nom ? '#2B6CB0' : '#F5ECD8', color: categorie === cat.nom ? 'white' : '#1A365D', fontFamily: 'Georgia, serif', fontSize: '13px' }}>
            {cat.emoji} {cat.nom}
          </button>
        ))}
      </div>

      {/* SERVICES */}
      <div style={{ flex: 1, maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem', width: '100%' }}>
        <h2 style={{ color: '#1A365D', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>
          {servicesFiltres.length} service{servicesFiltres.length > 1 ? 's' : ''} disponible{servicesFiltres.length > 1 ? 's' : ''}
        </h2>

        {servicesFiltres.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#3D2B0F' }}>
            <p style={{ fontSize: '18px' }}>Aucun service trouvé</p>
            <p style={{ fontSize: '14px' }}>Essayez une autre recherche</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {servicesFiltres.map(service => (
            <div key={service.id} style={{ background: '#F5ECD8', borderRadius: '12px', padding: '1.5rem', border: '1px solid #A07840' }}>
              <span style={{ background: '#EBF8FF', color: '#2B6CB0', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', textTransform: 'capitalize' }}>{service.categorie}</span>
              <h3 style={{ margin: '0.8rem 0 0.5rem', color: '#1A365D', fontFamily: 'Georgia, serif' }}>{service.titre}</h3>
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

      {/* FOOTER */}
      <footer style={{ background: '#1A365D', color: '#BEE3F8', padding: '2rem', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '0.5rem' }}>At Home Service</div>
            <p style={{ fontSize: '13px', color: '#90CDF4', fontStyle: 'italic' }}>Plus besoin de chercher, un clic et<br />trouvez votre artisan à domicile</p>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '0.5rem' }}>Liens utiles</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span onClick={() => navigate('/mentions-legales')} style={{ fontSize: '13px', color: '#90CDF4', cursor: 'pointer' }}>Mentions légales et CGU</span>
              <span onClick={() => navigate('/auth')} style={{ fontSize: '13px', color: '#90CDF4', cursor: 'pointer' }}>Se connecter</span>
              <span onClick={() => navigate('/auth')} style={{ fontSize: '13px', color: '#90CDF4', cursor: 'pointer' }}>Créer un compte</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '0.5rem' }}>Contact</div>
            <p style={{ fontSize: '13px', color: '#90CDF4' }}>devathomeserv@gmail.com</p>
            <p style={{ fontSize: '13px', color: '#90CDF4' }}>Nice, France</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '12px', color: '#90CDF4', borderTop: '1px solid #2B6CB0', paddingTop: '1rem' }}>
          © 2026 At Home Service — Tous droits réservés
        </div>
      </footer>
    </div>
  )
}

export default Accueil