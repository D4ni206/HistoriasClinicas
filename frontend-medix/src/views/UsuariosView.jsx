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
    <div style={{ maxWidth: '1080px', width: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#2B4A66', margin: '0 0 6px 0' }}>
          Crear y Gestionar Usuarios
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
          Control de acceso para el personal hospitalario, asignación de roles y registro de teléfono para recuperación de contraseña por SMS.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(330px, 390px) 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Formulario Crear Usuario */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '2px solid #7FD6FF',
          borderRadius: '16px',
          padding: '22px',
          boxShadow: '0 4px 16px rgba(127, 214, 255, 0.25)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#2B4A66', margin: '0 0 16px 0', borderBottom: '1.5px solid #7FD6FF', paddingBottom: '8px' }}>
            Registrar Nuevo Usuario
          </h3>

          <form onSubmit={handleCrearUsuario}>
            {/* Nombres Completos */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#2B4A66', marginBottom: '4px' }}>
                NOMBRES COMPLETOS
              </label>
              <input
                type="text"
                placeholder="Ej: Dr. Roberto Gómez"
                value={formUsuario.nombres_completos || ''}
                onChange={(e) => setFormUsuario({ ...formUsuario, nombres_completos: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13px',
                  backgroundColor: '#FFF6FB',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#7FD6FF'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Nombre de Usuario */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#2B4A66', marginBottom: '4px' }}>
                NOMBRE DE USUARIO *
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
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13px',
                  backgroundColor: '#FFF6FB',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#7FD6FF'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Número de Teléfono (Para SMS) */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#0369a1', marginBottom: '4px' }}>
                NÚMERO DE TELÉFONO (Para SMS de Recuperación) *
              </label>
              <input
                type="tel"
                placeholder="Ej: 956123456"
                value={formUsuario.telefono || ''}
                onChange={(e) => setFormUsuario({ ...formUsuario, telefono: e.target.value })}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #7FD6FF',
                  fontSize: '13px',
                  backgroundColor: '#f0f9ff',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0284c7'}
                onBlur={(e) => e.target.style.borderColor = '#7FD6FF'}
              />
              <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                Se usará para enviar el código SMS si olvida su clave.
              </span>
            </div>

            {/* Correo Electrónico */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#2B4A66', marginBottom: '4px' }}>
                CORREO ELECTRÓNICO
              </label>
              <input
                type="email"
                placeholder="Ej: rgomez@hospitalpisco.gob.pe"
                value={formUsuario.correo || ''}
                onChange={(e) => setFormUsuario({ ...formUsuario, correo: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13px',
                  backgroundColor: '#FFF6FB',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#7FD6FF'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#2B4A66', marginBottom: '4px' }}>
                CONTRASEÑA *
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
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13px',
                  backgroundColor: '#FFF6FB',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#7FD6FF'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Rol Institucional / Especialidad */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#2B4A66', marginBottom: '4px' }}>
                ROL / ESPECIALIDAD MÉDICA
              </label>
              <select
                value={formUsuario.rol}
                onChange={(e) => setFormUsuario({ ...formUsuario, rol: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  fontWeight: '600'
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

            <button
              type="submit"
              disabled={creandoUsuario}
              style={{
                width: '100%',
                padding: '11px',
                backgroundColor: creandoUsuario ? '#c4eeff' : '#7FD6FF',
                color: '#104060',
                border: '1.5px solid #54bde8',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: creandoUsuario ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 5px rgba(127, 214, 255, 0.4)'
              }}
            >
              {creandoUsuario ? 'Guardando Usuario...' : 'Crear Usuario'}
            </button>
          </form>
        </div>

        {/* Tabla de Usuarios Registrados */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '16px',
          padding: '22px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#2B4A66', margin: 0 }}>
              Usuarios del Sistema ({usuarios.length})
            </h3>
            <button
              onClick={cargarUsuarios}
              style={{
                padding: '5px 12px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
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
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Usuario / Nombre</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Rol / Especialidad</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Teléfono (SMS)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => {
                    const esAdmin = u.username.toLowerCase() === 'admin'
                    const rolNorm = (u.rol || '').toLowerCase()

                    let rolBg = '#FFF6FB'
                    let rolColor = '#2B4A66'
                    let rolBorder = '#e2c5d5'
                    if (rolNorm.includes('admin')) {
                      rolBg = '#FFD6E8'
                      rolColor = '#802048'
                      rolBorder = '#f4a7c7'
                    } else if (rolNorm.includes('medic') || rolNorm.includes('pediat') || rolNorm.includes('cardio') || rolNorm.includes('ciruj') || rolNorm.includes('trauma')) {
                      rolBg = '#7FD6FF'
                      rolColor = '#104060'
                      rolBorder = '#54bde8'
                    } else if (rolNorm.includes('enferm')) {
                      rolBg = '#6FE3B4'
                      rolColor = '#0a5438'
                      rolBorder = '#4cc799'
                    }

                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', color: '#64748b' }}>#{u.id}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{ fontWeight: '700', color: '#2B4A66', display: 'block' }}>
                            {u.username}
                            {esAdmin && (
                              <span style={{ marginLeft: '6px', fontSize: '10px', color: '#64748b' }}>(Principal)</span>
                            )}
                          </span>
                          {u.nombres_completos && (
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {u.nombres_completos}
                            </span>
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
                        <td style={{ padding: '8px 10px' }}>
                          {u.telefono ? (
                            <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>
                              📱 {u.telefono}
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                              Sin registrar
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          {esAdmin ? (
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Protegido</span>
                          ) : (
                            <button
                              onClick={() => handleEliminarUsuario(u.id, u.username)}
                              style={{
                                padding: '4px 9px',
                                backgroundColor: '#FFD6E8',
                                color: '#802048',
                                border: '1px solid #f4a7c7',
                                borderRadius: '5px',
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
