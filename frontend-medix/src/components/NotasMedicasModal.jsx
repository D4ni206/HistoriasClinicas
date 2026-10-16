import { useState, useEffect } from 'react'
import { API_BASE } from '../api/config'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { useTheme } from '../context/ThemeContext'

export default function NotasMedicasModal({ paciente, usuario, onClose, onNotaAgregada, notificar }) {
  const { theme, temaOscuro } = useTheme()
  const [notas, setNotas] = useState(paciente?.notas_medicas || [])
  const [cargandoNotas, setCargandoNotas] = useState(false)
  const [nuevaNota, setNuevaNota] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorLocal, setErrorLocal] = useState('')
  const [notaParaEliminar, setNotaParaEliminar] = useState(null)

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
      const textoGuardado = nuevaNota.trim()
      const nombreMedico = usuario ? `Dr. ${usuario.username}` : 'Médico Tratante'
      const res = await fetch(`${API_BASE}/pacientes/${paciente.id}/notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenido: textoGuardado,
          medico_nombre: nombreMedico
        })
      })
      const data = await res.json()
      if (res.ok) {
        setNuevaNota('')
        await cargarNotas()
        if (onNotaAgregada) onNotaAgregada()

        // Notificar con alerta según corresponda
        if (notificar) {
          const esAlergia = /alerg|penicilina|latex|intoleran|sensib|reacci[oó]n|asma|anafilax|cuidado especial/.test(textoGuardado.toLowerCase())
          if (esAlergia) {
            notificar({
              tipo: 'alergia',
              titulo: 'Alergias / Advertencia',
              texto: `Nota registrada con alerta de alergias / advertencia para el paciente DNI ${paciente.dni}.`,
              contador: '2',
              actionLabel: 'Got it'
            })
          } else {
            notificar({
              tipo: 'exito',
              titulo: '¡Nota Guardada!',
              texto: `Evolución clínica registrada para el paciente DNI ${paciente.dni}.`,
              contador: '1',
              actionLabel: 'Okay'
            })
          }
        }
      } else {
        setErrorLocal(data.mensaje || 'Error al guardar la nota.')
      }
    } catch (err) {
      setErrorLocal('Error de conexión al guardar la nota.')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminarNota = (notaId) => {
    setNotaParaEliminar(notaId)
  }

  const ejecutarEliminarNota = async () => {
    if (!notaParaEliminar) return
    const id = notaParaEliminar
    setNotaParaEliminar(null)
    try {
      const res = await fetch(`${API_BASE}/notas/${id}`, { method: 'DELETE' })
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
        backgroundColor: 'rgba(8, 12, 20, 0.72)',
        backdropFilter: 'blur(4px)',
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
          backgroundColor: theme.bgCard,
          borderRadius: '16px',
          border: theme.border,
          boxShadow: theme.shadowCard,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Cabecera del Modal */}
        <div
          style={{
            padding: '16px 22px',
            backgroundColor: theme.bgSubtle,
            borderBottom: theme.borderSubtle,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: temaOscuro ? '#38bdf8' : '#0f172a',
                color: temaOscuro ? '#080c14' : '#ffffff',
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
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: theme.textMain }}>
                Notas Clínicas y Evolución Médica
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: theme.textMuted }}>
                Paciente DNI: <span style={{ backgroundColor: theme.bgCard, color: theme.textMain, padding: '1px 6px', borderRadius: '4px', border: theme.border, fontWeight: '700' }}>{paciente.dni}</span> · Expediente #{paciente.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: theme.secondaryBtnBg,
              border: theme.secondaryBtnBorder,
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              color: theme.secondaryBtnColor,
              cursor: 'pointer',
              transition: 'all 0.12s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = temaOscuro ? '#334155' : '#f8fafc'
              e.currentTarget.style.color = theme.textMain
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.secondaryBtnBg
              e.currentTarget.style.color = theme.secondaryBtnColor
            }}
          >
            Cerrar
          </button>
        </div>

        {/* Cuerpo del Modal con scroll */}
        <div style={{ padding: '22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Formulario de Redacción de Nota */}
          <form onSubmit={handleGuardarNota} style={{ backgroundColor: theme.bgSubtle, padding: '16px', borderRadius: '12px', border: theme.border }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: '700', color: theme.textMain, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Nueva Nota / Diagnóstico de Evolución
              </label>
              <span style={{ fontSize: '11px', color: theme.textMuted, fontWeight: '600' }}>
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
                borderRadius: '8px',
                border: `1px solid ${theme.borderInput}`,
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
                backgroundColor: theme.bgInput,
                color: theme.textMain
              }}
              onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
              onBlur={(e) => e.target.style.borderColor = theme.borderInput}
            />

            {errorLocal && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#f43f5e', fontWeight: '600' }}>
                {errorLocal}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={guardando}
                style={{
                  padding: '9px 18px',
                  backgroundColor: guardando ? (temaOscuro ? '#334155' : '#94a3b8') : theme.primaryBtnBg,
                  color: theme.primaryBtnColor,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: guardando ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!guardando) e.currentTarget.style.backgroundColor = theme.primaryBtnHover
                }}
                onMouseLeave={(e) => {
                  if (!guardando) e.currentTarget.style.backgroundColor = theme.primaryBtnBg
                }}
              >
                {guardando ? 'Guardando...' : 'Agregar Nota a la Historia'}
              </button>
            </div>
          </form>

          {/* Historial de Notas Anteriores */}
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '12.5px', fontWeight: '800', color: theme.textMain, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Historial de Notas Registradas ({notas.length})
            </h4>

            {cargandoNotas ? (
              <p style={{ textAlign: 'center', color: theme.textMuted, fontSize: '12px', padding: '16px' }}>
                Cargando notas médicas...
              </p>
            ) : notas.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', backgroundColor: theme.bgSubtle, borderRadius: '12px', border: `1px dashed ${theme.borderInput}` }}>
                <p style={{ margin: 0, fontSize: '13px', color: theme.textMuted }}>
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
                      backgroundColor: theme.bgCard,
                      border: theme.border,
                      borderRadius: '10px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: theme.borderSubtle, paddingBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '11.5px',
                          fontWeight: '700',
                          color: temaOscuro ? '#7dd3fc' : '#0369a1',
                          backgroundColor: temaOscuro ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: temaOscuro ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid #bae6fd'
                        }}>
                          {n.medico_nombre}
                        </span>
                        <span style={{ fontSize: '11px', color: theme.textMuted }}>
                          {n.fecha || 'Fecha no disponible'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleEliminarNota(n.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: temaOscuro ? '#fda4af' : '#e11d48',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          padding: '2px 6px'
                        }}
                        title="Eliminar nota"
                      >
                        Eliminar
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: theme.textSecondary, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                      {n.contenido}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {notaParaEliminar && (
        <ConfirmDeleteModal
          paciente={{ dni: `Nota Clínica #${notaParaEliminar}` }}
          titulo="Advertencia"
          pregunta="¿Desea eliminar esta nota médica del historial del paciente?"
          onConfirmar={ejecutarEliminarNota}
          onCancelar={() => setNotaParaEliminar(null)}
        />
      )}
    </div>
  )
}

