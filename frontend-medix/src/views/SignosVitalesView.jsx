import { useState, useEffect } from 'react'
import { API_BASE } from '../api/config'

export default function SignosVitalesView({ pacientes, usuario, notificar, cargarDatos }) {
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
        notificar('exito', `Signos vitales registrados para el paciente DNI ${pacienteSeleccionado.dni}.`)
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f2942', margin: 0 }}>
            Triaje y Signos Vitales
          </h2>
          <span style={{
            backgroundColor: '#CFE7D6',
            color: '#134e2b',
            border: '1px solid #9ec6ac',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '700'
          }}>
            Rol Enfermería
          </span>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
          Toma y registro exclusivo de signos vitales (presión arterial, peso, talla, temperatura) en pacientes registrados.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '22px', alignItems: 'start' }}>
        {/* Panel Izquierdo: Lista de Pacientes Registrados */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid #e2e8f0',
          padding: '16px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
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
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1.5px solid #cbd5e1',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ maxHeight: 'calc(100vh - 270px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {pacientesFiltrados.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '16px' }}>
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
                      border: esActivo ? '1.5px solid #9ec6ac' : '1px solid #f1f5f9',
                      backgroundColor: esActivo ? '#CFE7D6' : '#ffffff',
                      color: esActivo ? '#134e2b' : '#1e293b',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '13px' }}>
                        DNI {p.dni}
                      </div>
                      <div style={{ fontSize: '10px', color: esActivo ? '#134e2b' : '#64748b' }}>
                        Expediente #{p.id}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: esActivo ? '#ffffff' : '#f1f5f9',
                      border: '1px solid #cbd5e1'
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
              backgroundColor: '#ffffff',
              border: '2px solid #CFE7D6',
              borderRadius: '12px',
              padding: '22px',
              boxShadow: '0 4px 14px rgba(207, 231, 214, 0.35)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1.5px solid #CFE7D6', paddingBottom: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#134e2b' }}>
                    Registrar Nuevos Signos Vitales
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#475569' }}>
                    Paciente: <strong>DNI {pacienteSeleccionado.dni}</strong> · Expediente #{pacienteSeleccionado.id}
                  </p>
                </div>
                <span style={{ fontSize: '11px', color: '#134e2b', fontWeight: '700', backgroundColor: '#CFE7D6', padding: '3px 8px', borderRadius: '4px' }}>
                  Responsable: {usuario?.username || 'Enfermera'}
                </span>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
                  {/* Presión Arterial */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
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
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1.5px solid #d1d5db',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Peso */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
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
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1.5px solid #d1d5db',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Talla */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
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
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1.5px solid #d1d5db',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Temperatura */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
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
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1.5px solid #d1d5db',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Frecuencia Cardíaca */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
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
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1.5px solid #d1d5db',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Saturación O2 */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
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
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1.5px solid #d1d5db',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Observaciones */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
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
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1.5px solid #d1d5db',
                      fontSize: '13px',
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
                      backgroundColor: guardando ? '#bbf7d0' : '#CFE7D6',
                      color: '#134e2b',
                      border: '1.5px solid #9ec6ac',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: guardando ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 5px rgba(158, 198, 172, 0.4)'
                    }}
                  >
                    {guardando ? 'Guardando...' : 'Guardar Signos Vitales'}
                  </button>
                </div>
              </form>
            </div>

            {/* Historial de Signos Vitales del Paciente */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '800', color: '#0f2942' }}>
                Historial de Tomas de Signos Vitales ({historialSignos.length})
              </h4>

              {cargandoHistorial ? (
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '16px' }}>
                  Cargando signos vitales...
                </p>
              ) : historialSignos.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    No hay registros de signos vitales para este paciente todavía.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Fecha y Hora</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Presión</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Peso</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Talla</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Temp.</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>FC</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Sat O2</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Responsable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historialSignos.map((s) => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 10px', color: '#64748b', whiteSpace: 'nowrap' }}>{s.fecha}</td>
                          <td style={{ padding: '8px 10px', fontWeight: '700', color: '#0f2942' }}>{s.presion_arterial || '—'}</td>
                          <td style={{ padding: '8px 10px', fontWeight: '600' }}>{s.peso || '—'}</td>
                          <td style={{ padding: '8px 10px' }}>{s.talla || '—'}</td>
                          <td style={{ padding: '8px 10px' }}>{s.temperatura || '—'}</td>
                          <td style={{ padding: '8px 10px' }}>{s.frecuencia_cardiaca || '—'}</td>
                          <td style={{ padding: '8px 10px' }}>{s.saturacion_oxigeno || '—'}</td>
                          <td style={{ padding: '8px 10px', color: '#134e2b', fontWeight: '600' }}>{s.enfermera_nombre}</td>
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
            backgroundColor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            color: '#64748b'
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
