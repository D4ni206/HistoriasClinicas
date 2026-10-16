import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { API_BASE } from '../api/config'

const OPCIONES_MOTIVO = [
  'Historia clínica duplicada o redundante en el sistema',
  'Error en el número de DNI o datos filiatorios del paciente',
  'Documentación errónea cargada en expediente ajeno',
  'Paciente derivado o registrado en otra sede hospitalaria',
  'Expediente de prueba o registro médico no válido',
  'Otro motivo particular (especificar a continuación)'
]

export default function SolicitudEliminacionModal({
  paciente,
  usuario,
  onCerrar,
  onSolicitudEnviada
}) {
  const { temaOscuro, theme } = useTheme()
  const [motivoSeleccionado, setMotivoSeleccionado] = useState(OPCIONES_MOTIVO[0])
  const [motivoDetalle, setMotivoDetalle] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!paciente) return null

  const esOtro = motivoSeleccionado.startsWith('Otro motivo')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!motivoDetalle.trim()) {
      setErrorMsg('Es obligatorio especificar el motivo por el cual desea eliminar la historia clínica.')
      return
    }

    setEnviando(true)
    try {
      const payload = {
        paciente_id: paciente.id,
        paciente_dni: paciente.dni,
        usuario_nombre: usuario?.username || 'Personal Médico',
        usuario_rol: usuario?.rol || 'Médico',
        motivo_categoria: motivoSeleccionado,
        motivo_detalle: motivoDetalle.trim()
      }

      const res = await fetch(`${API_BASE}/solicitudes-eliminacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (res.ok) {
        if (onSolicitudEnviada) {
          onSolicitudEnviada(data.mensaje || 'Solicitud enviada exitosamente al Administrador.')
        }
        onCerrar()
      } else {
        setErrorMsg(data.mensaje || 'Error al procesar la solicitud.')
      }
    } catch (err) {
      setErrorMsg('Error de red al conectar con el servidor.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: temaOscuro ? 'rgba(5, 8, 15, 0.78)' : 'rgba(15, 23, 42, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      backdropFilter: 'blur(3px)',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: theme.bgCard,
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: theme.shadowCard,
        border: theme.border,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out',
        color: theme.textMain
      }}>
        {/* Cabecera del Modal */}
        <div style={{
          backgroundColor: theme.bgSubtle,
          padding: '16px 20px',
          borderBottom: theme.border,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: theme.accentCool, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Control de Seguridad y Auditoría Clínica
            </span>
            <h3 style={{ margin: '3px 0 0 0', fontSize: '17px', fontWeight: '800', color: theme.textMain }}>
              Solicitud de Eliminación de Historia
            </h3>
          </div>
          <button
            onClick={onCerrar}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              fontWeight: 'bold',
              color: theme.textMuted,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
            title="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tarjeta Informativa del Expediente a Eliminar */}
          <div style={{
            backgroundColor: theme.bgSubtle,
            border: theme.border,
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12.5px'
          }}>
            <div>
              <span style={{ color: theme.textMuted }}>Paciente DNI: </span>
              <strong style={{
                color: temaOscuro ? '#7dd3fc' : '#0369a1',
                backgroundColor: temaOscuro ? '#082f49' : '#f0f9ff',
                padding: '2px 8px',
                borderRadius: '6px',
                border: `1px solid ${temaOscuro ? '#0284c7' : '#bae6fd'}`
              }}>
                {paciente.dni}
              </strong>
              <div style={{ marginTop: '4px', color: theme.textMuted, fontSize: '11.5px' }}>
                Expediente: <strong>#{paciente.id}</strong> · Documentos: <strong>{paciente.documentos ? paciente.documentos.length : (paciente.total_documentos || 0)}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '11.5px', color: theme.textSecondary }}>
              <div>Solicitado por:</div>
              <strong style={{ color: theme.textMain }}>{usuario?.username || 'Usuario'}</strong>
              <div style={{ fontSize: '10.5px', color: theme.textMuted }}>({usuario?.rol || 'Médico'})</div>
            </div>
          </div>

          {/* Aviso Institucional */}
          <div style={{
            backgroundColor: temaOscuro ? '#1e293b' : '#f1f5f9',
            borderLeft: `4px solid ${theme.accentCool}`,
            padding: '10px 14px',
            borderRadius: '4px',
            fontSize: '12px',
            color: theme.textSecondary,
            lineHeight: '1.4'
          }}>
            <strong>Nota institucional:</strong> La eliminación física de un expediente requiere aprobación formal del Administrador. Por favor, seleccione o detalle el motivo correspondiente.
          </div>

          {/* 1. Alternativas de Motivo */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: theme.textMain, marginBottom: '8px' }}>
              Seleccione el Motivo Principal:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {OPCIONES_MOTIVO.map((opcion, idx) => {
                const seleccionada = motivoSeleccionado === opcion
                return (
                  <div
                    key={idx}
                    onClick={() => setMotivoSeleccionado(opcion)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      backgroundColor: seleccionada ? (temaOscuro ? '#1e293b' : '#f0f9ff') : theme.bgSubtle,
                      border: seleccionada ? `1.5px solid ${theme.accentCool}` : theme.border,
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: seleccionada ? theme.textMain : theme.textSecondary,
                      fontWeight: seleccionada ? '700' : '500',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="motivo_elim"
                      checked={seleccionada}
                      onChange={() => setMotivoSeleccionado(opcion)}
                      style={{ accentColor: theme.accentCool, cursor: 'pointer' }}
                    />
                    <span>{opcion}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. Redacción Obligatoria del Motivo */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: theme.textMain, marginBottom: '6px' }}>
              Motivo o Justificación de la Eliminación (Obligatorio) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              rows={3}
              value={motivoDetalle}
              onChange={(e) => setMotivoDetalle(e.target.value)}
              placeholder="Explique obligatoriamente la razón por la cual desea eliminar esta historia clínica. Este mensaje llegará directamente a la bandeja de solicitudes del Administrador..."
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${theme.borderInput}`,
                fontSize: '12.5px',
                fontFamily: 'inherit',
                color: theme.textMain,
                backgroundColor: theme.bgInput,
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          {/* Mensaje de Error */}
          {errorMsg && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: temaOscuro ? '#3b121e' : '#fee2e2',
              color: temaOscuro ? '#fca5a5' : '#991b1b',
              border: `1px solid ${temaOscuro ? '#881337' : '#f87171'}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Botones de Acción */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onCerrar}
              disabled={enviando}
              style={{
                padding: '9px 18px',
                backgroundColor: theme.bgSubtle,
                color: theme.textSecondary,
                border: theme.border,
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={enviando}
              style={{
                padding: '9px 20px',
                backgroundColor: temaOscuro ? '#3b121e' : '#fef2f2',
                color: temaOscuro ? '#fca5a5' : '#dc2626',
                border: `1px solid ${temaOscuro ? '#881337' : '#fecaca'}`,
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '800',
                cursor: enviando ? 'not-allowed' : 'pointer',
                opacity: enviando ? 0.7 : 1,
                boxShadow: theme.shadowCard
              }}
            >
              {enviando ? 'Enviando...' : 'Enviar Solicitud al Administrador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
