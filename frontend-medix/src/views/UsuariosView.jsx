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
  return (
    <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f2942', margin: '0 0 6px 0' }}>
          Crear y Gestionar Usuarios
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
          Control de acceso para el personal hospitalario y asignación de roles de seguridad.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Formulario Crear Usuario */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '2px solid #F6E38F',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 4px 14px rgba(246, 227, 143, 0.25)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#634706', margin: '0 0 16px 0', borderBottom: '1px solid #F6E38F', paddingBottom: '8px' }}>
            Registrar Nuevo Usuario
          </h3>

          <form onSubmit={handleCrearUsuario}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                NOMBRE DE USUARIO
              </label>
              <input
                type="text"
                placeholder="Ej: jperalta"
                value={formUsuario.username}
                onChange={(e) => setFormUsuario({ ...formUsuario, username: e.target.value })}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13px',
                  backgroundColor: '#f8fafc',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#F6E38F'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                CONTRASEÑA
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formUsuario.password}
                onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13px',
                  backgroundColor: '#f8fafc',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#F6E38F'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                ROL INSTITUCIONAL
              </label>
              <select
                value={formUsuario.rol}
                onChange={(e) => setFormUsuario({ ...formUsuario, rol: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  fontWeight: '600'
                }}
              >
                <option value="Médico">Médico</option>
                <option value="Recepción">Recepción</option>
                <option value="Administrador">Administrador</option>
                <option value="Soporte TI">Soporte TI</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={creandoUsuario}
              style={{
                width: '100%',
                padding: '11px',
                backgroundColor: creandoUsuario ? '#fef08a' : '#FFF2B6',
                color: '#634706',
                border: '1.5px solid #F6E38F',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: creandoUsuario ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 5px rgba(246, 227, 143, 0.4)'
              }}
            >
              {creandoUsuario ? 'Guardando...' : 'Crear Usuario'}
            </button>
          </form>
        </div>

        {/* Tabla de Usuarios Registrados */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '12px',
          padding: '22px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f2942', margin: 0 }}>
              Usuarios del Sistema ({usuarios.length})
            </h3>
            <button
              onClick={cargarUsuarios}
              style={{
                padding: '4px 10px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                color: '#475569'
              }}
            >
              Actualizar Lista
            </button>
          </div>

          {cargandoUsuarios ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>Cargando usuarios...</p>
          ) : usuarios.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No hay usuarios registrados.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>ID</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Usuario</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Rol</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => {
                    const esAdmin = u.username.toLowerCase() === 'admin'
                    let rolBg = '#CFE7D6'
                    let rolColor = '#134e2b'
                    let rolBorder = '#9ec6ac'
                    if (u.rol === 'Administrador') {
                      rolBg = '#F3C7B6'
                      rolColor = '#70220e'
                      rolBorder = '#e19d85'
                    } else if (u.rol === 'Médico') {
                      rolBg = '#A7C7D9'
                      rolColor = '#0c354e'
                      rolBorder = '#84aabd'
                    } else if (u.rol === 'Soporte TI') {
                      rolBg = '#FFF2B6'
                      rolColor = '#634706'
                      rolBorder = '#F6E38F'
                    }

                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', color: '#64748b' }}>#{u.id}</td>
                        <td style={{ padding: '8px 10px', fontWeight: '700', color: '#0f2942' }}>
                          {u.username}
                          {esAdmin && (
                            <span style={{ marginLeft: '6px', fontSize: '10px', color: '#64748b' }}>(Principal)</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: rolBg,
                            color: rolColor,
                            border: `1px solid ${rolBorder}`
                          }}>
                            {u.rol || 'Personal'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          {esAdmin ? (
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Protegido</span>
                          ) : (
                            <button
                              onClick={() => handleEliminarUsuario(u.id, u.username)}
                              style={{
                                padding: '3px 8px',
                                backgroundColor: '#F3C7B6',
                                color: '#70220e',
                                border: '1px solid #e19d85',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Eliminar
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
