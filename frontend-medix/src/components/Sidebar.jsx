import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function Sidebar({
  usuario,
  onLogout,
  onCambiarPassword,
  totalPacientes: _totalPacientes = 0,
  totalDocumentos: _totalDocumentos = 0,
  totalSolicitudesPendientes = 0,
  busquedaDni: _busquedaDni = '',
  setBusquedaDni: _setBusquedaDni = () => {},
  isMobile = false,
  sidebarMobileAbierto = false,
  onCloseMobile = () => {}
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const { temaOscuro, toggleTema } = useTheme()

  // Estado de colapso guardado en localStorage
  const [colapsado, setColapsado] = useState(() => {
    return localStorage.getItem('medix_sidebar_collapsed') === 'true'
  })

  // Guardar preferencia de colapso en localStorage
  useEffect(() => {
    localStorage.setItem('medix_sidebar_collapsed', colapsado ? 'true' : 'false')
  }, [colapsado])

  const rolRaw = (usuario?.rol || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  const esAdmin = rolRaw.includes('admin')
  const esMedico = rolRaw.includes('medico')
  const esEnfermera = rolRaw.includes('enfermer')

  const esDashboard = currentPath === '/dashboard' || currentPath === '/'
  const esNuevaHistoria = currentPath === '/agregarhistoria' || currentPath === '/nueva-historia'
  const esSignosVitales = currentPath === '/signosvitales' || currentPath === '/triaje'
  const esUsuarios = currentPath === '/usuarios'
  const esSolicitudes = currentPath === '/solicitudes'
  const esConfiguracion = currentPath === '/configuracion'

  // Items de menú institucionales
  const menuItems = [
    {
      id: 'dashboard',
      nombre: 'Expedientes',
      ruta: '/dashboard',
      activo: esDashboard,
      visible: esAdmin || esMedico || !esEnfermera,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1"></rect>
        </svg>
      )
    },
    {
      id: 'nueva_historia',
      nombre: 'Nueva Historia',
      ruta: '/agregarhistoria',
      activo: esNuevaHistoria,
      visible: esAdmin || esMedico,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      )
    },
    {
      id: 'signos_vitales',
      nombre: 'Signos Vitales',
      ruta: '/signosvitales',
      activo: esSignosVitales,
      visible: esAdmin || esEnfermera,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      )
    },
    {
      id: 'solicitudes',
      nombre: 'Solicitudes',
      ruta: '/solicitudes',
      activo: esSolicitudes,
      contador: totalSolicitudesPendientes,
      visible: esAdmin,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      )
    },
    {
      id: 'usuarios',
      nombre: 'Usuarios',
      ruta: '/usuarios',
      activo: esUsuarios,
      visible: esAdmin,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      id: 'configuracion',
      nombre: 'Configuración',
      ruta: '/configuracion',
      activo: esConfiguracion,
      visible: esAdmin,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      )
    }
  ]

  const itemsVisibles = menuItems.filter(item => item.visible)
  const isColapsado = colapsado && !isMobile
  const sidebarWidth = isMobile ? '224px' : (isColapsado ? '64px' : '224px')

  return (
    <aside
      aria-label="Navegación principal"
      style={{
        width: sidebarWidth,
        flex: isMobile ? 'none' : `0 0 ${sidebarWidth}`,
        height: '100%',
        backgroundColor: 'var(--medix-navy, #0B2545)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        zIndex: isMobile ? 100 : 30,
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        bottom: 0,
        left: isMobile ? (sidebarMobileAbierto ? '0px' : '-240px') : undefined,
        transition: isMobile
          ? 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          : 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), flex 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        color: '#FFFFFF',
        overflow: 'hidden'
      }}
    >
      {/* SECCIÓN SUPERIOR: LOGO Y MENÚ */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: isColapsado ? '16px 8px' : '16px 12px',
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: 1
        }}
      >
        {/* CABECERA (Logo Medix + Nombre Hospital + Botón colapso/cierre) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isColapsado ? 'center' : 'space-between',
            paddingBottom: '16px',
            marginBottom: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Logo y Nombre */}
          <div
            onClick={() => {
              if (isColapsado) setColapsado(false)
            }}
            title={isColapsado ? 'Expandir barra lateral' : 'Medix - Hospital San Juan de Dios de Pisco'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: isColapsado ? 'pointer' : 'default',
              userSelect: 'none',
              minWidth: 0
            }}
          >
            {/* Emblema Clínico Cruz */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--medix-action, #1D5C96)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                flexShrink: 0
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>

            {!isColapsado && (
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#FFFFFF',
                    letterSpacing: '-0.3px',
                    lineHeight: 1.15
                  }}
                >
                  Medix
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.65)',
                    lineHeight: 1.2,
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title="Hospital San Juan de Dios de Pisco"
                >
                  Hosp. San Juan de Dios
                </span>
              </div>
            )}
          </div>

          {/* Botón de alternar colapso o Cerrar en móvil */}
          {isMobile ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Cerrar menú lateral"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: 'rgba(255, 255, 255, 0.7)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.color = '#FFFFFF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setColapsado(!colapsado)}
              aria-label={colapsado ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
              title={colapsado ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: 'rgba(255, 255, 255, 0.65)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease, color 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.color = '#FFFFFF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)'
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{
                  transform: colapsado ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }}
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          )}
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <nav aria-label="Secciones" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {itemsVisibles.map((item) => {
            const isActivo = item.activo

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  navigate(item.ruta)
                  if (isMobile && onCloseMobile) onCloseMobile()
                }}
                aria-label={item.nombre}
                aria-current={isActivo ? 'page' : undefined}
                title={isColapsado ? `${item.nombre}${item.contador ? ` (${item.contador})` : ''}` : undefined}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isColapsado ? 'center' : 'space-between',
                  padding: isColapsado ? '0' : '8px 12px',
                  height: '40px',
                  width: isColapsado ? '40px' : '100%',
                  margin: isColapsado ? '0 auto' : '0',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActivo ? 'var(--medix-action, #1D5C96)' : 'transparent',
                  color: isActivo ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                  fontWeight: isActivo ? '600' : '500',
                  fontSize: '13px',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  outline: 'none',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActivo) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
                    e.currentTarget.style.color = '#FFFFFF'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActivo) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>

                  {!isColapsado && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.nombre}
                    </span>
                  )}
                </div>

                {/* Contador de solicitudes */}
                {!isColapsado && item.contador !== undefined && item.contador > 0 && (
                  <span
                    style={{
                      backgroundColor: 'var(--medix-alert-red, #B42318)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      lineHeight: '16px'
                    }}
                  >
                    {item.contador}
                  </span>
                )}

                {/* Badge en modo colapsado */}
                {isColapsado && item.contador !== undefined && item.contador > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: 'var(--medix-alert-red, #B42318)',
                      color: '#FFFFFF',
                      fontSize: '9px',
                      fontWeight: '700',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {item.contador}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* SECCIÓN INFERIOR: USUARIO Y TEMA */}
      <div
        style={{
          padding: isColapsado ? '12px 8px' : '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {/* Información del usuario */}
        {isColapsado ? (
          <button
            type="button"
            aria-label={`Usuario: ${usuario?.username || 'admin'}. Click para cerrar sesión.`}
            title={`Usuario: ${usuario?.username || 'admin'} (${usuario?.rol || 'Personal'}) - Cerrar sesión`}
            onClick={onLogout}
            style={{
              width: '40px',
              height: '40px',
              margin: '0 auto',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.8)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(180, 35, 24, 0.25)'
              e.currentTarget.style.color = '#FFFFFF'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        ) : (
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--medix-action, #1D5C96)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  flexShrink: 0
                }}
              >
                {(usuario?.username || 'U')[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {usuario?.username || 'admin'}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    textTransform: 'capitalize'
                  }}
                >
                  {usuario?.rol || 'Personal'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {onCambiarPassword && (
                <button
                  type="button"
                  onClick={onCambiarPassword}
                  aria-label="Cambiar Contraseña"
                  title="Cambiar Contraseña"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                    padding: '5px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onLogout()
                  if (isMobile && onCloseMobile) onCloseMobile()
                }}
                aria-label="Cerrar Sesión"
                title="Cerrar Sesión"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.15s ease, color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(180, 35, 24, 0.25)'
                  e.currentTarget.style.color = '#FECDCA'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Toggle Tema Claro / Oscuro */}
        <button
          type="button"
          onClick={toggleTema}
          aria-label={temaOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={temaOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          style={{
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isColapsado ? 'center' : 'space-between',
            padding: isColapsado ? '0' : '0 10px',
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.75)',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'background-color 0.15s ease, color 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'
            e.currentTarget.style.color = '#FFFFFF'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {temaOscuro ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}

            {!isColapsado && (
              <span>{temaOscuro ? 'Modo claro' : 'Modo oscuro'}</span>
            )}
          </div>

          {!isColapsado && (
            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.45)' }}>
              {temaOscuro ? 'Oscuro' : 'Claro'}
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
