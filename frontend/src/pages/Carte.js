import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { getPrestatairesCarte } from '../services/api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

const Carte = () => {
  const navigate = useNavigate()
  const [prestataires, setPrestataires] = useState([])
  const [chargement, setChargement] = useState(true)

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

  const centreCarte = [46.603354, 1.888334]

  return (
    <div style={{ minHeight: '100vh', background: '#C8A97A', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#2B6CB0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" fill="#2B6CB0"/>
            </svg>
          </div>
          <div style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>At Home Service</div>
        </div>
        <button onClick={() => navigate('/')} style={{ background: 'white', color: '#2B6CB0', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>← Accueil</button>
      </nav>

      <div style={{ padding: '1rem 1.5rem', background: '#B8926A' }}>
        <h1 style={{ color: '#1A365D', fontSize: '20px', margin: 0, fontFamily: 'Georgia, serif' }}>🗺️ Trouvez un prestataire près de chez vous</h1>
        <p style={{ color: '#3D2B0F', fontSize: '13px', margin: '4px 0 0' }}>{prestataires.length} prestataire{prestataires.length > 1 ? 's' : ''} localisé{prestataires.length > 1 ? 's' : ''}</p>
      </div>

      <div style={{ flex: 1, minHeight: '500px' }}>
        {chargement && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '500px' }}>
            <p style={{ color: '#1A365D' }}>Chargement de la carte...</p>
          </div>
        )}
        {!chargement && (
          <MapContainer center={centreCarte} zoom={6} style={{ height: '100%', width: '100%', minHeight: '500px' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {prestataires.map(p => (
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

      <footer style={{ background: '#1A365D', color: '#BEE3F8', textAlign: 'center', padding: '1rem', fontSize: '13px' }}>
        © 2026 At Home Service — Tous droits réservés
      </footer>
    </div>
  )
}

export default Carte