import { useState, useMemo } from 'react'

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
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)

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

  // Estilos de badge minimalistas según rol
  const obtenerBadgeRol = (rolRaw = '') => {
    const rol = rolRaw.toLowerCase()
    if (rol.includes('admin')) {
      return {
        bg: '#fdf2f8',
        text: '#9d174d',
        border: '1px solid #fbcfe8'
      }
    }
    if (rol.includes('enferm')) {
      return {
        bg: '#f0fdf4',
        text: '#166534',
        border: '1px solid #bbf7d0'
      }
    }
    if (rol.includes('medic') || rol.includes('pediat') || rol.includes('cardio') || rol.includes('gineco') || rol.includes('ciruj') || rol.includes('trauma') || rol.includes('neuro')) {
      return {
        bg: '#f0f9ff',
        text: '#0369a1',
        border: '1px solid #bae6fd'
      }
    }
    if (rol.includes('recepc') || rol.includes('admis')) {
      return {
        bg: '#fefce8',
        text: '#854d0e',
        border: '1px solid #fef08a'
      }
    }
    return {
      bg: '#f8fafc',
      text: '#475569',
      border: '1px solid #e2e8f0'
    }
  }

  return (
    <div style={{ maxWidth: '1160px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. ENCABEZADO MINIMALISTA DE LA VISTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Control de Usuarios y Roles
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '400' }}>
            Registro de nuevo personal hospitalario, asignación de especialidades médicas y gestión de accesos.
          </p>
        </div>

        {/* Resumen numérico minimalista */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '5px 12px',
            borderRadius: '20px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            fontSize: '12px',
            fontWeight: '600',
            color: '#334155'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            <span>{usuarios.length} Usuarios Registrados</span>
          </div>
        </div>
      </div>

      {/* 2. FORMULARIO DE REGISTRO EN LA PARTE SUPERIOR (DISEÑO MINIMALISTA Y LIMPIO) */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)'
      }}>
        {/* Cabecera del Formulario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a'
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
              Registrar Nuevo Personal
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Ingresa los datos para generar las credenciales de acceso al sistema clínico.
            </p>
          </div>
        </div>

        <form onSubmit={handleCrearUsuario}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px 20px', marginBottom: '20px' }}>
            
            {/* Campo 1: Nombres Completos */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Nombres Completos
              </label>
              <input
                type="text"
                placeholder="Ej: Dr. Roberto Gómez"
                value={formUsuario.nombres_completos || ''}
                onChange={(e) => setFormUsuario({ ...formUsuario, nombres_completos: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Campo 2: Nombre de Usuario */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Nombre de Usuario <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: rgomez"
                value={formUsuario.username}
                onChange={(e) => setFormUsuario({ ...formUsuario, username: e.target.value })}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Campo 3: Rol / Especialidad Médica */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
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
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1'
                  e.target.style.boxShadow = 'none'
                }}
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

            {/* Campo 4: Teléfono (Para SMS de Recuperación) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                  Teléfono Móvil <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '500' }}>Para SMS de recuperación</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  placeholder="Ej: 956123456"
                  value={formUsuario.telefono || ''}
                  onChange={(e) => setFormUsuario({ ...formUsuario, telefono: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px 10px 34px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#64748b' }}>
                  📱
                </span>
              </div>
            </div>

            {/* Campo 5: Correo Electrónico */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Correo Institucional
              </label>
              <input
                type="email"
                placeholder="Ej: usuario@hospitalpisco.gob.pe"
                value={formUsuario.correo || ''}
                onChange={(e) => setFormUsuario({ ...formUsuario, correo: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Campo 6: Contraseña */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
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
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1'
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
                    color: '#64748b',
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', paddingTop: '14px', borderTop: '1px solid #f8fafc' }}>
            <button
              type="submit"
              disabled={creandoUsuario}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 22px',
                backgroundColor: creandoUsuario ? '#94a3b8' : '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: creandoUsuario ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease, transform 0.1s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                if (!creandoUsuario) e.currentTarget.style.backgroundColor = '#1e293b'
              }}
              onMouseLeave={(e) => {
                if (!creandoUsuario) e.currentTarget.style.backgroundColor = '#0f172a'
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
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)'
      }}>
        {/* Cabecera de la Tabla: Título, Filtro de Búsqueda y Botón Refrescar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Usuarios del Sistema
            </h3>
            <span style={{
              fontSize: '11.5px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: '#f1f5f9',
              color: '#475569'
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
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  backgroundColor: '#f8fafc',
                  outline: 'none',
                  color: '#0f172a',
                  transition: 'border-color 0.15s ease, background-color 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.backgroundColor = '#ffffff'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.backgroundColor = '#f8fafc'
                }}
              />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
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
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                color: '#475569',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9'
                e.currentTarget.style.color = '#0f172a'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc'
                e.currentTarget.style.color = '#475569'
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
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '13px' }}>
            <div style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginBottom: '8px' }}></div>
            <div>Cargando directorio de usuarios...</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : usuarios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '13px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            No hay usuarios registrados en el sistema.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderTopLeftRadius: '8px' }}>
                    ID
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>
                    Personal / Usuario
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>
                    Rol / Especialidad
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>
                    Teléfono (SMS)
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>
                    Correo
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '600', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderTopRightRadius: '8px' }}>
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '13px' }}>
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
                          borderBottom: idx === usuariosFiltrados.length - 1 ? 'none' : '1px solid #f1f5f9',
                          transition: 'background-color 0.12s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* ID */}
                        <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '12px', fontWeight: '500', fontFamily: 'monospace' }}>
                          #{u.id}
                        </td>

                        {/* Personal / Usuario con Avatar Minimalista */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: esAdmin ? '#0f172a' : '#e2e8f0',
                              color: esAdmin ? '#ffffff' : '#334155',
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
                              <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{u.username}</span>
                                {esAdmin && (
                                  <span style={{ fontSize: '10px', color: '#0284c7', backgroundColor: '#e0f2fe', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                                    Principal
                                  </span>
                                )}
                              </div>
                              {u.nombres_completos ? (
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
                                  {u.nombres_completos}
                                </div>
                              ) : (
                                <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', marginTop: '1px' }}>
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
                            <span style={{ fontSize: '12.5px', color: '#334155', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ fontSize: '12px' }}>📱</span>
                              <span>{u.telefono}</span>
                            </span>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                              —
                            </span>
                          )}
                        </td>

                        {/* Correo Electrónico */}
                        <td style={{ padding: '12px 14px' }}>
                          {u.correo ? (
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              {u.correo}
                            </span>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                              —
                            </span>
                          )}
                        </td>

                        {/* Acción */}
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          {esAdmin ? (
                            <span style={{
                              fontSize: '11px',
                              color: '#94a3b8',
                              fontWeight: '500',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0'
                            }}>
                              Protegido
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEliminarUsuario(u.id, u.username)}
                              title={`Eliminar usuario ${u.username}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                backgroundColor: 'transparent',
                                color: '#e11d48',
                                border: '1px solid #fecdd3',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffe4e6'
                                e.currentTarget.style.borderColor = '#fda4af'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                                e.currentTarget.style.borderColor = '#fecdd3'
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              <span>Eliminar</span>
                            </button>
                          )}
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

    </div>
  )
}
