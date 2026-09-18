import { useState, useEffect } from 'react'
import { API_BASE } from '../api/config'

export default function NotasMedicasModal({ paciente, usuario, onClose, onNotaAgregada }) {
  const [notas, setNotas] = useState(paciente?.notas_medicas || [])
  const [cargandoNotas, setCargandoNotas] = useState(false)
  const [nuevaNota, setNuevaNota] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorLocal, setErrorLocal] = useState('')

  useEffect(() => {
    if (paciente?.id) {
      cargarNotas()
    }
  }, [paciente?.id])

  const cargarNotas = async () => {
    setCargandoNotas(true)
    try {
      const res = await fetch(`${API_BASE}/pacientes/${paciente.id}/notas`)
      if (res.ok) {
        const data = await res.json()
        setNotas(data)
      }
    } catch (err) {
      console.error('Error cargando notas:', err)
    } finally {
      setCargandoNotas(false)
    }
  }

  const handleGuardarNota = async (e) => {
    e.preventDefault()
    if (!nuevaNota.trim()) {
      setErrorLocal('La nota médica no puede estar vacía.')
      return
    }
    setErrorLocal('')
    setGuardando(true)

    try {
      const nombreMedico = usuario ? `Dr. ${usuario.username}` : 'Médico Tratante'
      const res = await fetch(`${API_BASE}/pacientes/${paciente.id}/notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenido: nuevaNota.trim(),
          medico_nombre: nombreMedico
        })
      })
      const data = await res.json()
      if (res.ok) {
        setNuevaNota('')
        await cargarNotas()
        if (onNotaAgregada) onNotaAgregada()
      } else {
        setErrorLocal(data.mensaje || 'Error al guardar la nota.')
      }
    } catch (err) {
      setErrorLocal('Error de conexión al guardar la nota.')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminarNota = async (notaId) => {
    if (!window.confirm('¿Desea eliminar esta nota médica?')) return
    try {
      const res = await fetch(`${API_BASE}/notas/${notaId}`, { method: 'DELETE' })
      if (res.ok) {
        await cargarNotas()
        if (onNotaAgregada) onNotaAgregada()
      }
    } catch (err) {
      console.error('Error eliminando nota:', err)
    }
  }

  if (!paciente) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid #7FD6FF',
          boxShadow: '0 10px 30px rgba(43, 74, 102, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Cabecera del Modal */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#7FD6FF',
            borderBottom: '1.5px solid #54bde8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#2B4A66',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#2B4A66' }}>
                Notas Clínicas y Evolución Médica
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#104060', fontWeight: '600' }}>
                Paciente DNI: <span style={{ backgroundColor: '#ffffff', padding: '1px 6px', borderRadius: '4px', border: '1px solid #54bde8' }}>{paciente.dni}</span> · Expediente #{paciente.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #54bde8',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#2B4A66',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>

        {/* Cuerpo del Modal con scroll */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Formulario de Redacción de Nota */}
          <form onSubmit={handleGuardarNota} style={{ backgroundColor: '#FFF6FB', padding: '16px', borderRadius: '8px', border: '1.5px solid #e2c5d5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#2B4A66', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Nueva Nota / Diagnóstico de Evolución
              </label>
              <span style={{ fontSize: '11px', color: '#104060', fontWeight: '600' }}>
                Firmante: Dr. {usuario?.username || 'Médico'}
              </span>
            </div>

            <textarea
              rows={4}
              placeholder="Escriba la evolución clínica, indicaciones, diagnóstico o notas de la consulta..."
              value={nuevaNota}
              onChange={(e) => setNuevaNota(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
                backgroundColor: '#ffffff'
              }}
              onFocus={(e) => e.target.style.borderColor = '#7FD6FF'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />

            {errorLocal && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#802048', fontWeight: '600' }}>
                {errorLocal}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={guardando}
                style={{
                  padding: '8px 18px',
                  backgroundColor: guardando ? '#c4eeff' : '#7FD6FF',
                  color: '#104060',
                  border: '1.5px solid #54bde8',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: guardando ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 4px rgba(127, 214, 255, 0.4)'
                }}
              >
                {guardando ? 'Guardando...' : 'Agregar Nota a la Historia'}
              </button>
            </div>
          </form>

          {/* Historial de Notas Anteriores */}
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '800', color: '#2B4A66', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Historial de Notas Registradas ({notas.length})
            </h4>

            {cargandoNotas ? (
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', padding: '16px' }}>
                Cargando notas médicas...
              </p>
            ) : notas.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FFF6FB', borderRadius: '8px', border: '1px dashed #e2c5d5' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Aún no se han registrado notas clínicas para este paciente.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notas.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '14px 16px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#104060', backgroundColor: '#7FD6FF', padding: '2px 8px', borderRadius: '4px' }}>
                          {n.medico_nombre}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {n.fecha || 'Fecha no disponible'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleEliminarNota(n.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          fontSize: '11px',
                          cursor: 'pointer',
                          padding: '2px 6px'
                        }}
                        title="Eliminar nota"
                      >
                        Eliminar
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                      {n.contenido}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
