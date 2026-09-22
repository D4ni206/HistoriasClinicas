import { useState } from 'react'
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
  const [motivoSeleccionado, setMotivoSeleccionado] = useState(OPCIONES_MOTIVO[0])
  const [motivoDetalle, setMotivoDetalle] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!paciente) return null

  const esOtro = motivoSeleccionado.startsWith('Otro motivo')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (esOtro && !motivoDetalle.trim()) {
      setErrorMsg('Por favor redacte el motivo específico en el campo de texto.')
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
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      backdropFilter: 'blur(3px)',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 20px 45px rgba(43, 74, 102, 0.28)',
        border: '1.5px solid #FFD6E8',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Cabecera del Modal */}
        <div style={{
          backgroundColor: '#FFF6FB',
          padding: '16px 20px',
          borderBottom: '1.5px solid #FFD6E8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#802048', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Control de Seguridad y Auditoría Clínica
            </span>
            <h3 style={{ margin: '3px 0 0 0', fontSize: '17px', fontWeight: '800', color: '#2B4A66' }}>
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
              color: '#802048',
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
            backgroundColor: '#f8fafc',
            border: '1.5px solid #7FD6FF',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12.5px'
          }}>
            <div>
              <span style={{ color: '#64748b' }}>Paciente DNI: </span>
              <strong style={{ color: '#0a5438', backgroundColor: '#6FE3B4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #4cc799' }}>
                {paciente.dni}
              </strong>
              <div style={{ marginTop: '4px', color: '#64748b', fontSize: '11.5px' }}>
                Expediente: <strong>#{paciente.id}</strong> · Documentos: <strong>{paciente.documentos ? paciente.documentos.length : (paciente.total_documentos || 0)}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '11.5px', color: '#2B4A66' }}>
              <div>Solicitado por:</div>
              <strong style={{ color: '#104060' }}>{usuario?.username || 'Usuario'}</strong>
              <div style={{ fontSize: '10.5px', color: '#64748b' }}>({usuario?.rol || 'Médico'})</div>
            </div>
          </div>

          {/* Aviso Institucional */}
          <div style={{
            backgroundColor: '#FFF6FB',
            borderLeft: '4px solid #FFD6E8',
            padding: '10px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#802048',
            lineHeight: '1.4'
          }}>
            <strong>Nota institucional:</strong> La eliminación física de un expediente requiere aprobación formal del Administrador. Por favor, seleccione o detalle el motivo correspondiente.
          </div>

          {/* 1. Alternativas de Motivo */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#2B4A66', marginBottom: '8px' }}>
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
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: seleccionada ? '#FFF6FB' : '#ffffff',
                      border: seleccionada ? '1.5px solid #802048' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: seleccionada ? '#802048' : '#2B4A66',
                      fontWeight: seleccionada ? '700' : '500',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="motivo_elim"
                      checked={seleccionada}
                      onChange={() => setMotivoSeleccionado(opcion)}
                      style={{ accentColor: '#802048', cursor: 'pointer' }}
                    />
                    <span>{opcion}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. Redacción Adicional o Motivo Personalizado */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#2B4A66', marginBottom: '6px' }}>
              {esOtro ? 'Especifique el Motivo Detallado (Obligatorio):' : 'Detalles o Justificación Adicional (Opcional):'}
            </label>
            <textarea
              rows={3}
              value={motivoDetalle}
              onChange={(e) => setMotivoDetalle(e.target.value)}
              placeholder={esOtro ? 'Describa detalladamente la justificación médica o administrativa...' : 'Agregue cualquier observación o contexto relevante para el Administrador...'}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '12.5px',
                fontFamily: 'inherit',
                color: '#2B4A66',
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#7FD6FF'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          {/* Mensaje de Error */}
          {errorMsg && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #f87171',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Botones de Acción */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onCerrar}
              disabled={enviando}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                border: '1px solid #cbd5e1',
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
                padding: '8px 18px',
                backgroundColor: '#FFD6E8',
                color: '#802048',
                border: '1.5px solid #f4a7c7',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '800',
                cursor: enviando ? 'not-allowed' : 'pointer',
                opacity: enviando ? 0.7 : 1,
                boxShadow: '0 2px 6px rgba(255, 214, 232, 0.6)'
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
