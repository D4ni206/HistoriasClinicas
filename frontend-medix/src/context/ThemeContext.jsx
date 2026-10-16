import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [temaOscuro, setTemaOscuro] = useState(() => {
    try {
      const guardado = localStorage.getItem('medix_sidebar_theme') || localStorage.getItem('medix_theme')
      return guardado !== null ? guardado === 'dark' : false
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('medix_sidebar_theme', temaOscuro ? 'dark' : 'light')
      localStorage.setItem('medix_theme', temaOscuro ? 'dark' : 'light')
    } catch (e) {
      console.warn('No se pudo guardar la preferencia de tema:', e)
    }

    if (temaOscuro) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      document.documentElement.setAttribute('data-theme', 'dark')
      document.body.style.backgroundColor = '#080c14'
      document.body.style.color = '#f8fafc'
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
      document.body.style.backgroundColor = '#f8fafc'
      document.body.style.color = '#0f172a'
    }
  }, [temaOscuro])

  const toggleTema = () => setTemaOscuro(prev => !prev)

  // Paleta de diseño formal, escalable y con tonos fríos
  const theme = temaOscuro ? {
    isDark: true,
    bgApp: '#080c14',
    bgCard: '#0f172a',
    bgCardHover: '#131d31',
    bgSubtle: '#111827',
    bgInput: '#0b101b',
    border: '1px solid #1e293b',
    borderSubtle: '1px solid #162032',
    borderInput: '#283548',
    textMain: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    primaryBtnBg: '#38bdf8',
    primaryBtnColor: '#080c14',
    primaryBtnHover: '#0ea5e9',
    secondaryBtnBg: '#1e293b',
    secondaryBtnBorder: '1px solid #334155',
    secondaryBtnColor: '#e2e8f0',
    accentCool: '#38bdf8',
    tableHeaderBg: '#0b111e',
    tableRowHover: '#131c2e',
    shadowCard: '0 4px 20px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    bannerGrad: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
    bannerText: '#f1f5f9'
  } : {
    isDark: false,
    bgApp: '#f8fafc',
    bgCard: '#ffffff',
    bgCardHover: '#f8fafc',
    bgSubtle: '#f1f5f9',
    bgInput: '#ffffff',
    border: '1px solid #e2e8f0',
    borderSubtle: '1px solid #f1f5f9',
    borderInput: '#cbd5e1',
    textMain: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',
    primaryBtnBg: '#0f172a',
    primaryBtnColor: '#ffffff',
    primaryBtnHover: '#1e293b',
    secondaryBtnBg: '#ffffff',
    secondaryBtnBorder: '1px solid #e2e8f0',
    secondaryBtnColor: '#334155',
    accentCool: '#2563eb',
    tableHeaderBg: '#f8fafc',
    tableRowHover: '#f1f5f9',
    shadowCard: '0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.03)',
    bannerGrad: 'linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)',
    bannerText: '#1e293b'
  }

  return (
    <ThemeContext.Provider value={{ temaOscuro, setTemaOscuro, toggleTema, theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider')
  }
  return context
}
