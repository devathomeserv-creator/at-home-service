import React, { createContext, useContext, useState, useEffect } from 'react'
import { traductions } from '../translations'

const LanguageContext = createContext()

export const useLanguage = () => useContext(LanguageContext)

export const LanguageProvider = ({ children }) => {
  const [langue, setLangue] = useState(localStorage.getItem('langue') || 'fr')

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