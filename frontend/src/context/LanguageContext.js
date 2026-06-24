import React, { createContext, useContext, useState, useEffect } from 'react'
import { traductions } from '../translations'

const LanguageContext = createContext()

export const useLanguage = () => useContext(LanguageContext)

const detecterLangueNavigateur = () => {
  const langueSauvegardee = localStorage.getItem('langue')
  if (langueSauvegardee) return langueSauvegardee

  const languesNavigateur = navigator.languages || [navigator.language]
  const languesSupportees = ['fr', 'en', 'it', 'ru']

  for (const lang of languesNavigateur) {
    const code = lang.split('-')[0].toLowerCase()
    if (languesSupportees.includes(code)) {
      return code
    }
  }

  return 'fr'
}

export const LanguageProvider = ({ children }) => {
  const [langue, setLangue] = useState(detecterLangueNavigateur())

  useEffect(() => {
    localStorage.setItem('langue', langue)
  }, [langue])

  const changerLangue = (nouvelleLangue) => {
    setLangue(nouvelleLangue)
  }

  const t = (cle) => {
    return traductions[langue]?.[cle] || traductions['fr']?.[cle] || cle
  }

  return (
    <LanguageContext.Provider value={{ langue, changerLangue, t }}>
      {children}
    </LanguageContext.Provider>
  )
}