import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { getPrestatairesCarte } from '../services/api'
import { useTheme } from '../context/ThemeContext'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

const categories = ['coiffure', 'barber', 'esthetique', 'massage', 'plomberie', 'electricite', 'maconnerie', 'renovation', 'coach sportif', 'photographe']

const Carte = () => {
  const navigate = useNavigate()
  const { mode: themeMode, toggleTheme, couleurs: c } = useTheme()
  const [prestataires, setPrestataires] = useState([])
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [categorie, setCategorie] = useState('')

  useEffect(() => {
    chargerPrestataires()
  }, [])

  const chargerPrestataires = async () => {
    try {
      const res = await getPrestatairesCarte()
      setPrestataires(res.data.prestataires)
    } catch (err) {
      console.error(err)
    } finally {
      setChargement(false)
    }
  }

  const filtrerCategorie = (cat) => {
    setCategorie(categorie === cat ? '' : cat)
  }

  const prestatairesFiltres = prestataires.filter(p => {
    const correspondCategorie = !categorie || p.services.some(s => s.categorie === categorie)
    const correspondRecherche = !recherche ||
      `${p.prenom} ${p.nom}`.toLowerCase().includes(recherche.toLowerCase()) ||
      p.services.some(s => s.titre.toLowerCase().includes(recherche.toLowerCase()))
    return correspondCategorie && correspondRecherche
  })

  const centreCarte = [46.603354, 1.888334]

  return (
    <div style={{ minHeight: '100vh', background: c.fond, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @media (max-width: 600px) {
          .filtres-carte { gap: 6px !important; }
          .filtres-carte button { padding: 4px 10px !important; font-size: 11px !important; }
        }
      `}</style>
      <nav style={{ background: c.bleu, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" fill={c.bleu}/>
            </svg>
          </div>
          <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>At Home Service</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>
            {themeMode === 'clair' ? '🌙' : '☀️'}
          </button>
          <button onClick={() => navigate('/')} style={{ background: 'white', color: c.bleu, border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>← Accueil</button>
        </div>
      </nav>

      <div style={{ padding: '1rem 1.5rem', background: c.fondMoyen }}>
        <h1 style={{ color: c.texteFonce, fontSize: '20px', margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>🗺️ Trouvez un prestataire près de chez vous</h1>
        <p style={{ color: c.texte, fontSize: '13px', margin: '0 0 12px' }}>{prestatairesFiltres.length} prestataire{prestatairesFiltres.length > 1 ? 's' : ''} localisé{prestatairesFiltres.length > 1 ? 's' : ''}</p>

        <input
          placeholder="Rechercher un prestataire ou un service..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', marginBottom: '10px', borderRadius: '8px', border: `1.5px solid ${c.bleuClair}`, background: c.inputFond, color: c.inputTexte, fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Georgia, serif', maxWidth: '500px' }}
        />

        <div className="filtres-carte" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => filtrerCategorie('')} style={{ padding: '6px 16px', borderRadius: '20px', border: `1.5px solid ${c.bleuClair}`, cursor: 'pointer', background: categorie === '' ? c.bleu : c.fondClair, color: categorie === '' ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif' }}>Tous</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => filtrerCategorie(cat)} style={{ padding: '6px 16px', borderRadius: '20px', border: `1.5px solid ${c.bleuClair}`, cursor: 'pointer', background: categorie === cat ? c.bleu : c.fondClair, color: categorie === cat ? 'white' : c.texteFonce, textTransform: 'capitalize', fontFamily: 'Georgia, serif' }}>{cat}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: '500px' }}>
        {chargement && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '500px' }}>
            <p style={{ color: c.texteFonce }}>Chargement de la carte...</p>
          </div>
        )}
        {!chargement && (
          <MapContainer center={centreCarte} zoom={6} style={{ height: '100%', width: '100%', minHeight: '500px' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {prestatairesFiltres.map(p => (
              <Marker key={p.id} position={[p.latitude, p.longitude]}>
                <Popup>
                  <div style={{ fontFamily: 'Georgia, serif', minWidth: '180px' }}>
                    <strong style={{ color: '#1A365D' }}>{p.prenom} {p.nom}</strong> {p.verifie && <span style={{ color: '#065f46' }}>✅</span>}
                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#3D2B0F' }}>📍 {p.ville} {p.code_postal}</p>
                    {p.services.length > 0 && (
                      <p style={{ margin: '4px 0', fontSize: '12px', color: '#3D2B0F' }}>
                        {p.services.map(s => s.categorie).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                      </p>
                    )}
                    <button onClick={() => navigate(`/prestataire/${p.id}`)} style={{ background: '#C53030', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginTop: '6px', width: '100%' }}>Voir le profil</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      <footer style={{ background: c.texteFonce, color: '#BEE3F8', textAlign: 'center', padding: '1rem', fontSize: '13px' }}>
        © 2026 At Home Service — Tous droits réservés
      </footer>
    </div>
  )
}

export default Carte