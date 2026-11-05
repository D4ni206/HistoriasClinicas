import { useState, useMemo } from 'react'
import { Card } from '@heroui/react'
import { useTheme } from '../context/ThemeContext'
import { analizarPaciente } from '../utils/symptomAnalyzer'

export default function PacienteCard({
  paciente,
  onVerDocumento,
  onVerSilueta,
  onAgregarArchivo,
  onAbrirNotas,
  onVerCarpeta: _onVerCarpeta,
  onEliminar,
  notificar
}) {
  const [hovered, setHovered] = useState(false)
  const { temaOscuro } = useTheme()

  const docs = paciente?.documentos || []
  const totalNotas = paciente?.total_notas ?? (paciente?.notas_medicas ? paciente.notas_medicas.length : 0)

  // Análisis clínico para extraer síntomas y estado
  const analisis = useMemo(() => {
    try {
      return analizarPaciente(paciente)
    } catch {
      return null
    }
  }, [paciente])

  // Descripción clínica del paciente
  const descripcionClinica = useMemo(() => {
    const notas = paciente?.notas_medicas || []
    if (notas.length > 0) {
      const n = notas[0]
      if (n.diagnostico && n.contenido) {
        return `${n.diagnostico} — ${n.contenido}`
      }
      if (n.diagnostico) return n.diagnostico
      if (n.contenido) return n.contenido
    }

    const signos = paciente?.signos_vitales || []
    if (signos.length > 0 && signos[0].observaciones) {
      return signos[0].observaciones
    }

    if (analisis && analisis.totalAfecciones > 0) {
      const hallazgos = analisis.zonasActivas
        .filter(z => z.activo)
        .map(z => `${z.organo}: ${z.hallazgo}`)
        .join(' · ')
      if (hallazgos) return hallazgos
    }

    return 'Evaluación clínica preventiva. Parámetros fisiológicos estables sin sintomatología aguda reportada.'
  }, [paciente, analisis])

  const abrirHistoriaClinica = () => {
    if (onVerSilueta) {
      onVerSilueta(paciente)
    } else if (onVerDocumento) {
      onVerDocumento({
        id: docs[0]?.id || null,
        nombre_archivo: docs[0]?.nombre_archivo || `Historia Clínica Digital - DNI ${paciente.dni}`,
        paciente_id: paciente.id,
        paciente_dni: paciente.dni,
        paciente: paciente,
        fecha_subida: docs[0]?.fecha_subida || 'Expediente Activo'
      })
    }
  }

  const tieneAlerta = analisis && analisis.totalAfecciones > 0

  // Detección de Alergias o Contenido Sensible en el paciente
  const tieneAlergia = useMemo(() => {
    if (!paciente) return false
    if (paciente.alergias && paciente.alergias.trim() && !paciente.alergias.toLowerCase().includes('ninguna')) {
      return true
    }
    const notas = paciente.notas_medicas || []
    const signos = paciente.signos_vitales || []
    const texto = [
      ...notas.map(n => `${n.diagnostico || ''} ${n.contenido || ''}`),
      ...signos.map(s => s.observaciones || '')
    ].join(' ').toLowerCase()
    return /alerg|penicilina|latex|intoleran|sensib|reacci[oó]n|asma|anafilax|cuidado especial/.test(texto)
  }, [paciente])

  // Obtener iniciales para el avatar institucional
  const iniciales = useMemo(() => {
    if (paciente?.nombre && paciente.nombre.trim()) {
      const partes = paciente.nombre.trim().split(/\s+/).filter(Boolean)
      if (partes.length >= 2) {
        return (partes[0][0] + partes[1][0]).toUpperCase()
      }
      return partes[0].slice(0, 2).toUpperCase()
    }
    return (paciente?.dni || 'HC').slice(0, 2).toUpperCase()
  }, [paciente])

  if (!paciente) return null

  return (
    <Card
      className="w-full"
      style={{
        backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
        color: 'var(--medix-text-main, #1F2937)',
        border: '1px solid var(--medix-border, #D9DEE5)',
        borderRadius: '10px',
        padding: '16px',
        boxShadow: hovered
          ? '0 4px 12px rgba(11, 37, 69, 0.08)'
          : '0 1px 3px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        boxSizing: 'border-box'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* ================================================================= */}
        {/* 1. CABECERA: AVATAR CON INICIALES + DATOS + BOTONES DE ACCIÓN */}
        {/* ================================================================= */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {/* Avatar sobrio con iniciales */}
            <div
              onClick={abrirHistoriaClinica}
              title="Ver historia clínica"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#EBF3FA',
                color: 'var(--medix-action, #1D5C96)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                flexShrink: 0,
                border: '1px solid #D1E3F5'
              }}
            >
              {iniciales}
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <h3
                  onClick={abrirHistoriaClinica}
                  style={{
                    margin: 0,
                    fontSize: '14.5px',
                    fontWeight: '700',
                    color: 'var(--medix-text-main, #1F2937)',
                    lineHeight: 1.25,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={paciente.nombre || `DNI: ${paciente.dni}`}
                >
                  {paciente.nombre || `Paciente DNI ${paciente.dni}`}
                </h3>

                {tieneAlergia && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (notificar) {
                        notificar({
                          tipo: 'alergia',
                          titulo: 'Alergias / Advertencia',
                          texto: `Atención: El paciente ${paciente.nombre || `DNI ${paciente.dni}`} registra alergias: ${paciente.alergias || 'condición sensible registrada'}.`,
                          contador: '2',
                          actionLabel: 'Entendido'
                        })
                      }
                    }}
                    title={paciente.alergias ? `Alergia: ${paciente.alergias}` : 'Alerta de alergia registrada'}
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--medix-alert-bg, #FEF3F2)',
                      color: 'var(--medix-alert-red, #B42318)',
                      border: '1px solid var(--medix-alert-border, #FECDCA)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Alergia
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                <span style={{ fontSize: '12px', color: 'var(--medix-text-muted, #5B6675)' }}>
                  DNI: <strong>{paciente.dni}</strong>
                </span>
                <span style={{ fontSize: '11px', color: 'var(--medix-text-muted, #5B6675)' }}>
                  · {docs.length} doc{docs.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de acción rápida superiores */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {/* + Archivo */}
            <button
              type="button"
              onClick={() => onAgregarArchivo && onAgregarArchivo(paciente.dni, paciente.id)}
              aria-label={`Anexar documento al expediente ${paciente.dni}`}
              title="Anexar documento"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                border: '1px solid var(--medix-border, #D9DEE5)',
                color: 'var(--medix-text-main, #1F2937)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F6F9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {/* Notas Médicas */}
            <button
              type="button"
              onClick={() => onAbrirNotas && onAbrirNotas(paciente)}
              aria-label={`Ver notas médicas de ${paciente.dni}`}
              title="Ver notas médicas"
              style={{
                height: '28px',
                padding: '0 7px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                border: '1px solid var(--medix-border, #D9DEE5)',
                color: 'var(--medix-text-main, #1F2937)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F6F9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>{totalNotas}</span>
            </button>

            {/* Eliminar (si hay handler) */}
            {onEliminar && (
              <button
                type="button"
                onClick={() => onEliminar(paciente.id, paciente.dni)}
                aria-label={`Eliminar expediente ${paciente.dni}`}
                title="Eliminar expediente"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(180, 35, 24, 0.2)',
                  color: 'var(--medix-alert-red, #B42318)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--medix-alert-bg, #FEF3F2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. ESTADO CLÍNICO */}
        {/* ================================================================= */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: tieneAlerta
                ? (temaOscuro ? '#1e293b' : '#EFF6FF')
                : 'var(--medix-status-bg, #ECFDF3)',
              color: tieneAlerta
                ? (temaOscuro ? '#93c5fd' : '#1D5C96')
                : 'var(--medix-status-green, #067647)',
              border: tieneAlerta
                ? (temaOscuro ? '1px solid #334155' : '1px solid #BFDBFE')
                : '1px solid var(--medix-status-border, #ABEFC6)'
            }}
          >
            {tieneAlerta ? 'Sintomático' : 'Activo'}
          </span>

          <span style={{ fontSize: '11px', color: 'var(--medix-text-muted, #5B6675)' }}>
            Exp. #{paciente.id}
          </span>
        </div>

        {/* ================================================================= */}
        {/* 3. RESUMEN CLÍNICO */}
        {/* ================================================================= */}
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: 'var(--medix-text-muted, #5B6675)',
            lineHeight: '1.45',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
          title={descripcionClinica}
        >
          {descripcionClinica}
        </p>
      </div>

      {/* ================================================================= */}
      {/* 4. BOTÓN VER HISTORIA */}
      {/* ================================================================= */}
      <div style={{ marginTop: '12px' }}>
        <button
          type="button"
          onClick={abrirHistoriaClinica}
          style={{
            width: '100%',
            height: '36px',
            backgroundColor: 'var(--medix-action, #1D5C96)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--medix-action-hover, #164775)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--medix-action, #1D5C96)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Ver Historia Clínica</span>
        </button>
      </div>
    </Card>
  )
}
