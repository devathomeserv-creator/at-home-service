import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const MentionsLegales = () => {
  const navigate = useNavigate()
  const { mode: themeMode, toggleTheme, couleurs: c } = useTheme()

  return (
    <div style={{ minHeight: '100vh', background: c.fond }}>
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
          <button onClick={() => navigate('/')} style={{ background: c.rouge, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Retour</button>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>

        <div style={{ background: c.fondClair, borderRadius: '12px', padding: '2rem', border: `1px solid ${c.bordure}`, marginBottom: '1.5rem' }}>
          <h1 style={{ color: c.texteFonce, marginBottom: '1.5rem', fontSize: '24px' }}>Mentions Légales</h1>

          <h2 style={{ color: c.bleu, fontSize: '16px', marginBottom: '8px' }}>Éditeur du site</h2>
          <p style={{ color: c.texte, fontSize: '14px', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            <strong>Nom :</strong> Vincent Tumbarello<br />
            <strong>Adresse :</strong> Nice, France<br />
            <strong>Email :</strong> devathomeserv@gmail.com<br />
            <strong>Site web :</strong> At Home Service<br />
            <strong>SIRET :</strong> En cours d'immatriculation
          </p>

          <h2 style={{ color: c.bleu, fontSize: '16px', marginBottom: '8px' }}>Hébergement</h2>
          <p style={{ color: c.texte, fontSize: '14px', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            Le site At Home Service est hébergé par des prestataires techniques professionnels situés en Europe, conformément à la réglementation RGPD.
          </p>

          <h2 style={{ color: c.bleu, fontSize: '16px', marginBottom: '8px' }}>Propriété intellectuelle</h2>
          <p style={{ color: c.texte, fontSize: '14px', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            L'ensemble du contenu du site At Home Service (textes, images, logos, design) est la propriété exclusive de Vincent Tumbarello. Toute reproduction, même partielle, est strictement interdite sans autorisation préalable.
          </p>

          <h2 style={{ color: c.bleu, fontSize: '16px', marginBottom: '8px' }}>Responsabilité</h2>
          <p style={{ color: c.texte, fontSize: '14px', lineHeight: 1.8 }}>
            At Home Service est une plateforme de mise en relation entre clients et prestataires de services à domicile. At Home Service ne peut être tenu responsable des prestations effectuées par les prestataires référencés sur la plateforme.
          </p>
        </div>

        <div style={{ background: c.fondClair, borderRadius: '12px', padding: '2rem', border: `1px solid ${c.bordure}`, marginBottom: '1.5rem' }}>
          <h1 style={{ color: c.texteFonce, marginBottom: '1.5rem', fontSize: '24px' }}>Conditions Générales d'Utilisation</h1>

          <h2 style={{ color: c.bleu, fontSize: '16px', marginBottom: '8px' }}>1. Objet</h2>
          <p style={{ color: c.texte, fontSize: '14px', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            At Home Service est une marketplace de mise en relation entre des particuliers (clients) et des professionnels (prestataires) proposant des services à domicile tels que la coiffure, la plomberie, l'électricité, le massage, la rénovation et autres services.
          </p>

          <h2 style={{ color: c.bleu, fontSize: '16px', marginBottom: '8px' }}>2. Inscription</h2>
          <p style={{ color: c.texte, fontSize: '14px', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            L'inscription sur At Home Service est gratuite. L'utilisateur s'engage à fournir des informations exactes et à maintenir ses coordonnées à jour. Tout compte créé avec de fausses informations pourra être supprimé sans préavis.
          </p>

          <h2 style={{ color: c.bleu, fontSize: '16px', marginBottom: '8px' }}>3. Réservations et paiements</h2>
          <p style={{ color: c.texte, fontSize: '14px', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            Les réservations sont effectuées en ligne via la plateforme. Le paiement est sécurisé par Stripe. At Home Service prélève une commission sur chaque transaction effectuée via la plateforme. Les tarifs des services sont fixés librement par les prestataires.
          </p>

          <h2 style={{ color: c.bleu, fontSize: '16px', marginBottom: '8px' }}>4. Annulation</h2>
          <p style={{ color: c.texte, fontSize: '14px', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            Toute annulation doit être effectuée au moins 24 heures avant le rendez-vous. En cas d'annulation tardive, des frais peuvent être appliqués selon les conditions du prestataire.
          </p>

          <h2 style={{ color: c.bleu, fontSize: '16px', marginBottom: '8px' }}>5. Avis et évaluations</h2>
          <p style={{ color: c.texte, fontSize: '14px', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            Les clients peuvent laisser des avis sur les prestataires après une prestation terminée. At Home Service se réserve le droit de supprimer tout avis jugé inapproprié, diffamatoire ou contraire aux bonnes mœurs.
          </p>

          <h2 style={{ color: c.bleu, fontSize: '16px', marginBottom: '8px' }}>6. Responsabilité des prestataires</h2>
          <p style={{ color: c.texte, fontSize: '14px', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            Les prestataires s'engagent à exercer leur activité dans le respect de la législation en vigueur, à détenir les qualifications et assurances nécessaires à l'exercice de leur métier.
          </p>

          <h2 style={{ color: c.bleu, fontSize: '16px', marginBottom: '8px' }}>7. Droit applicable</h2>
          <p style={{ color: c.texte, fontSize: '14px', lineHeight: 1.8 }}>
            Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux de Nice seront compétents.
          </p>
        </div>

        <p style={{ color: c.texte, fontSize: '12px', textAlign: 'center', marginBottom: '2rem' }}>
          Dernière mise à jour : Juin 2026
        </p>
      </div>

      <footer style={{ background: c.texteFonce, color: '#BEE3F8', textAlign: 'center', padding: '1rem', fontSize: '13px' }}>
        © 2026 At Home Service — Tous droits réservés
      </footer>
    </div>
  )
}

export default MentionsLegales