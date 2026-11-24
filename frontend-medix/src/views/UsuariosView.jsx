import { useState, useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import * as api from '../api/pacientesService'

export default function UsuariosView({
  usuarios,
  cargandoUsuarios,
  formUsuario,
  setFormUsuario,
  creandoUsuario,
  handleCrearUsuario,
  handleEliminarUsuario,
  cargarUsuarios
}) {
  const { theme, temaOscuro } = useTheme()
  const { authFetch } = useAuth()
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)

  // Estados para Edición de Credenciales de Usuario (Administrador)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [formEdicion, setFormEdicion] = useState({
    username: '',
    password: '',
    nombres_completos: '',
    rol: 'Médico General',
    telefono: '',
    correo: ''
  })
  const [mostrarPasswordEdicion, setMostrarPasswordEdicion] = useState(false)
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)
  const [alertaEdicion, setAlertaEdicion] = useState({ tipo: '', texto: '' })

  const abrirModalEdicion = (u) => {
    setUsuarioEditando(u)
    setFormEdicion({
      username: u.username || '',
      password: '',
      nombres_completos: u.nombres_completos || '',
      rol: u.rol || 'Médico General',
      telefono: u.telefono || '',
      correo: u.correo || ''
    })
    setMostrarPasswordEdicion(false)
    setAlertaEdicion({ tipo: '', texto: '' })
  }

  const handleGuardarEdicionUsuario = async (e) => {
    e.preventDefault()
    if (!usuarioEditando) return
    if (!formEdicion.username.trim()) {
      setAlertaEdicion({ tipo: 'error', texto: 'El nombre de usuario no puede estar vacío.' })
      return
    }
    setGuardandoEdicion(true)
    setAlertaEdicion({ tipo: '', texto: '' })
    try {
      const res = await api.actualizarUsuario(authFetch, usuarioEditando.id, {
        username: formEdicion.username.trim(),
        password: formEdicion.password.trim(),
        nombres_completos: formEdicion.nombres_completos.trim(),
        rol: formEdicion.rol,
        telefono: formEdicion.telefono.trim(),
        correo: formEdicion.correo.trim()
      })
      setAlertaEdicion({ tipo: 'exito', texto: res.mensaje || 'Credenciales actualizadas correctamente.' })
      if (cargarUsuarios) await cargarUsuarios()
      setTimeout(() => {
        setUsuarioEditando(null)
        setAlertaEdicion({ tipo: '', texto: '' })
      }, 700)
    } catch (err) {
      setAlertaEdicion({ tipo: 'error', texto: err.message || 'No se pudieron actualizar las credenciales.' })
    } finally {
      setGuardandoEdicion(false)
    }
  }

  // Filtrado de usuarios por nombre, usuario, rol o teléfono
  const usuariosFiltrados = useMemo(() => {
    if (!filtroBusqueda.trim()) return usuarios
    const q = filtroBusqueda.toLowerCase().trim()
    return usuarios.filter((u) => {
      const matchUsername = (u.username || '').toLowerCase().includes(q)
      const matchNombre = (u.nombres_completos || '').toLowerCase().includes(q)
      const matchRol = (u.rol || '').toLowerCase().includes(q)
      const matchTel = (u.telefono || '').toLowerCase().includes(q)
      const matchCorreo = (u.correo || '').toLowerCase().includes(q)
      return matchUsername || matchNombre || matchRol || matchTel || matchCorreo
    })
  }, [usuarios, filtroBusqueda])

  // Obtener iniciales para el avatar minimalista
  const obtenerIniciales = (u) => {
    if (u.nombres_completos && u.nombres_completos.trim()) {
      const partes = u.nombres_completos.trim().split(' ')
      if (partes.length >= 2) return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
      return partes[0].slice(0, 2).toUpperCase()
    }
    return (u.username || 'US').slice(0, 2).toUpperCase()
  }

  // Estilos de badge minimalistas según rol con soporte tema oscuro/claro
  const obtenerBadgeRol = (rolRaw = '') => {
    const rol = rolRaw.toLowerCase()
    if (rol.includes('admin')) {
      return {
        bg: temaOscuro ? 'rgba(244, 63, 94, 0.15)' : '#fdf2f8',
        text: temaOscuro ? '#fda4af' : '#9d174d',
        border: temaOscuro ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid #fbcfe8'
      }
    }
    if (rol.includes('enferm')) {
      return {
        bg: temaOscuro ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4',
        text: temaOscuro ? '#6ee7b7' : '#166534',
        border: temaOscuro ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0'
      }
    }
    if (rol.includes('medic') || rol.includes('pediat') || rol.includes('cardio') || rol.includes('gineco') || rol.includes('ciruj') || rol.includes('trauma') || rol.includes('neuro')) {
      return {
        bg: temaOscuro ? 'rgba(56, 189, 248, 0.15)' : '#f0f9ff',
        text: temaOscuro ? '#7dd3fc' : '#0369a1',
        border: temaOscuro ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #bae6fd'
      }
    }
    if (rol.includes('recepc') || rol.includes('admis')) {
      return {
        bg: temaOscuro ? 'rgba(245, 158, 11, 0.15)' : '#fefce8',
        text: temaOscuro ? '#fcd34d' : '#854d0e',
        border: temaOscuro ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #fef08a'
      }
    }
    return {
      bg: temaOscuro ? '#1e293b' : '#f8fafc',
      text: temaOscuro ? '#cbd5e1' : '#475569',
      border: `1px solid ${theme.borderInput}`
    }
  }

  return (
    <div style={{ maxWidth: '1160px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. ENCABEZADO MINIMALISTA DE LA VISTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: theme.textMain, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Control de Usuarios y Roles
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: theme.textMuted, fontWeight: '400' }}>
            Registro de nuevo personal hospitalario, asignación de especialidades médicas y gestión de accesos.
          </p>
        </div>

        {/* Resumen numérico minimalista */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: theme.bgCard,
            border: theme.border,
            padding: '6px 14px',
            borderRadius: '20px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            fontSize: '12px',
            fontWeight: '600',
            color: theme.textSecondary
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            <span>{usuarios.length} Usuarios Registrados</span>
          </div>
        </div>
      </div>

      {/* 2. FORMULARIO DE REGISTRO EN LA PARTE SUPERIOR (DISEÑO MINIMALISTA Y LIMPIO) */}
      <div style={{
        backgroundColor: theme.bgCard,
        border: theme.border,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: theme.shadowCard
      }}>
        {/* Cabecera del Formulario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '14px', borderBottom: theme.borderSubtle }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            backgroundColor: theme.bgSubtle,
            border: theme.border,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.textMain
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: theme.textMain }}>
              Registrar Nuevo Personal
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: theme.textMuted }}>
              Ingresa los datos para generar las credenciales de acceso al sistema clínico.
            </p>
          </div>
        </div>

        <form onSubmit={handleCrearUsuario}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px 20px', marginBottom: '20px' }}>
            
            {/* Campo 1: Nombres Completos */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px' }}>
                Nombres Completos
              </label>
              <input
                type="text"
                placeholder="Nombres y apellidos"
                value={formUsuario.nombres_completos || ''}
                onChange={(e) => setFormUsuario({ ...formUsuario, nombres_completos: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderInput}`,
                  fontSize: '13px',
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#38bdf8'
                  e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.15)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.borderInput
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Campo 2: Nombre de Usuario */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px' }}>
                Nombre de Usuario <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Usuario de acceso"
                value={formUsuario.username}
                onChange={(e) => setFormUsuario({ ...formUsuario, username: e.target.value })}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderInput}`,
                  fontSize: '13px',
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#38bdf8'
                  e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.15)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.borderInput
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Campo 3: Rol / Especialidad Médica */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px' }}>
                Rol / Especialidad Médica <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formUsuario.rol}
                onChange={(e) => setFormUsuario({ ...formUsuario, rol: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderInput}`,
                  fontSize: '13px',
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  outline: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#38bdf8'
                  e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.15)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.borderInput
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="Médico General" style={{ backgroundColor: theme.bgCard, color: theme.textMain }}>Médico General</option>
                <option value="Pediatra" style={{ backgroundColor: theme.bgCard, color: theme.textMain }}>Pediatra</option>
                <option value="Cardiólogo" style={{ backgroundColor: theme.bgCard, color: theme.textMain }}>Cardiólogo</option>
                <option value="Ginecólogo" style={{ backgroundColor: theme.bgCard, color: theme.textMain }}>Ginecólogo</option>
                <option value="Cirujano" style={{ backgroundColor: theme.bgCard, color: theme.textMain }}>Cirujano</option>
                <option value="Traumatólogo" style={{ backgroundColor: theme.bgCard, color: theme.textMain }}>Traumatólogo</option>
                <option value="Neurólogo" style={{ backgroundColor: theme.bgCard, color: theme.textMain }}>Neurólogo</option>
                <option value="Enfermera" style={{ backgroundColor: theme.bgCard, color: theme.textMain }}>Enfermera</option>
                <option value="Administrador" style={{ backgroundColor: theme.bgCard, color: theme.textMain }}>Administrador</option>
                <option value="Recepción" style={{ backgroundColor: theme.bgCard, color: theme.textMain }}>Recepción / Admisión</option>
                <option value="Soporte TI" style={{ backgroundColor: theme.bgCard, color: theme.textMain }}>Soporte TI</option>
              </select>
            </div>

            {/* Campo 4: Teléfono (Para SMS de Recuperación) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: theme.textSecondary }}>
                  Teléfono Móvil <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '500' }}>Para SMS de recuperación</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  placeholder="Número de teléfono"
                  value={formUsuario.telefono || ''}
                  onChange={(e) => setFormUsuario({ ...formUsuario, telefono: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.borderInput}`,
                    fontSize: '13px',
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#38bdf8'
                    e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.15)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.borderInput
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Campo 5: Correo Electrónico */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px' }}>
                Correo Institucional
              </label>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={formUsuario.correo || ''}
                onChange={(e) => setFormUsuario({ ...formUsuario, correo: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderInput}`,
                  fontSize: '13px',
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#38bdf8'
                  e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.15)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.borderInput
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Campo 6: Contraseña */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px' }}>
                Contraseña Temporal <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formUsuario.password}
                  onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 36px 10px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.borderInput}`,
                    fontSize: '13px',
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#38bdf8'
                    e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.15)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.borderInput
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.textMuted,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {mostrarPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Pie del Formulario: Botón de Acción Minimalista */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', paddingTop: '14px', borderTop: theme.borderSubtle }}>
            <button
              type="submit"
              disabled={creandoUsuario}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                backgroundColor: creandoUsuario ? (temaOscuro ? '#334155' : '#94a3b8') : theme.primaryBtnBg,
                color: theme.primaryBtnColor,
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: creandoUsuario ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease, transform 0.1s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                if (!creandoUsuario) e.currentTarget.style.backgroundColor = theme.primaryBtnHover
              }}
              onMouseLeave={(e) => {
                if (!creandoUsuario) e.currentTarget.style.backgroundColor = theme.primaryBtnBg
              }}
            >
              {creandoUsuario ? (
                <>
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Crear Usuario</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. TABLA DE USUARIOS EN LA PARTE INFERIOR (DISEÑO MINIMALISTA Y ELEGANTE) */}
      <div style={{
        backgroundColor: theme.bgCard,
        border: theme.border,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: theme.shadowCard
      }}>
        {/* Cabecera de la Tabla: Título, Filtro de Búsqueda y Botón Refrescar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: theme.textMain, margin: 0 }}>
              Usuarios del Sistema
            </h3>
            <span style={{
              fontSize: '11.5px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: theme.bgSubtle,
              border: theme.border,
              color: theme.textSecondary
            }}>
              {usuariosFiltrados.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 320px', justifyContent: 'flex-end' }}>
            {/* Buscador de usuarios minimalista */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
              <input
                type="text"
                placeholder="Buscar por usuario, nombre, rol..."
                value={filtroBusqueda}
                onChange={(e) => setFiltroBusqueda(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderInput}`,
                  fontSize: '12px',
                  backgroundColor: theme.bgInput,
                  outline: 'none',
                  color: theme.textMain,
                  transition: 'border-color 0.15s ease, background-color 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#38bdf8'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.borderInput
                }}
              />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={theme.textMuted}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            {/* Botón de Refrescar */}
            <button
              onClick={cargarUsuarios}
              title="Actualizar lista de usuarios"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                backgroundColor: theme.secondaryBtnBg,
                border: theme.secondaryBtnBorder,
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                color: theme.secondaryBtnColor,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = temaOscuro ? '#334155' : '#f1f5f9'
                e.currentTarget.style.color = theme.textMain
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.secondaryBtnBg
                e.currentTarget.style.color = theme.secondaryBtnColor
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Contenedor de la Tabla */}
        {cargandoUsuarios ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: theme.textMuted, fontSize: '13px' }}>
            <div style={{ display: 'inline-block', width: '20px', height: '20px', border: `2px solid ${theme.borderInput}`, borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginBottom: '8px' }}></div>
            <div>Cargando directorio de usuarios...</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : usuarios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: theme.textMuted, fontSize: '13px', backgroundColor: theme.bgSubtle, borderRadius: '8px' }}>
            No hay usuarios registrados en el sistema.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: theme.tableHeaderBg }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: theme.border, borderTopLeftRadius: '8px' }}>
                    ID
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: theme.border }}>
                    Personal / Usuario
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: theme.border }}>
                    Rol / Especialidad
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: theme.border }}>
                    Teléfono (SMS)
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: theme.border }}>
                    Correo
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '600', color: theme.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: theme.border, borderTopRightRadius: '8px' }}>
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: theme.textMuted, fontSize: '13px' }}>
                      No se encontraron usuarios coincidentes con "{filtroBusqueda}".
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u, idx) => {
                    const esAdmin = u.username.toLowerCase() === 'admin'
                    const badge = obtenerBadgeRol(u.rol)
                    const iniciales = obtenerIniciales(u)

                    return (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: idx === usuariosFiltrados.length - 1 ? 'none' : theme.borderSubtle,
                          transition: 'background-color 0.12s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.tableRowHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* ID */}
                        <td style={{ padding: '12px 14px', color: theme.textMuted, fontSize: '12px', fontWeight: '500', fontFamily: 'monospace' }}>
                          #{u.id}
                        </td>

                        {/* Personal / Usuario con Avatar Minimalista */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: esAdmin ? (temaOscuro ? '#38bdf8' : '#0f172a') : (temaOscuro ? '#1e293b' : '#e2e8f0'),
                              color: esAdmin ? (temaOscuro ? '#080c14' : '#ffffff') : theme.textSecondary,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: '700',
                              flexShrink: 0
                            }}>
                              {iniciales}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: theme.textMain, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{u.username}</span>
                                {esAdmin && (
                                  <span style={{ fontSize: '10px', color: temaOscuro ? '#38bdf8' : '#0284c7', backgroundColor: temaOscuro ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                                    Principal
                                  </span>
                                )}
                              </div>
                              {u.nombres_completos ? (
                                <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '1px' }}>
                                  {u.nombres_completos}
                                </div>
                              ) : (
                                <div style={{ fontSize: '11px', color: theme.textMuted, fontStyle: 'italic', marginTop: '1px' }}>
                                  Sin nombre completo
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Rol / Especialidad con Badge Minimalista */}
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: '600',
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: badge.border
                          }}>
                            {u.rol || 'Médico General'}
                          </span>
                        </td>

                        {/* Teléfono SMS */}
                        <td style={{ padding: '12px 14px' }}>
                          {u.telefono ? (
                            <span style={{ fontSize: '12.5px', color: theme.textSecondary, fontWeight: '500' }}>
                              {u.telefono}
                            </span>
                          ) : (
                            <span style={{ fontSize: '12px', color: theme.textMuted, fontStyle: 'italic' }}>
                              —
                            </span>
                          )}
                        </td>

                        {/* Correo Electrónico */}
                        <td style={{ padding: '12px 14px' }}>
                          {u.correo ? (
                            <span style={{ fontSize: '12px', color: theme.textMuted }}>
                              {u.correo}
                            </span>
                          ) : (
                            <span style={{ fontSize: '12px', color: theme.textMuted, fontStyle: 'italic' }}>
                              —
                            </span>
                          )}
                        </td>

                        {/* Acción */}
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => abrirModalEdicion(u)}
                              title={`Editar credenciales de ${u.username}`}
                              className="medix-btn medix-btn-secondary medix-btn-sm"
                            >
                              Editar
                            </button>

                            {esAdmin ? (
                              <span style={{
                                fontSize: '11px',
                                color: theme.textMuted,
                                fontWeight: '500',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                backgroundColor: theme.bgSubtle,
                                border: theme.border
                              }}>
                                Protegido
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleEliminarUsuario(u.id, u.username)}
                                title={`Eliminar usuario ${u.username}`}
                                className="medix-btn medix-btn-danger medix-btn-sm"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL PARA EDITAR CREDENCIALES Y DATOS DE USUARIO */}
      {usuarioEditando && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 37, 69, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !guardandoEdicion) setUsuarioEditando(null)
          }}
        >
          <div
            className="medix-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: theme.borderSubtle, paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: theme.textHeading }}>
                  Editar Credenciales de Usuario
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: theme.textSecondary }}>
                  Cuenta seleccionada: <strong>{usuarioEditando.username}</strong> (ID #{usuarioEditando.id})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUsuarioEditando(null)}
                className="medix-btn medix-btn-secondary medix-btn-sm"
              >
                Cerrar
              </button>
            </div>

            {alertaEdicion.texto && (
              <div
                role="alert"
                className={alertaEdicion.tipo === 'error' ? 'medix-badge-alert' : 'medix-badge-status'}
                style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}
              >
                {alertaEdicion.texto}
              </div>
            )}

            <form onSubmit={handleGuardarEdicionUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="edit-username" className="medix-label">Nombre de Usuario *</label>
                  <input
                    id="edit-username"
                    type="text"
                    className="medix-input"
                    value={formEdicion.username}
                    onChange={(e) => setFormEdicion({ ...formEdicion, username: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label htmlFor="edit-password" className="medix-label" style={{ marginBottom: 0 }}>
                      Nueva Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => setMostrarPasswordEdicion(prev => !prev)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      {mostrarPasswordEdicion ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  <input
                    id="edit-password"
                    type={mostrarPasswordEdicion ? 'text' : 'password'}
                    className="medix-input"
                    placeholder="Dejar vacío para no cambiar"
                    value={formEdicion.password}
                    onChange={(e) => setFormEdicion({ ...formEdicion, password: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-nombres" className="medix-label">Nombres Completos</label>
                <input
                  id="edit-nombres"
                  type="text"
                  className="medix-input"
                  value={formEdicion.nombres_completos}
                  onChange={(e) => setFormEdicion({ ...formEdicion, nombres_completos: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="edit-rol" className="medix-label">Rol / Especialidad</label>
                  <select
                    id="edit-rol"
                    className="medix-input"
                    value={formEdicion.rol}
                    onChange={(e) => setFormEdicion({ ...formEdicion, rol: e.target.value })}
                  >
                    <option value="Médico General">Médico General</option>
                    <option value="Pediatra">Pediatra</option>
                    <option value="Cardiólogo">Cardiólogo</option>
                    <option value="Ginecólogo">Ginecólogo</option>
                    <option value="Cirujano">Cirujano</option>
                    <option value="Traumatólogo">Traumatólogo</option>
                    <option value="Neurólogo">Neurólogo</option>
                    <option value="Enfermera">Enfermera</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Recepción">Recepción / Admisión</option>
                    <option value="Soporte TI">Soporte TI</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-telefono" className="medix-label">Teléfono Móvil (SMS)</label>
                  <input
                    id="edit-telefono"
                    type="tel"
                    className="medix-input"
                    value={formEdicion.telefono}
                    onChange={(e) => setFormEdicion({ ...formEdicion, telefono: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-correo" className="medix-label">Correo Institucional</label>
                <input
                  id="edit-correo"
                  type="email"
                  className="medix-input"
                  value={formEdicion.correo}
                  onChange={(e) => setFormEdicion({ ...formEdicion, correo: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: theme.borderSubtle }}>
                <button
                  type="button"
                  onClick={() => setUsuarioEditando(null)}
                  disabled={guardandoEdicion}
                  className="medix-btn medix-btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEdicion}
                  className="medix-btn medix-btn-primary"
                >
                  {guardandoEdicion ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
