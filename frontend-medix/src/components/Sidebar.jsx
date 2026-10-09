import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import logoHospital from '../assets/logo-login.png'

export default function Sidebar({
  usuario,
  onLogout,
  totalPacientes = 0,
  totalDocumentos = 0,
  totalSolicitudesPendientes = 0,
  busquedaDni = '',
  setBusquedaDni = () => {},
  isMobile = false,
  sidebarMobileAbierto = false,
  onCloseMobile = () => {}
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  // Estado de colapso y tema guardados en localStorage
  const [colapsado, setColapsado] = useState(() => {
    return localStorage.getItem('medix_sidebar_collapsed') === 'true'
  })

  const [temaOscuro, setTemaOscuro] = useState(() => {
    const guardado = localStorage.getItem('medix_sidebar_theme')
    return guardado !== null ? guardado === 'dark' : true
  })

  // Guardar preferencias en localStorage
  useEffect(() => {
    localStorage.setItem('medix_sidebar_collapsed', colapsado ? 'true' : 'false')
  }, [colapsado])

  useEffect(() => {
    localStorage.setItem('medix_sidebar_theme', temaOscuro ? 'dark' : 'light')
  }, [temaOscuro])

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

  // Paleta dinámica según Tema Oscuro o Claro
  const theme = temaOscuro ? {
    bg: '#14161f',
    border: '1px solid #232738',
    textMain: '#ffffff',
    textMuted: '#94a3b8',
    itemHoverBg: '#1e2230',
    itemHoverText: '#ffffff',
    searchBg: '#1e2230',
    searchBorder: '1px solid #282d3f',
    searchColor: '#f1f5f9',
    searchPlaceholder: '#64748b',
    activeBg: '#5855f2',
    activeColor: '#ffffff',
    toggleBoxBg: '#1e2230',
    headerBtnBg: '#1e2230',
    headerBtnHover: '#292f42',
    headerBtnColor: '#94a3b8',
    shadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
    userCardBg: '#1c202d',
    userCardBorder: '1px solid #272d3e',
  } : {
    bg: '#ffffff',
    border: '1.5px solid #e2e8f0',
    textMain: '#0f172a',
    textMuted: '#64748b',
    itemHoverBg: '#f1f5f9',
    itemHoverText: '#0f172a',
    searchBg: '#f3f4f8',
    searchBorder: '1px solid #e2e8f0',
    searchColor: '#1e293b',
    searchPlaceholder: '#94a3b8',
    activeBg: '#5855f2',
    activeColor: '#ffffff',
    toggleBoxBg: '#f3f4f8',
    headerBtnBg: '#f1f5f9',
    headerBtnHover: '#e2e8f0',
    headerBtnColor: '#64748b',
    shadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
    userCardBg: '#f8fafc',
    userCardBorder: '1px solid #e2e8f0',
  }

  // Lista de items de navegación configurados según permisos de rol
  const menuItems = [
    {
      id: 'dashboard',
      nombre: 'Dashboard',
      subtitulo: 'Expedientes y notas',
      ruta: '/dashboard',
      activo: esDashboard,
      visible: esAdmin || esMedico || !esEnfermera,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
        </svg>
      )
    },
    {
      id: 'nueva_historia',
      nombre: 'Nueva Historia',
      subtitulo: 'Subir documentos',
      ruta: '/agregarhistoria',
      activo: esNuevaHistoria,
      visible: esAdmin || esMedico,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
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
      subtitulo: 'Presión y triaje',
      ruta: '/signosvitales',
      activo: esSignosVitales,
      badge: 'Triaje',
      visible: esAdmin || esEnfermera,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"></rect>
          <line x1="8" y1="17" x2="8" y2="12"></line>
          <line x1="12" y1="17" x2="12" y2="8"></line>
          <line x1="16" y1="17" x2="16" y2="14"></line>
        </svg>
      )
    },
    {
      id: 'solicitudes',
      nombre: 'Solicitudes',
      subtitulo: 'Bandeja de eliminación',
      ruta: '/solicitudes',
      activo: esSolicitudes,
      contador: totalSolicitudesPendientes,
      visible: esAdmin,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      )
    },
    {
      id: 'usuarios',
      nombre: 'Usuarios',
      subtitulo: 'Personal y roles',
      ruta: '/usuarios',
      activo: esUsuarios,
      visible: esAdmin,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
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
      subtitulo: 'Diagnóstico y servicios',
      ruta: '/configuracion',
      activo: esConfiguracion,
      visible: esAdmin,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      )
    }
  ]

  const itemsVisibles = menuItems.filter(item => item.visible)

  return (
    <aside
      style={{
        width: isMobile ? '264px' : (colapsado ? '74px' : '256px'),
        flex: isMobile ? 'none' : (colapsado ? '0 0 74px' : '0 0 256px'),
        height: isMobile ? '100vh' : 'calc(100vh - 24px)',
        margin: isMobile ? 0 : '12px 0 12px 12px',
        borderRadius: isMobile ? '0 24px 24px 0' : '24px',
        backgroundColor: theme.bg,
        border: theme.border,
        boxShadow: isMobile && !sidebarMobileAbierto ? 'none' : theme.shadow,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        zIndex: isMobile ? 100 : 30,
        position: isMobile ? 'fixed' : 'relative',
        top: isMobile ? 0 : undefined,
        left: isMobile ? (sidebarMobileAbierto ? '0px' : '-320px') : undefined,
        bottom: isMobile ? 0 : undefined,
        transition: isMobile
          ? 'left 0.28s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.25s ease'
          : 'width 0.26s cubic-bezier(0.4, 0, 0.2, 1), flex 0.26s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.25s ease, border-color 0.25s ease',
        overflow: 'hidden'
      }}
    >
      {/* SECCIÓN SUPERIOR: HEADER Y MENÚ */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: (colapsado && !isMobile) ? '16px 10px 8px 10px' : '18px 14px 10px 14px',
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: 1
        }}
      >
        {/* CABECERA (Logo circular + Botón de colapso o Cerrar en móvil) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: (colapsado && !isMobile) ? 'center' : 'space-between',
            marginBottom: '16px',
            position: 'relative'
          }}
        >
          {/* Logo Circular */}
          <div
            onClick={() => {
              if (colapsado && !isMobile) setColapsado(false)
            }}
            title={(colapsado && !isMobile) ? "Click para desplegar menú" : "Medix - Hospital San Juan de Dios"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: (colapsado && !isMobile) ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                flexShrink: 0
              }}
            >
              {/* Símbolo vectorial moderno */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17"></path>
              </svg>
            </div>

            {(!colapsado || isMobile) && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: theme.textMain, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                  Medix
                </span>
                <span style={{ fontSize: '9px', fontWeight: '700', color: theme.textMuted, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  HOSPITAL PISCO
                </span>
              </div>
            )}
          </div>

          {/* Botón de alternar colapso o Cerrar en móvil */}
          {isMobile ? (
            <button
              onClick={onCloseMobile}
              title="Cerrar menú lateral"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: theme.headerBtnBg,
                color: theme.headerBtnColor,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.headerBtnHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.headerBtnBg}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setColapsado(!colapsado)}
              title={colapsado ? "Expandir barra lateral" : "Colapsar barra lateral"}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: theme.headerBtnBg,
                color: theme.headerBtnColor,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease, transform 0.15s ease',
                flexShrink: 0,
                ...(colapsado ? { marginTop: '8px' } : {})
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.headerBtnHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.headerBtnBg}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
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

        {/* LISTA DE FUNCIONALIDADES (NAV ITEMS) */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {itemsVisibles.map((item) => {
            const isActivo = item.activo

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.ruta)
                  if (isMobile && onCloseMobile) onCloseMobile()
                }}
                title={(colapsado && !isMobile) ? `${item.nombre}${item.contador ? ` (${item.contador} pendientes)` : ''}` : undefined}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: (colapsado && !isMobile) ? 'center' : 'space-between',
                  padding: (colapsado && !isMobile) ? '0' : '10px 12px',
                  height: (colapsado && !isMobile) ? '44px' : '44px',
                  width: (colapsado && !isMobile) ? '44px' : '100%',
                  margin: (colapsado && !isMobile) ? '0 auto' : '0',
                  borderRadius: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActivo ? theme.activeBg : 'transparent',
                  color: isActivo ? theme.activeColor : theme.textMuted,
                  fontWeight: isActivo ? '600' : '500',
                  fontSize: '13.5px',
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActivo ? '0 4px 14px rgba(88, 85, 242, 0.38)' : 'none',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActivo) {
                    e.currentTarget.style.backgroundColor = theme.itemHoverBg
                    e.currentTarget.style.color = theme.itemHoverText
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActivo) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = theme.textMuted
                  }
                }}
              >
                {/* Lado izquierdo: Icono + Texto si está expandido */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>

                  {!colapsado && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.nombre}
                    </span>
                  )}
                </div>

                {/* Insignias / Contadores */}
                {!colapsado && item.contador !== undefined && item.contador > 0 && (
                  <span
                    style={{
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '1px 7px',
                      borderRadius: '10px',
                      lineHeight: '16px',
                      boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    {item.contador}
                  </span>
                )}

                {!colapsado && item.badge && !isActivo && (
                  <span
                    style={{
                      backgroundColor: temaOscuro ? '#5855f2' : '#e0e7ff',
                      color: temaOscuro ? '#ffffff' : '#4338ca',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: '6px'
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Contador en modo colapsado (Badge en esquina superior) */}
                {colapsado && item.contador !== undefined && item.contador > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: '800',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
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

      {/* SECCIÓN INFERIOR: SESIÓN DE USUARIO Y TOGGLE DE TEMA */}
      <div
        style={{
          padding: colapsado ? '10px 10px 14px 10px' : '10px 14px 14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {/* Tarjeta de Sesión de Usuario */}
        {colapsado ? (
          <div
            title={`Usuario: ${usuario?.username || 'admin'} (${usuario?.rol || 'Personal'}) - Click para cerrar sesión`}
            onClick={onLogout}
            style={{
              width: '44px',
              height: '44px',
              margin: '0 auto',
              borderRadius: '12px',
              backgroundColor: theme.userCardBg,
              border: theme.userCardBorder,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ef4444',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.userCardBg}
          >
            {/* Icono de Salida / Logout */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: theme.userCardBg,
              border: theme.userCardBorder,
              borderRadius: '14px',
              padding: '9px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: esAdmin ? '#FFD6E8' : esMedico ? '#7FD6FF' : '#6FE3B4',
                  color: esAdmin ? '#802048' : esMedico ? '#104060' : '#0a5438',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '800',
                  flexShrink: 0
                }}
              >
                {(usuario?.username || 'U')[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    color: theme.textMain,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {usuario?.username || 'admin'}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: theme.textMuted,
                    textTransform: 'capitalize'
                  }}
                >
                  {usuario?.rol || 'Personal'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout()
                if (isMobile && onCloseMobile) onCloseMobile()
              }}
              title="Cerrar Sesión"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        )}

        {/* TOGGLE MODO OSCURO / MODO CLARO (Exacto al diseño de la imagen) */}
        {colapsado ? (
          <button
            onClick={() => setTemaOscuro(!temaOscuro)}
            title={temaOscuro ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            style={{
              width: '44px',
              height: '42px',
              margin: '0 auto',
              borderRadius: '12px',
              backgroundColor: theme.toggleBoxBg,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: theme.textMuted,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.textMain
              e.currentTarget.style.backgroundColor = theme.headerBtnHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.textMuted
              e.currentTarget.style.backgroundColor = theme.toggleBoxBg
            }}
          >
            {temaOscuro ? (
              // Icono Sol en modo oscuro colapsado (como en la imagen del medio)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
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
              // Icono Luna en modo claro colapsado (como en la imagen de la derecha)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        ) : (
          <div
            onClick={() => setTemaOscuro(!temaOscuro)}
            title="Alternar entre modo oscuro y claro"
            style={{
              height: '42px',
              borderRadius: '14px',
              backgroundColor: theme.toggleBoxBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'background-color 0.15s ease'
            }}
          >
            {/* Lado izquierdo: Icono de Luna y texto "Dark mode" */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              <span style={{ fontSize: '13px', fontWeight: '600', color: theme.textMain }}>
                Dark mode
              </span>
            </div>

            {/* Lado derecho: Switch Toggle interactivo */}
            <div
              style={{
                width: '38px',
                height: '22px',
                borderRadius: '11px',
                backgroundColor: temaOscuro ? '#5855f2' : '#cbd5e1',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                transition: 'background-color 0.22s ease',
                boxSizing: 'border-box'
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                  transform: temaOscuro ? 'translateX(16px)' : 'translateX(0px)',
                  transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
