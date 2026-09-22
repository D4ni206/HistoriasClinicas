import { useLocation, useNavigate } from 'react-router-dom'
import logoHospital from '../assets/logo-login.png'

export default function Sidebar({ usuario, onLogout, totalPacientes, totalDocumentos, totalSolicitudesPendientes = 0 }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

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

  // Colores de la tarjeta de usuario según su rol
  let userBadgeBg = '#FFF6FB'
  let userBadgeColor = '#2B4A66'
  let userBadgeBorder = '#e2c5d5'
  if (esAdmin) {
    userBadgeBg = '#FFD6E8'
    userBadgeColor = '#802048'
    userBadgeBorder = '#f4a7c7'
  } else if (esMedico) {
    userBadgeBg = '#7FD6FF'
    userBadgeColor = '#104060'
    userBadgeBorder = '#54bde8'
  } else if (esEnfermera) {
    userBadgeBg = '#6FE3B4'
    userBadgeColor = '#0a5438'
    userBadgeBorder = '#4cc799'
  }

  return (
    <aside style={{
      width: '300px',
      flex: '0 0 300px',
      height: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '1.5px solid #7FD6FF',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      zIndex: 20
    }}>
      {/* Contenido superior y menú con scroll independiente */}
      <div style={{ padding: '18px 16px', overflowY: 'auto', flex: 1 }}>
        {/* Cabecera Institucional */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1.5px solid #7FD6FF' }}>
          <img
            src={logoHospital}
            alt="Hospital San Juan de Dios de Pisco"
            onError={(e) => {
              if (e.currentTarget.src !== '/logo_hospital.png') {
                e.currentTarget.src = '/logo_hospital.png'
              }
            }}
            style={{
              height: '46px',
              width: 'auto',
              objectFit: 'contain',
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              padding: '2px 4px',
              border: '1.5px solid #7FD6FF',
              boxShadow: '0 2px 5px rgba(127, 214, 255, 0.3)'
            }}
          />
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#2B4A66', margin: 0, lineHeight: '1.2' }}>
              Medix
            </h1>
            <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '11px', fontWeight: '600' }}>
              HOSPITAL SAN JUAN DE DIOS · PISCO
            </p>
            <span style={{ fontSize: '10px', color: '#0a5438', backgroundColor: '#6FE3B4', padding: '1px 6px', borderRadius: '4px', fontWeight: '700', border: '1px solid #4cc799' }}>
              UE-404
            </span>
          </div>
        </div>

        {/* Tarjeta de Sesión de Usuario */}
        <div style={{
          backgroundColor: userBadgeBg,
          border: `1px solid ${userBadgeBorder}`,
          borderRadius: '10px',
          padding: '10px 12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div>
            <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: userBadgeColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Usuario Conectado
            </span>
            <strong style={{ fontSize: '13px', color: '#2B4A66' }}>
              {usuario?.username || 'admin'}
            </strong>
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              color: userBadgeColor,
              marginLeft: '6px',
              backgroundColor: '#ffffff',
              padding: '1px 6px',
              borderRadius: '4px',
              border: `1px solid ${userBadgeBorder}`
            }}>
              {usuario?.rol || 'Personal'}
            </span>
          </div>
          <button
            onClick={onLogout}
            style={{
              backgroundColor: '#ffffff',
              color: '#802048',
              border: '1px solid #f4a7c7',
              padding: '5px 9px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title="Cerrar sesión y volver a la pantalla de acceso"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* MENÚ DE HERRAMIENTAS / RUTAS POR ROL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#2B4A66', textTransform: 'uppercase', letterSpacing: '0.8px', paddingLeft: '4px' }}>
            Herramientas Habilitadas
          </span>

          {/* 1. DASHBOARD (MÉDICO y ADMINISTRADOR) */}
          {(esAdmin || esMedico || !esEnfermera) && (
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '8px',
                border: esDashboard ? '1.5px solid #54bde8' : '1px solid #e2e8f0',
                backgroundColor: esDashboard ? '#7FD6FF' : '#ffffff',
                color: esDashboard ? '#104060' : '#2B4A66',
                fontWeight: esDashboard ? '700' : '600',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: esDashboard ? '0 2px 6px rgba(127, 214, 255, 0.45)' : 'none'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Dashboard</span>
                <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: '500' }}>Expedientes y notas</span>
              </div>
            </button>
          )}

          {/* 2. AGREGAR NUEVA HISTORIA (MÉDICO y ADMINISTRADOR - NO ENFERMERA) */}
          {(esAdmin || esMedico) && (
            <button
              onClick={() => navigate('/agregarhistoria')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '8px',
                border: esNuevaHistoria ? '1.5px solid #f4a7c7' : '1px solid #e2e8f0',
                backgroundColor: esNuevaHistoria ? '#FFD6E8' : '#ffffff',
                color: esNuevaHistoria ? '#802048' : '#2B4A66',
                fontWeight: esNuevaHistoria ? '700' : '600',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: esNuevaHistoria ? '0 2px 6px rgba(255, 214, 232, 0.45)' : 'none'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Agregar nueva historia</span>
                <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: '500' }}>Subir documentos clínicos</span>
              </div>
            </button>
          )}

          {/* 3. SIGNOS VITALES / TRIAJE (ENFERMERA y ADMINISTRADOR) */}
          {(esAdmin || esEnfermera) && (
            <button
              onClick={() => navigate('/signosvitales')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '8px',
                border: esSignosVitales ? '1.5px solid #4cc799' : '1px solid #e2e8f0',
                backgroundColor: esSignosVitales ? '#6FE3B4' : '#ffffff',
                color: esSignosVitales ? '#0a5438' : '#2B4A66',
                fontWeight: esSignosVitales ? '700' : '600',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: esSignosVitales ? '0 2px 6px rgba(111, 227, 180, 0.45)' : 'none'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Signos Vitales</span>
                <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: '500' }}>Presión, peso y triaje</span>
              </div>
            </button>
          )}

          {/* 4. CREAR USUARIOS (SOLO ADMINISTRADOR) */}
          {esAdmin && (
            <button
              onClick={() => navigate('/usuarios')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '8px',
                border: esUsuarios ? '1.5px solid #54bde8' : '1px solid #e2e8f0',
                backgroundColor: esUsuarios ? '#FFF6FB' : '#ffffff',
                color: '#2B4A66',
                fontWeight: esUsuarios ? '700' : '600',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: esUsuarios ? '0 2px 6px rgba(127, 214, 255, 0.35)' : 'none'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Crear usuarios</span>
                <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: '500' }}>Personal y roles</span>
              </div>
            </button>
          )}

          {/* 5. SOLICITUDES DE ELIMINACIÓN (SOLO ADMINISTRADOR) */}
          {esAdmin && (
            <button
              onClick={() => navigate('/solicitudes')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: '8px',
                border: esSolicitudes ? '1.5px solid #f4a7c7' : '1px solid #e2e8f0',
                backgroundColor: esSolicitudes ? '#FFF6FB' : '#ffffff',
                color: esSolicitudes ? '#802048' : '#2B4A66',
                fontWeight: esSolicitudes ? '700' : '600',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: esSolicitudes ? '0 2px 6px rgba(255, 214, 232, 0.45)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>Solicitudes</span>
                  <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: '500' }}>Bandeja de eliminación</span>
                </div>
              </div>

              {totalSolicitudesPendientes > 0 && (
                <span style={{
                  backgroundColor: '#FFD6E8',
                  color: '#802048',
                  border: '1px solid #f4a7c7',
                  borderRadius: '10px',
                  padding: '1px 8px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  {totalSolicitudesPendientes}
                </span>
              )}
            </button>
          )}

          {/* 6. CONFIGURACIÓN (SOLO ADMINISTRADOR) */}
          {esAdmin && (
            <button
              onClick={() => navigate('/configuracion')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '8px',
                border: esConfiguracion ? '1.5px solid #f4a7c7' : '1px solid #e2e8f0',
                backgroundColor: esConfiguracion ? '#FFD6E8' : '#ffffff',
                color: esConfiguracion ? '#802048' : '#2B4A66',
                fontWeight: esConfiguracion ? '700' : '600',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: esConfiguracion ? '0 2px 6px rgba(255, 214, 232, 0.45)' : 'none'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Configuración</span>
                <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: '500' }}>Diagnóstico y servicios</span>
              </div>
            </button>
          )}
        </div>

        {/* Métricas Rápidas */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          <div style={{
            flex: 1,
            backgroundColor: '#7FD6FF',
            border: '1px solid #54bde8',
            borderRadius: '8px',
            padding: '8px 10px',
            textAlign: 'center'
          }}>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#104060' }}>Carpetas</span>
            <strong style={{ fontSize: '18px', color: '#104060' }}>{totalPacientes}</strong>
          </div>
          <div style={{
            flex: 1,
            backgroundColor: '#6FE3B4',
            border: '1px solid #4cc799',
            borderRadius: '8px',
            padding: '8px 10px',
            textAlign: 'center'
          }}>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#0a5438' }}>Documentos</span>
            <strong style={{ fontSize: '18px', color: '#0a5438' }}>{totalDocumentos}</strong>
          </div>
        </div>
      </div>

      {/* Pie del Panel Izquierdo */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b', textAlign: 'center', backgroundColor: '#fafafa' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6FE3B4', border: '1px solid #4cc799', display: 'inline-block' }}></span>
          <span style={{ fontWeight: '700', color: '#2B4A66' }}>Sistema Operativo</span>
        </div>
        Hospital San Juan de Dios - Pisco · UE-404
      </div>
    </aside>
  )
}
