import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { API_BASE } from '../api/config'

export default function SignosVitalesView({ pacientes, usuario, notificar, cargarDatos }) {
  const { temaOscuro, theme } = useTheme()
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [busquedaDni, setBusquedaDni] = useState('')
  const [historialSignos, setHistorialSignos] = useState([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [guardando, setGuardando] = useState(false)

  // Formulario de Signos Vitales
  const [formData, setFormData] = useState({
    presion_arterial: '',
    peso: '',
    talla: '',
    temperatura: '',
    frecuencia_cardiaca: '',
    saturacion_oxigeno: '',
    observaciones: ''
  })

  // Preseleccionar el primer paciente si hay pacientes y ninguno seleccionado
  useEffect(() => {
    if (!pacienteSeleccionado && pacientes.length > 0) {
      seleccionarPaciente(pacientes[0])
    }
  }, [pacientes])

  const seleccionarPaciente = async (p) => {
    setPacienteSeleccionado(p)
    setCargandoHistorial(true)
    try {
      const res = await fetch(`${API_BASE}/pacientes/${p.id}/signos-vitales`)
      if (res.ok) {
        const data = await res.json()
        setHistorialSignos(data)
        const tieneAlergiaHistorial = data.some(s => /alerg|penicilina|latex|intoleran|sensib|reacci[oó]n|asma|anafilax/.test((s.observaciones || '').toLowerCase()))
        if (tieneAlergiaHistorial) {
          notificar({
            tipo: 'alergia',
            titulo: 'Alergias / Advertencia',
            texto: `Precaución: El paciente DNI ${p.dni} tiene antecedentes alérgicos reportados en triaje.`,
            contador: '2',
            actionLabel: 'Got it'
          })
        }
      }
    } catch (err) {
      console.error('Error al cargar signos vitales:', err)
    } finally {
      setCargandoHistorial(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pacienteSeleccionado) {
      notificar('error', 'Seleccione un paciente registrado para agregar sus signos vitales.')
      return
    }

    const tieneDatos = Object.values(formData).some(val => val && val.trim() !== '')
    if (!tieneDatos) {
      notificar('error', 'Por favor complete al menos un campo de signos vitales (presión, peso, etc.).')
      return
    }

    setGuardando(true)
    try {
      const payload = {
        ...formData,
        enfermera_nombre: usuario?.username ? `Enf. ${usuario.username}` : 'Personal de Enfermería'
      }

      const res = await fetch(`${API_BASE}/pacientes/${pacienteSeleccionado.id}/signos-vitales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (res.ok) {
        const obs = (formData.observaciones || '').toLowerCase()
        const esAlergia = /alerg|penicilina|latex|intoleran|sensib|reacci[oó]n|asma|anafilax/.test(obs)

        if (esAlergia) {
          notificar({
            tipo: 'alergia',
            titulo: 'Alergias / Advertencia',
            texto: `Signos vitales guardados con alerta: el paciente DNI ${pacienteSeleccionado.dni} presenta alergias o condición sensible.`,
            contador: '2',
            actionLabel: 'Got it'
          })
        } else {
          notificar({
            tipo: 'exito',
            titulo: '¡Signos Registrados!',
            texto: `Signos vitales registrados para el paciente DNI ${pacienteSeleccionado.dni}.`,
            contador: '1',
            actionLabel: 'Okay'
          })
        }
        setFormData({
          presion_arterial: '',
          peso: '',
          talla: '',
          temperatura: '',
          frecuencia_cardiaca: '',
          saturacion_oxigeno: '',
          observaciones: ''
        })
        // Recargar historial del paciente
        seleccionarPaciente(pacienteSeleccionado)
        if (cargarDatos) cargarDatos()
      } else {
        notificar('error', data.mensaje || 'Error al guardar signos vitales.')
      }
    } catch (err) {
      notificar('error', 'Error de conexión con el servidor al registrar signos vitales.')
    } finally {
      setGuardando(false)
    }
  }

  const pacientesFiltrados = pacientes.filter(p =>
    p.dni.toLowerCase().includes(busquedaDni.trim().toLowerCase())
  )

  return (
    <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
      {/* Cabecera */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.textMain, margin: 0, letterSpacing: '-0.3px' }}>
            Triaje y Signos Vitales
          </h2>
          <span style={{
            backgroundColor: temaOscuro ? '#082f49' : '#f0f9ff',
            color: temaOscuro ? '#7dd3fc' : '#0369a1',
            border: `1px solid ${temaOscuro ? '#0284c7' : '#bae6fd'}`,
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '700'
          }}>
            Rol Enfermería
          </span>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: theme.textMuted }}>
          Toma y registro exclusivo de signos vitales (presión arterial, peso, talla, temperatura) en pacientes registrados.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '22px', alignItems: 'start' }}>
        {/* Panel Izquierdo: Lista de Pacientes Registrados */}
        <div style={{
          backgroundColor: theme.bgCard,
          borderRadius: '12px',
          border: theme.border,
          padding: '16px',
          boxShadow: theme.shadowCard
        }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: theme.textSecondary, textTransform: 'uppercase', marginBottom: '6px' }}>
              Pacientes Registrados ({pacientes.length})
            </label>
            <input
              type="text"
              placeholder="Buscar por DNI..."
              value={busquedaDni}
              onChange={(e) => setBusquedaDni(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${theme.borderInput}`,
                fontSize: '12.5px',
                backgroundColor: theme.bgInput,
                color: theme.textMain,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ maxHeight: 'calc(100vh - 270px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {pacientesFiltrados.length === 0 ? (
              <p style={{ fontSize: '12px', color: theme.textMuted, textAlign: 'center', padding: '16px' }}>
                No se encontraron pacientes.
              </p>
            ) : (
              pacientesFiltrados.map((p) => {
                const esActivo = pacienteSeleccionado && pacienteSeleccionado.id === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => seleccionarPaciente(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: esActivo ? `1.5px solid ${theme.accentCool}` : theme.borderSubtle,
                      backgroundColor: esActivo ? (temaOscuro ? '#1e293b' : '#0f172a') : theme.bgSubtle,
                      color: esActivo ? (temaOscuro ? '#38bdf8' : '#ffffff') : theme.textMain,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '13px' }}>
                        DNI {p.dni}
                      </div>
                      <div style={{ fontSize: '10.5px', color: esActivo ? (temaOscuro ? '#94a3b8' : '#cbd5e1') : theme.textMuted }}>
                        Expediente #{p.id}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: esActivo ? (temaOscuro ? '#0f172a' : '#1e293b') : theme.bgCard,
                      border: theme.border,
                      color: esActivo ? '#ffffff' : theme.textSecondary
                    }}>
                      Seleccionar
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Panel Central/Derecho: Formulario e Historial del Paciente Seleccionado */}
        {pacienteSeleccionado ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Formulario de Entrada */}
            <div style={{
              backgroundColor: theme.bgCard,
              border: theme.border,
              borderRadius: '12px',
              padding: '22px',
              boxShadow: theme.shadowCard
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: theme.border, paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: theme.textMain }}>
                    Registrar Nuevos Signos Vitales
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: theme.textMuted }}>
                    Paciente: <strong style={{ color: theme.textMain }}>DNI {pacienteSeleccionado.dni}</strong> · Expediente #{pacienteSeleccionado.id}
                  </p>
                </div>
                <span style={{
                  fontSize: '11px',
                  color: temaOscuro ? '#7dd3fc' : '#0369a1',
                  fontWeight: '700',
                  backgroundColor: temaOscuro ? '#082f49' : '#f0f9ff',
                  border: `1px solid ${temaOscuro ? '#0284c7' : '#bae6fd'}`,
                  padding: '3px 9px',
                  borderRadius: '6px'
                }}>
                  Responsable: {usuario?.username || 'Enfermera'}
                </span>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
                  {/* Presión Arterial */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: theme.textSecondary, marginBottom: '4px' }}>
                      PRESIÓN ARTERIAL
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 120/80 mmHg"
                      value={formData.presion_arterial}
                      onChange={(e) => setFormData({ ...formData, presion_arterial: e.target.value })}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.borderInput}`,
                        fontSize: '13px',
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Peso */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: theme.textSecondary, marginBottom: '4px' }}>
                      PESO
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 70.5 kg"
                      value={formData.peso}
                      onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.borderInput}`,
                        fontSize: '13px',
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Talla */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: theme.textSecondary, marginBottom: '4px' }}>
                      TALLA
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 168 cm"
                      value={formData.talla}
                      onChange={(e) => setFormData({ ...formData, talla: e.target.value })}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.borderInput}`,
                        fontSize: '13px',
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Temperatura */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: theme.textSecondary, marginBottom: '4px' }}>
                      TEMPERATURA
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 36.8 °C"
                      value={formData.temperatura}
                      onChange={(e) => setFormData({ ...formData, temperatura: e.target.value })}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.borderInput}`,
                        fontSize: '13px',
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Frecuencia Cardíaca */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: theme.textSecondary, marginBottom: '4px' }}>
                      FRECUENCIA CARDÍACA
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 72 lpm"
                      value={formData.frecuencia_cardiaca}
                      onChange={(e) => setFormData({ ...formData, frecuencia_cardiaca: e.target.value })}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.borderInput}`,
                        fontSize: '13px',
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Saturación O2 */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: theme.textSecondary, marginBottom: '4px' }}>
                      SATURACIÓN OXÍGENO
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 98 %"
                      value={formData.saturacion_oxigeno}
                      onChange={(e) => setFormData({ ...formData, saturacion_oxigeno: e.target.value })}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.borderInput}`,
                        fontSize: '13px',
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Observaciones */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: theme.textSecondary, marginBottom: '4px' }}>
                    OBSERVACIONES ADICIONALES DE ENFERMERÍA
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detalles sobre el estado del paciente al momento de la toma..."
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.borderInput}`,
                      fontSize: '13px',
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={guardando}
                    style={{
                      padding: '10px 22px',
                      backgroundColor: theme.primaryBtnBg,
                      color: theme.primaryBtnColor,
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: guardando ? 'not-allowed' : 'pointer',
                      boxShadow: theme.shadowCard,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {guardando ? 'Guardando...' : 'Guardar Signos Vitales'}
                  </button>
                </div>
              </form>
            </div>

            {/* Historial de Signos Vitales del Paciente */}
            <div style={{
              backgroundColor: theme.bgCard,
              border: theme.border,
              borderRadius: '12px',
              padding: '20px',
              boxShadow: theme.shadowCard
            }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '800', color: theme.textMain }}>
                Historial de Tomas de Signos Vitales ({historialSignos.length})
              </h4>

              {cargandoHistorial ? (
                <p style={{ textAlign: 'center', color: theme.textMuted, fontSize: '13px', padding: '16px' }}>
                  Cargando signos vitales...
                </p>
              ) : historialSignos.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', backgroundColor: theme.bgSubtle, borderRadius: '8px', border: `1px dashed ${temaOscuro ? '#1e293b' : '#cbd5e1'}` }}>
                  <p style={{ margin: 0, fontSize: '13px', color: theme.textMuted }}>
                    No hay registros de signos vitales para este paciente todavía.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: theme.tableHeaderBg, borderBottom: theme.border, color: theme.textSecondary }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '700' }}>Fecha y Hora</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '700' }}>Presión</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '700' }}>Peso</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '700' }}>Talla</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '700' }}>Temp.</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '700' }}>FC</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '700' }}>Sat O2</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '700' }}>Responsable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historialSignos.map((s) => (
                        <tr key={s.id} style={{ borderBottom: theme.borderSubtle }}>
                          <td style={{ padding: '10px 12px', color: theme.textMuted, whiteSpace: 'nowrap' }}>{s.fecha}</td>
                          <td style={{ padding: '10px 12px', fontWeight: '700', color: theme.textMain }}>{s.presion_arterial || '—'}</td>
                          <td style={{ padding: '10px 12px', fontWeight: '600', color: theme.textMain }}>{s.peso || '—'}</td>
                          <td style={{ padding: '10px 12px', color: theme.textMain }}>{s.talla || '—'}</td>
                          <td style={{ padding: '10px 12px', color: theme.textMain }}>{s.temperatura || '—'}</td>
                          <td style={{ padding: '10px 12px', color: theme.textMain }}>{s.frecuencia_cardiaca || '—'}</td>
                          <td style={{ padding: '10px 12px', color: theme.textMain }}>{s.saturacion_oxigeno || '—'}</td>
                          <td style={{ padding: '10px 12px', color: theme.accentCool, fontWeight: '600' }}>{s.enfermera_nombre}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: theme.bgCard,
            border: theme.border,
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            color: theme.textMuted
          }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
              Seleccione un paciente de la lista para registrar o consultar sus signos vitales.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
