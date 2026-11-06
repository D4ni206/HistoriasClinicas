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
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }
    document.body.style.backgroundColor = 'var(--bg-app)'
    document.body.style.color = 'var(--text-main)'
  }, [temaOscuro])

  const toggleTema = () => setTemaOscuro(prev => !prev)

  // Tokens institucionales enlazados a las variables CSS de index.css
  const theme = {
    isDark: temaOscuro,
    navy: 'var(--color-navy)',
    bgApp: 'var(--bg-app)',
    bgCard: 'var(--bg-card)',
    bgCardHover: 'var(--bg-card-hover)',
    bgSubtle: 'var(--bg-subtle)',
    bgInput: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderSubtle: '1px solid var(--border-subtle)',
    borderInput: 'var(--border-input)',
    textMain: 'var(--text-main)',
    textHeading: 'var(--text-heading)',
    textSecondary: 'var(--text-secondary)',
    textMuted: 'var(--text-muted)',
    primaryBtnBg: 'var(--color-primary)',
    primaryBtnColor: 'var(--color-primary-text)',
    primaryBtnHover: 'var(--color-primary-hover)',
    secondaryBtnBg: 'var(--bg-card)',
    secondaryBtnBorder: '1px solid var(--border-color)',
    secondaryBtnColor: 'var(--text-main)',
    accentCool: 'var(--color-primary)',
    alertRed: 'var(--alert-red)',
    alertRedBg: 'var(--alert-red-bg)',
    alertRedBorder: 'var(--alert-red-border)',
    statusGreen: 'var(--status-green)',
    statusGreenBg: 'var(--status-green-bg)',
    statusGreenBorder: 'var(--status-green-border)',
    tableHeaderBg: 'var(--bg-subtle)',
    tableRowHover: 'var(--bg-card-hover)',
    shadowCard: 'var(--shadow-card)',
    bannerGrad: 'var(--bg-subtle)',
    bannerText: 'var(--text-heading)'
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
