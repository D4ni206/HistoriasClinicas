import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import logoHospitalSidebar from '../assets/logo-hospital-sidebar.png'

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
  const esUsuarios = currentPath === '/usuarios'
  const esSolicitudes = currentPath === '/solicitudes'
  const esConfiguracion = currentPath === '/configuracion'

  const menuItems = [
    { id: 'dashboard', nombre: 'Historias Clínicas', ruta: '/dashboard', activo: esDashboard, visible: esAdmin || esMedico || !esEnfermera },
    { id: 'nueva_historia', nombre: 'Nueva Historia', ruta: '/agregarhistoria', activo: esNuevaHistoria, visible: esAdmin || esMedico },
    { id: 'solicitudes', nombre: 'Solicitudes', ruta: '/solicitudes', activo: esSolicitudes, contador: totalSolicitudesPendientes, visible: esAdmin },
    { id: 'usuarios', nombre: 'Usuarios', ruta: '/usuarios', activo: esUsuarios, visible: esAdmin },
    { id: 'configuracion', nombre: 'Configuración', ruta: '/configuracion', activo: esConfiguracion, visible: esAdmin }
  ]

  const itemsVisibles = menuItems.filter(item => item.visible)
  const inicialesUsuario = (usuario?.username || 'U').slice(0, 2).toUpperCase()

  return (
    <aside
      aria-label="Navegación principal"
      className="medix-sidebar"
      style={{
        flex: isMobile ? 'none' : '0 0 224px',
        zIndex: isMobile ? 100 : 30,
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: isMobile ? (sidebarMobileAbierto ? '0px' : '-240px') : 0,
        bottom: isMobile ? 0 : undefined,
        transition: isMobile ? 'left 0.2s ease' : 'none'
      }}
    >
      <div style={{ padding: '20px 16px 12px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingBottom: '14px', borderBottom: '1px solid var(--sidebar-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
            <img
              src={logoHospitalSidebar}
              alt="Logo Hospital San Juan de Dios de Pisco"
              style={{ height: '66px', width: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--sidebar-muted)', marginTop: '6px', lineHeight: 1.35 }}>
              Hospital San Juan de Dios de Pisco
            </div>
          </div>

          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Cerrar menú lateral"
              className="medix-sidebar-footer-btn"
              style={{ position: 'absolute', top: 0, right: 0, width: '48px', height: '28px', padding: 0, textAlign: 'center', color: '#FFFFFF' }}
            >
              Cerrar
            </button>
          )}
        </div>

        <nav aria-label="Menú del sistema" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {itemsVisibles.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`medix-sidebar-nav-btn${item.activo ? ' is-active' : ''}`}
              onClick={() => {
                navigate(item.ruta)
                if (isMobile && onCloseMobile) onCloseMobile()
              }}
            >
              <span>{item.nombre}</span>
              {item.contador !== undefined && item.contador > 0 && (
                <span style={{ backgroundColor: '#B42318', color: '#FFFFFF', fontSize: '12px', fontWeight: 600, padding: '1px 7px', borderRadius: '8px' }}>
                  {item.contador}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div style={{ padding: '14px 16px 18px 16px', borderTop: '1px solid var(--sidebar-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="medix-avatar" style={{ width: '32px', height: '32px', backgroundColor: 'var(--sidebar-active-bg)' }}>
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
          <button type="button" onClick={toggleTema} className="medix-sidebar-footer-btn">
            Tema: {temaOscuro ? 'Oscuro' : 'Claro'}
          </button>

          {onCambiarPassword && (
            <button type="button" onClick={onCambiarPassword} className="medix-sidebar-footer-btn">
              Cambiar contraseña
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onLogout()
              if (isMobile && onCloseMobile) onCloseMobile()
            }}
            className="medix-sidebar-footer-btn"
            style={{ color: '#FFFFFF', fontWeight: 600 }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  )
}
