import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function Sidebar({
  usuario,
  onLogout,
  onCambiarPassword,
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
  const { temaOscuro, toggleTema } = useTheme()

  const rolRaw = (usuario?.rol || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const esAdmin = rolRaw.includes('admin')
  const esMedico = rolRaw.includes('medico')
  const esEnfermera = rolRaw.includes('enfermer')

  const esDashboard = currentPath === '/dashboard' || currentPath === '/'
  const esNuevaHistoria = currentPath === '/agregarhistoria' || currentPath === '/nueva-historia'
  const esSignosVitales = currentPath === '/signosvitales' || currentPath === '/triaje'
  const esUsuarios = currentPath === '/usuarios'
  const esSolicitudes = currentPath === '/solicitudes'
  const esConfiguracion = currentPath === '/configuracion'

  const menuItems = [
    {
      id: 'dashboard',
      nombre: 'Historias Clínicas',
      ruta: '/dashboard',
      activo: esDashboard,
      visible: esAdmin || esMedico || !esEnfermera
    },
    {
      id: 'nueva_historia',
      nombre: 'Nueva Historia',
      ruta: '/agregarhistoria',
      activo: esNuevaHistoria,
      visible: esAdmin || esMedico
    },
    {
      id: 'signos_vitales',
      nombre: 'Signos Vitales',
      ruta: '/signosvitales',
      activo: esSignosVitales,
      visible: esAdmin || esEnfermera
    },
    {
      id: 'solicitudes',
      nombre: 'Solicitudes',
      ruta: '/solicitudes',
      activo: esSolicitudes,
      contador: totalSolicitudesPendientes,
      visible: esAdmin
    },
    {
      id: 'usuarios',
      nombre: 'Usuarios',
      ruta: '/usuarios',
      activo: esUsuarios,
      visible: esAdmin
    },
    {
      id: 'configuracion',
      nombre: 'Configuración',
      ruta: '/configuracion',
      activo: esConfiguracion,
      visible: esAdmin
    }
  ]

  const itemsVisibles = menuItems.filter(item => item.visible)
  const inicialesUsuario = (usuario?.username || 'U').slice(0, 2).toUpperCase()

  return (
    <aside
      aria-label="Navegación principal"
      style={{
        width: '224px',
        flex: isMobile ? 'none' : '0 0 224px',
        height: '100vh',
        backgroundColor: 'var(--sidebar-bg)',
        color: 'var(--sidebar-text)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        zIndex: isMobile ? 100 : 30,
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: isMobile ? (sidebarMobileAbierto ? '0px' : '-240px') : 0,
        bottom: isMobile ? 0 : undefined,
        transition: isMobile ? 'left 0.2s ease' : 'none',
        overflowY: 'auto'
      }}
    >
      {/* Cabecera institucional y navegación */}
      <div style={{ padding: '20px 16px 12px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', paddingBottom: '14px', borderBottom: '1px solid var(--sidebar-border)' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.2px', lineHeight: 1.2 }}>
              Medix
            </div>
            <div style={{ fontSize: '12px', fontWeight: 400, color: 'var(--sidebar-muted)', marginTop: '3px', lineHeight: 1.35 }}>
              Hospital San Juan de Dios de Pisco
            </div>
          </div>

          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Cerrar menú lateral"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                border: '1px solid var(--sidebar-border)',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Lista de navegación sin iconos decorativos */}
        <nav aria-label="Menú del sistema" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {itemsVisibles.map((item) => {
            const isActivo = item.activo
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  navigate(item.ruta)
                  if (isMobile && onCloseMobile) onCloseMobile()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  backgroundColor: isActivo ? 'var(--sidebar-active-bg)' : 'transparent',
                  color: isActivo ? '#FFFFFF' : 'var(--sidebar-muted)',
                  fontWeight: isActivo ? 600 : 500,
                  fontSize: '14px',
                  lineHeight: 1.3
                }}
              >
                <span>{item.nombre}</span>

                {item.contador !== undefined && item.contador > 0 && (
                  <span
                    style={{
                      backgroundColor: '#B42318',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '1px 7px',
                      borderRadius: '8px',
                      lineHeight: 1.4
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

      {/* Pie de barra lateral: usuario, tema y sesión */}
      <div style={{ padding: '14px 16px 18px 16px', borderTop: '1px solid var(--sidebar-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--sidebar-active-bg)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              flexShrink: 0
            }}
          >
            {inicialesUsuario}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {usuario?.username || 'admin'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--sidebar-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {usuario?.rol || 'Personal'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            type="button"
            onClick={toggleTema}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid var(--sidebar-border)',
              backgroundColor: 'transparent',
              color: 'var(--sidebar-muted)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Tema: {temaOscuro ? 'Oscuro' : 'Claro'}
          </button>

          {onCambiarPassword && (
            <button
              type="button"
              onClick={onCambiarPassword}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid var(--sidebar-border)',
                backgroundColor: 'transparent',
                color: 'var(--sidebar-muted)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              Cambiar contraseña
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onLogout()
              if (isMobile && onCloseMobile) onCloseMobile()
            }}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid var(--sidebar-border)',
              backgroundColor: 'transparent',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  )
}
