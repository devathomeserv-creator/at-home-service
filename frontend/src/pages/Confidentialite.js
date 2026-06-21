import React from 'react'
import { useNavigate } from 'react-router-dom'

const Confidentialite = () => {
  const navigate = useNavigate()

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

      <div style={{ flex: 1, maxWidth: '800px', margin: '2rem auto', padding: '0 1rem', width: '100%' }}>
        <div style={{ background: '#F5ECD8', borderRadius: '16px', padding: '2rem', border: '1px solid #A07840' }}>
          <h1 style={{ color: '#1A365D', fontFamily: 'Georgia, serif', marginBottom: '0.5rem' }}>Politique de confidentialité</h1>
          <p style={{ color: '#A07840', fontSize: '13px', marginBottom: '2rem' }}>Dernière mise à jour : 21 juin 2026</p>

          <h2 style={{ color: '#1A365D', fontFamily: 'Georgia, serif', fontSize: '18px', marginTop: '1.5rem', marginBottom: '0.8rem' }}>1. Qui sommes-nous ?</h2>
          <p style={{ color: '#3D2B0F', fontSize: '14px', lineHeight: 1.7, marginBottom: '1rem' }}>
            At Home Service est une plateforme de mise en relation entre particuliers et prestataires de services à domicile, éditée par Vincent Tumbarello, basé à Nice, France. Pour toute question relative à vos données personnelles, vous pouvez nous contacter à l'adresse devathomeserv@gmail.com.
          </p>

          <h2 style={{ color: '#1A365D', fontFamily: 'Georgia, serif', fontSize: '18px', marginTop: '1.5rem', marginBottom: '0.8rem' }}>2. Quelles données collectons-nous ?</h2>
          <p style={{ color: '#3D2B0F', fontSize: '14px', lineHeight: 1.7, marginBottom: '1rem' }}>
            Dans le cadre de l'utilisation de la plateforme, nous collectons les données suivantes :
          </p>
          <ul style={{ color: '#3D2B0F', fontSize: '14px', lineHeight: 1.8, marginBottom: '1rem', paddingLeft: '1.5rem' }}>
            <li>Données d'identification : nom, prénom, adresse email, numéro de téléphone</li>
            <li>Données de localisation : adresse, ville, code postal (pour les prestataires et les interventions)</li>
            <li>Données professionnelles : numéro SIRET, description d'activité (pour les prestataires)</li>
            <li>Données de connexion : mot de passe (chiffré), historique de connexion</li>
            <li>Données de paiement : traitées exclusivement par notre prestataire de paiement Stripe, nous ne stockons aucune donnée bancaire</li>
            <li>Contenus que vous publiez : avis, messages, photos et vidéos de réalisations</li>
          </ul>

          <h2 style={{ color: '#1A365D', fontFamily: 'Georgia, serif', fontSize: '18px', marginTop: '1.5rem', marginBottom: '0.8rem' }}>3. Pourquoi collectons-nous ces données ?</h2>
          <p style={{ color: '#3D2B0F', fontSize: '14px', lineHeight: 1.7, marginBottom: '1rem' }}>
            Vos données sont utilisées pour :
          </p>
          <ul style={{ color: '#3D2B0F', fontSize: '14px', lineHeight: 1.8, marginBottom: '1rem', paddingLeft: '1.5rem' }}>
            <li>Créer et gérer votre compte utilisateur</li>
            <li>Permettre la mise en relation entre clients et prestataires</li>
            <li>Traiter les réservations et les paiements</li>
            <li>Vous envoyer des notifications liées à votre activité sur la plateforme (réservations, messages, avis)</li>
            <li>Vérifier l'authenticité des entreprises prestataires (vérification SIRET)</li>
            <li>Améliorer la qualité et la sécurité de notre service</li>
          </ul>

          <h2 style={{ color: '#1A365D', fontFamily: 'Georgia, serif', fontSize: '18px', marginTop: '1.5rem', marginBottom: '0.8rem' }}>4. Qui a accès à vos données ?</h2>
          <p style={{ color: '#3D2B0F', fontSize: '14px', lineHeight: 1.7, marginBottom: '1rem' }}>
            Vos données sont accessibles uniquement par : l'équipe d'At Home Service pour la gestion de la plateforme, le prestataire ou le client avec lequel vous interagissez (dans le cadre strict d'une réservation), et nos sous-traitants techniques (Supabase pour l'hébergement des données, Stripe pour les paiements, Resend pour les emails). Aucune donnée n'est vendue ou transmise à des tiers à des fins commerciales.
          </p>

          <h2 style={{ color: '#1A365D', fontFamily: 'Georgia, serif', fontSize: '18px', marginTop: '1.5rem', marginBottom: '0.8rem' }}>5. Combien de temps conservons-nous vos données ?</h2>
          <p style={{ color: '#3D2B0F', fontSize: '14px', lineHeight: 1.7, marginBottom: '1rem' }}>
            Vos données sont conservées pendant toute la durée de votre inscription sur la plateforme. En cas de suppression de votre compte, vos données personnelles sont supprimées dans un délai raisonnable, sauf obligation légale de conservation (notamment en matière comptable et fiscale).
          </p>

          <h2 style={{ color: '#1A365D', fontFamily: 'Georgia, serif', fontSize: '18px', marginTop: '1.5rem', marginBottom: '0.8rem' }}>6. Vos droits</h2>
          <p style={{ color: '#3D2B0F', fontSize: '14px', lineHeight: 1.7, marginBottom: '1rem' }}>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants concernant vos données personnelles :
          </p>
          <ul style={{ color: '#3D2B0F', fontSize: '14px', lineHeight: 1.8, marginBottom: '1rem', paddingLeft: '1.5rem' }}>
            <li><strong>Droit d'accès :</strong> obtenir une copie des données que nous détenons sur vous</li>
            <li><strong>Droit de rectification :</strong> corriger des données inexactes ou incomplètes</li>
            <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
            <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
            <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données pour des motifs légitimes</li>
            <li><strong>Droit de limitation :</strong> demander la limitation du traitement de vos données</li>
          </ul>
          <p style={{ color: '#3D2B0F', fontSize: '14px', lineHeight: 1.7, marginBottom: '1rem' }}>
            Vous pouvez exercer ces droits directement depuis votre profil (modification des informations, suppression du compte) ou en nous contactant à l'adresse devathomeserv@gmail.com. Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés).
          </p>

          <h2 style={{ color: '#1A365D', fontFamily: 'Georgia, serif', fontSize: '18px', marginTop: '1.5rem', marginBottom: '0.8rem' }}>7. Sécurité de vos données</h2>
          <p style={{ color: '#3D2B0F', fontSize: '14px', lineHeight: 1.7, marginBottom: '1rem' }}>
            Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données : chiffrement des mots de passe, connexion sécurisée (HTTPS), accès restreint aux données par authentification, et hébergement chez des prestataires reconnus pour leurs standards de sécurité (Supabase, Railway, Vercel).
          </p>

          <h2 style={{ color: '#1A365D', fontFamily: 'Georgia, serif', fontSize: '18px', marginTop: '1.5rem', marginBottom: '0.8rem' }}>8. Cookies</h2>
          <p style={{ color: '#3D2B0F', fontSize: '14px', lineHeight: 1.7, marginBottom: '1rem' }}>
            At Home Service utilise uniquement des cookies techniques nécessaires au bon fonctionnement de la plateforme (maintien de votre session de connexion). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
          </p>

          <h2 style={{ color: '#1A365D', fontFamily: 'Georgia, serif', fontSize: '18px', marginTop: '1.5rem', marginBottom: '0.8rem' }}>9. Modifications de cette politique</h2>
          <p style={{ color: '#3D2B0F', fontSize: '14px', lineHeight: 1.7, marginBottom: '1rem' }}>
            Cette politique de confidentialité peut être mise à jour pour refléter l'évolution de nos pratiques ou de la réglementation. Nous vous informerons de toute modification substantielle via la plateforme.
          </p>

          <h2 style={{ color: '#1A365D', fontFamily: 'Georgia, serif', fontSize: '18px', marginTop: '1.5rem', marginBottom: '0.8rem' }}>10. Contact</h2>
          <p style={{ color: '#3D2B0F', fontSize: '14px', lineHeight: 1.7, marginBottom: '1rem' }}>
            Pour toute question relative à cette politique ou à vos données personnelles : devathomeserv@gmail.com
          </p>
        </div>
      </div>

      <footer style={{ background: '#1A365D', color: '#BEE3F8', textAlign: 'center', padding: '1rem', fontSize: '13px' }}>
        © 2026 At Home Service — Tous droits réservés
      </footer>
    </div>
  )
}

export default Confidentialite