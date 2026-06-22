import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const themes = {
  clair: {
    fond: '#C8A97A',
    fondClair: '#F5ECD8',
    fondMoyen: '#B8926A',
    carte: '#F5ECD8',
    bordure: '#A07840',
    texte: '#3D2B0F',
    texteFonce: '#1A365D',
    bleu: '#2B6CB0',
    bleuClair: '#90CDF4',
    bleuFond: '#EBF8FF',
    rouge: '#C53030',
    blanc: 'white',
    inputFond: 'white',
    inputTexte: '#1A202C'
  },
  sombre: {
    fond: '#1A1410',
    fondClair: '#2D2418',
    fondMoyen: '#3D2E1C',
    carte: '#2D2418',
    bordure: '#5A4A30',
    texte: '#D4C5A8',
    texteFonce: '#E8DCC4',
    bleu: '#4A90D9',
    bleuClair: '#3D6B8F',
    bleuFond: '#1E2A38',
    rouge: '#E05252',
    blanc: '#2D2418',
    inputFond: '#1A1410',
    inputTexte: '#E8DCC4'
  }
}

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(localStorage.getItem('theme') || 'clair')

  useEffect(() => {
    localStorage.setItem('theme', mode)
  }, [mode])

  const toggleTheme = () => {
    setMode(prev => prev === 'clair' ? 'sombre' : 'clair')
  }

  const couleurs = themes[mode]

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, couleurs }}>
      {children}
    </ThemeContext.Provider>
  )
}