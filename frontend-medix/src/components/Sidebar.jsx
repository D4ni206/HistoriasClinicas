import { useLocation, useNavigate } from 'react-router-dom'

export default function Sidebar({ usuario, onLogout, totalPacientes, totalDocumentos }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  const esDashboard = currentPath === '/dashboard' || currentPath === '/'
  const esNuevaHistoria = currentPath === '/agregarhistoria' || currentPath === '/nueva-historia'
  const esUsuarios = currentPath === '/usuarios'
  const esConfiguracion = currentPath === '/configuracion'

  return (
    <aside style={{
      width: '300px',
      flex: '0 0 300px',
      height: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '1.5px solid #A7C7D9',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      zIndex: 20
    }}>
      {/* Contenido superior y menú con scroll independiente */}
      <div style={{ padding: '18px 16px', overflowY: 'auto', flex: 1 }}>
        {/* Cabecera Institucional */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1.5px solid #A7C7D9' }}>
          <img
            src="/logo_hospital.png"
            alt="Hospital San Juan de Dios de Pisco"
            style={{
              height: '46px',
              width: 'auto',
              objectFit: 'contain',
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              padding: '2px 4px',
              border: '1.5px solid #A7C7D9',
              boxShadow: '0 2px 5px rgba(167, 199, 217, 0.3)'
            }}
          />
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0f2942', margin: 0, lineHeight: '1.2' }}>
              Medix
            </h1>
            <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '11px', fontWeight: '600' }}>
              HOSPITAL SAN JUAN DE DIOS · PISCO
            </p>
            <span style={{ fontSize: '10px', color: '#0c354e', backgroundColor: '#CFE7D6', padding: '1px 6px', borderRadius: '4px', fontWeight: '700', border: '1px solid #9ec6ac' }}>
              UE-404
            </span>
          </div>
        </div>

        {/* Tarjeta de Sesión de Usuario */}
        <div style={{
          backgroundColor: '#FFF2B6',
          border: '1px solid #F6E38F',
          borderRadius: '10px',
          padding: '10px 12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div>
            <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#634706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Usuario Conectado
            </span>
            <strong style={{ fontSize: '13px', color: '#0f2942' }}>
              {usuario?.username || 'admin'}
            </strong>
            <span style={{ fontSize: '11px', color: '#634706', marginLeft: '4px' }}>
              ({usuario?.rol || 'Personal'})
            </span>
          </div>
          <button
            onClick={onLogout}
            style={{
              backgroundColor: '#F3C7B6',
              color: '#70220e',
              border: '1px solid #e19d85',
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

        {/* MENÚ DE HERRAMIENTAS / RUTAS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', paddingLeft: '4px' }}>
            Herramientas
          </span>

          {/* 1. DASHBOARD (/dashboard) */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '8px',
              border: esDashboard ? '1.5px solid #84aabd' : '1px solid #e2e8f0',
              backgroundColor: esDashboard ? '#A7C7D9' : '#ffffff',
              color: esDashboard ? '#0c354e' : '#334155',
              fontWeight: esDashboard ? '700' : '600',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              boxShadow: esDashboard ? '0 2px 6px rgba(167, 199, 217, 0.45)' : 'none'
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
              <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: '500' }}>Expedientes y carpetas</span>
            </div>
          </button>

          {/* 2. AGREGAR NUEVA HISTORIA (/agregarhistoria) */}
          <button
            onClick={() => navigate('/agregarhistoria')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '8px',
              border: esNuevaHistoria ? '1.5px solid #9ec6ac' : '1px solid #e2e8f0',
              backgroundColor: esNuevaHistoria ? '#CFE7D6' : '#ffffff',
              color: esNuevaHistoria ? '#134e2b' : '#334155',
              fontWeight: esNuevaHistoria ? '700' : '600',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              boxShadow: esNuevaHistoria ? '0 2px 6px rgba(158, 198, 172, 0.45)' : 'none'
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

          {/* 3. CREAR USUARIOS (/usuarios) */}
          <button
            onClick={() => navigate('/usuarios')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '8px',
              border: esUsuarios ? '1.5px solid #F6E38F' : '1px solid #e2e8f0',
              backgroundColor: esUsuarios ? '#FFF2B6' : '#ffffff',
              color: esUsuarios ? '#634706' : '#334155',
              fontWeight: esUsuarios ? '700' : '600',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              boxShadow: esUsuarios ? '0 2px 6px rgba(246, 227, 143, 0.45)' : 'none'
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

          {/* 4. CONFIGURACIÓN (/configuracion) */}
          <button
            onClick={() => navigate('/configuracion')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '8px',
              border: esConfiguracion ? '1.5px solid #e19d85' : '1px solid #e2e8f0',
              backgroundColor: esConfiguracion ? '#F3C7B6' : '#ffffff',
              color: esConfiguracion ? '#70220e' : '#334155',
              fontWeight: esConfiguracion ? '700' : '600',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              boxShadow: esConfiguracion ? '0 2px 6px rgba(243, 199, 182, 0.45)' : 'none'
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
        </div>

        {/* Métricas Rápidas */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          <div style={{
            flex: 1,
            backgroundColor: '#A7C7D9',
            border: '1px solid #84aabd',
            borderRadius: '8px',
            padding: '8px 10px',
            textAlign: 'center'
          }}>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#0c354e' }}>Carpetas</span>
            <strong style={{ fontSize: '18px', color: '#0c354e' }}>{totalPacientes}</strong>
          </div>
          <div style={{
            flex: 1,
            backgroundColor: '#CFE7D6',
            border: '1px solid #9ec6ac',
            borderRadius: '8px',
            padding: '8px 10px',
            textAlign: 'center'
          }}>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#134e2b' }}>Documentos</span>
            <strong style={{ fontSize: '18px', color: '#134e2b' }}>{totalDocumentos}</strong>
          </div>
        </div>
      </div>

      {/* Pie del Panel Izquierdo */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b', textAlign: 'center', backgroundColor: '#fafafa' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
          <span style={{ fontWeight: '700', color: '#0f2942' }}>Sistema Operativo</span>
        </div>
        Hospital San Juan de Dios - Pisco · UE-404
      </div>
    </aside>
  )
}
