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

  // Paleta sobria e institucional enlazada a tokens CSS
  const theme = temaOscuro ? {
    isDark: true,
    bgApp: 'var(--medix-bg-app)',
    bgCard: 'var(--medix-bg-card)',
    bgCardHover: 'var(--medix-bg-subtle)',
    bgSubtle: 'var(--medix-bg-subtle)',
    bgInput: 'var(--medix-bg-input)',
    border: '1px solid var(--medix-border)',
    borderSubtle: '1px solid var(--medix-border-subtle)',
    borderInput: 'var(--medix-border-input)',
    textMain: 'var(--medix-text-main)',
    textSecondary: 'var(--medix-text-secondary)',
    textMuted: 'var(--medix-text-muted)',
    primaryNavy: 'var(--medix-navy)',
    primaryBtnBg: 'var(--medix-action)',
    primaryBtnColor: '#ffffff',
    primaryBtnHover: 'var(--medix-action-hover)',
    secondaryBtnBg: 'var(--medix-bg-card)',
    secondaryBtnBorder: '1px solid var(--medix-border)',
    secondaryBtnColor: 'var(--medix-text-secondary)',
    accentCool: 'var(--medix-action)',
    alertRed: 'var(--medix-alert-red)',
    alertRedBg: 'var(--medix-alert-red-bg)',
    alertRedBorder: '1px solid var(--medix-alert-red-border)',
    statusGreen: 'var(--medix-status-green)',
    statusGreenBg: 'var(--medix-status-green-bg)',
    statusGreenBorder: '1px solid var(--medix-status-green-border)',
    tableHeaderBg: 'var(--medix-bg-subtle)',
    tableRowHover: 'var(--medix-bg-subtle)',
    shadowCard: 'var(--medix-shadow-card)',
    radiusSm: 'var(--radius-sm)',
    radiusMd: 'var(--radius-md)',
    radiusLg: 'var(--radius-lg)',
    bannerGrad: 'var(--medix-bg-subtle)',
    bannerText: 'var(--medix-text-main)'
  } : {
    isDark: false,
    bgApp: 'var(--medix-bg-app)',
    bgCard: 'var(--medix-bg-card)',
    bgCardHover: 'var(--medix-bg-subtle)',
    bgSubtle: 'var(--medix-bg-subtle)',
    bgInput: 'var(--medix-bg-input)',
    border: '1px solid var(--medix-border)',
    borderSubtle: '1px solid var(--medix-border-subtle)',
    borderInput: 'var(--medix-border-input)',
    textMain: 'var(--medix-text-main)',
    textSecondary: 'var(--medix-text-secondary)',
    textMuted: 'var(--medix-text-muted)',
    primaryNavy: 'var(--medix-navy)',
    primaryBtnBg: 'var(--medix-action)',
    primaryBtnColor: '#ffffff',
    primaryBtnHover: 'var(--medix-action-hover)',
    secondaryBtnBg: 'var(--medix-bg-card)',
    secondaryBtnBorder: '1px solid var(--medix-border)',
    secondaryBtnColor: 'var(--medix-text-secondary)',
    accentCool: 'var(--medix-action)',
    alertRed: 'var(--medix-alert-red)',
    alertRedBg: 'var(--medix-alert-red-bg)',
    alertRedBorder: '1px solid var(--medix-alert-red-border)',
    statusGreen: 'var(--medix-status-green)',
    statusGreenBg: 'var(--medix-status-green-bg)',
    statusGreenBorder: '1px solid var(--medix-status-green-border)',
    tableHeaderBg: 'var(--medix-bg-subtle)',
    tableRowHover: 'var(--medix-bg-subtle)',
    shadowCard: 'var(--medix-shadow-card)',
    radiusSm: 'var(--radius-sm)',
    radiusMd: 'var(--radius-md)',
    radiusLg: 'var(--radius-lg)',
    bannerGrad: 'var(--medix-bg-subtle)',
    bannerText: 'var(--medix-text-main)'
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
