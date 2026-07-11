import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'

const CalendrierReservations = ({ reservations, onSelectReservation }) => {
  const { couleurs: c } = useTheme()
  const { langue } = useLanguage()
  const [vueCalendrier, setVueCalendrier] = useState('mensuelle')
  const [dateActuelle, setDateActuelle] = useState(new Date())

  const statutColor = (statut) => {
    if (statut === 'confirme') return '#059669'
    if (statut === 'annule') return '#DC2626'
    if (statut === 'termine') return '#2B6CB0'
    return '#D97706'
  }

  // ===== VUE MENSUELLE =====
  const renderVueMensuelle = () => {
    const annee = dateActuelle.getFullYear()
    const mois = dateActuelle.getMonth()

    const premierJour = new Date(annee, mois, 1).getDay()
    const decalage = premierJour === 0 ? 6 : premierJour - 1
    const nbJours = new Date(annee, mois + 1, 0).getDate()

    const nomsMois = {
      fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
      en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      it: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
      ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
    }

    const joursNoms = {
      fr: ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'],
      en: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      it: ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'],
      ru: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
    }

    const reservationsDuMois = (jour) => {
      return reservations.filter(r => {
        const d = new Date(r.date_rdv)
        return d.getFullYear() === annee && d.getMonth() === mois && d.getDate() === jour
      })
    }

    const cellules = []
    for (let i = 0; i < decalage; i++) {
      cellules.push(<div key={`vide-${i}`} />)
    }

    for (let jour = 1; jour <= nbJours; jour++) {
      const resJour = reservationsDuMois(jour)
      const aujourdhui = new Date()
      const estAujourdhui = aujourdhui.getFullYear() === annee && aujourdhui.getMonth() === mois && aujourdhui.getDate() === jour

      cellules.push(
        <div
          key={jour}
          style={{
            background: estAujourdhui ? c.bleuFond : c.blanc,
            border: estAujourdhui ? `2px solid ${c.bleu}` : `1px solid ${c.bordure}`,
            borderRadius: '8px',
            padding: '6px',
            minHeight: '70px',
            cursor: resJour.length > 0 ? 'pointer' : 'default'
          }}
          onClick={() => resJour.length > 0 && onSelectReservation(resJour[0])}
        >
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: estAujourdhui ? c.bleu : c.texteFonce, marginBottom: '4px' }}>{jour}</div>
          {resJour.slice(0, 2).map((r, i) => (
            <div key={i} style={{ background: statutColor(r.statut), borderRadius: '4px', padding: '1px 4px', fontSize: '9px', color: 'white', marginBottom: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {new Date(r.date_rdv).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {r.services?.titre}
            </div>
          ))}
          {resJour.length > 2 && (
            <div style={{ fontSize: '9px', color: c.texte }}>+{resJour.length - 2} autres</div>
          )}
        </div>
      )
    }

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <button onClick={() => setDateActuelle(new Date(annee, mois - 1, 1))} style={{ background: c.fondClair, border: `1px solid ${c.bordure}`, borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: c.texteFonce, fontSize: '16px' }}>←</button>
          <h3 style={{ color: c.texteFonce, margin: 0, fontFamily: 'Georgia, serif' }}>{nomsMois[langue]?.[mois]} {annee}</h3>
          <button onClick={() => setDateActuelle(new Date(annee, mois + 1, 1))} style={{ background: c.fondClair, border: `1px solid ${c.bordure}`, borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: c.texteFonce, fontSize: '16px' }}>→</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
          {(joursNoms[langue] || joursNoms.fr).map(j => (
            <div key={j} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: c.texte, padding: '4px 0' }}>{j}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {cellules}
        </div>
      </div>
    )
  }

  // ===== VUE HEBDOMADAIRE =====
  const renderVueHebdomadaire = () => {
    const debutSemaine = new Date(dateActuelle)
    const jour = debutSemaine.getDay()
    const diff = jour === 0 ? -6 : 1 - jour
    debutSemaine.setDate(debutSemaine.getDate() + diff)

    const jours = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(debutSemaine)
      d.setDate(debutSemaine.getDate() + i)
      jours.push(d)
    }

    const joursNomsCourts = {
      fr: ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'],
      en: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      it: ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'],
      ru: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
    }

    const heures = Array.from({ length: 14 }, (_, i) => i + 7)

    const reservationsPourJourHeure = (date, heure) => {
      return reservations.filter(r => {
        const d = new Date(r.date_rdv)
        return d.toDateString() === date.toDateString() && d.getHours() === heure
      })
    }

    const finSemaine = new Date(jours[6])
    const debutStr = jours[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    const finStr = finSemaine.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <button onClick={() => { const d = new Date(dateActuelle); d.setDate(d.getDate() - 7); setDateActuelle(d) }} style={{ background: c.fondClair, border: `1px solid ${c.bordure}`, borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: c.texteFonce, fontSize: '16px' }}>←</button>
          <h3 style={{ color: c.texteFonce, margin: 0, fontFamily: 'Georgia, serif', fontSize: '14px' }}>{debutStr} — {finStr}</h3>
          <button onClick={() => { const d = new Date(dateActuelle); d.setDate(d.getDate() + 7); setDateActuelle(d) }} style={{ background: c.fondClair, border: `1px solid ${c.bordure}`, borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: c.texteFonce, fontSize: '16px' }}>→</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)', gap: '2px', minWidth: '600px' }}>
            <div />
            {jours.map((d, i) => {
              const aujourdhui = new Date()
              const estAujourdhui = d.toDateString() === aujourdhui.toDateString()
              return (
                <div key={i} style={{ textAlign: 'center', padding: '6px 2px', background: estAujourdhui ? c.bleuFond : c.fondClair, borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: c.texte }}>{(joursNomsCourts[langue] || joursNomsCourts.fr)[i]}</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: estAujourdhui ? c.bleu : c.texteFonce }}>{d.getDate()}</div>
                </div>
              )
            })}
            {heures.map(heure => (
              <React.Fragment key={heure}>
                <div style={{ fontSize: '10px', color: c.texte, textAlign: 'right', paddingRight: '6px', paddingTop: '4px' }}>{heure}:00</div>
                {jours.map((d, i) => {
                  const res = reservationsPourJourHeure(d, heure)
                  return (
                    <div key={i} style={{ borderTop: `1px solid ${c.bordure}`, minHeight: '40px', padding: '2px', background: c.blanc }}>
                      {res.map((r, ri) => (
                        <div key={ri} onClick={() => onSelectReservation(r)} style={{ background: statutColor(r.statut), borderRadius: '4px', padding: '2px 4px', fontSize: '9px', color: 'white', cursor: 'pointer', marginBottom: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {r.services?.titre}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', alignItems: 'center' }}>
        <button onClick={() => setVueCalendrier('mensuelle')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vueCalendrier === 'mensuelle' ? c.bleu : c.fondClair, color: vueCalendrier === 'mensuelle' ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif', fontSize: '13px' }}>
          📅 Mensuel
        </button>
        <button onClick={() => setVueCalendrier('hebdomadaire')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: vueCalendrier === 'hebdomadaire' ? c.bleu : c.fondClair, color: vueCalendrier === 'hebdomadaire' ? 'white' : c.texteFonce, fontFamily: 'Georgia, serif', fontSize: '13px' }}>
          🗓️ Hebdomadaire
        </button>
        <button onClick={() => setDateActuelle(new Date())} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${c.bordure}`, cursor: 'pointer', background: c.blanc, color: c.texteFonce, fontFamily: 'Georgia, serif', fontSize: '12px' }}>
          Aujourd'hui
        </button>
      </div>

      <div style={{ background: c.fondClair, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${c.bordure}` }}>
        {vueCalendrier === 'mensuelle' ? renderVueMensuelle() : renderVueHebdomadaire()}
      </div>
    </div>
  )
}

export default CalendrierReservations