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
  onVerCarpeta,
  onEliminar,
  notificar
}) {
  const [hovered, setHovered] = useState(false)
  const { temaOscuro, theme } = useTheme()

  if (!paciente) return null

  const docs = paciente.documentos || []
  const totalNotas = paciente.total_notas ?? (paciente.notas_medicas ? paciente.notas_medicas.length : 0)

  // Análisis clínico para extraer síntomas y estado
  const analisis = useMemo(() => {
    try {
      return analizarPaciente(paciente)
    } catch {
      return null
    }
  }, [paciente])

  // 3: Descripción clínica del paciente
  const descripcionClinica = useMemo(() => {
    const notas = paciente.notas_medicas || []
    if (notas.length > 0) {
      const n = notas[0]
      if (n.diagnostico && n.contenido) {
        return `${n.diagnostico} — ${n.contenido}`
      }
      if (n.diagnostico) return n.diagnostico
      if (n.contenido) return n.contenido
    }

    const signos = paciente.signos_vitales || []
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
    const notas = paciente.notas_medicas || []
    const signos = paciente.signos_vitales || []
    const texto = [
      ...notas.map(n => `${n.diagnostico || ''} ${n.contenido || ''}`),
      ...signos.map(s => s.observaciones || '')
    ].join(' ').toLowerCase()
    return /alerg|penicilina|latex|intoleran|sensib|reacci[oó]n|asma|anafilax|cuidado especial/.test(texto)
  }, [paciente])

  return (
    <Card
      className="w-full"
      style={{
        backgroundColor: theme.bgCard,
        color: theme.textMain,
        border: theme.border,
        borderRadius: '18px',
        padding: '16px',
        boxShadow: hovered
          ? (temaOscuro ? '0 16px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px #38bdf8' : '0 16px 30px rgba(15, 23, 42, 0.08), 0 0 0 1px #cbd5e1')
          : theme.shadowCard,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* ================================================================= */}
        {/* 1. FOTO DEL PACIENTE (BANNER CLÍNICO FORMAL CON TONOS FRÍOS) */}
        {/* ================================================================= */}
        <div
          onClick={abrirHistoriaClinica}
          style={{
            width: '100%',
            height: '160px',
            background: theme.bannerGrad,
            borderRadius: '14px',
            border: theme.border,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden'
          }}
          title="Ver historia clínica del paciente"
        >
          {/* Insignia superior izquierda: Expediente # y Total de Documentos */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 2
          }}>
            <span style={{
              backgroundColor: temaOscuro ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(4px)',
              color: theme.textMain,
              fontSize: '11px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '6px',
              border: theme.border
            }}>
              Exp. #{paciente.id}
            </span>
            <span style={{
              backgroundColor: temaOscuro ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(4px)',
              color: theme.textSecondary,
              fontSize: '11px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '6px',
              border: theme.border
            }}>
              {docs.length} doc{docs.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Botones de acción rápida en la esquina superior derecha */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 3
            }}
          >
            {/* + Archivo */}
            <button
              onClick={() => onAgregarArchivo && onAgregarArchivo(paciente.dni, paciente.id)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: temaOscuro ? '#1e293b' : '#ffffff',
                border: theme.border,
                color: theme.textMain,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              title="Subir nuevo documento al expediente"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {/* Notas Médicas */}
            <button
              onClick={() => onAbrirNotas && onAbrirNotas(paciente)}
              style={{
                height: '30px',
                padding: '0 8px',
                borderRadius: '8px',
                backgroundColor: temaOscuro ? '#1e293b' : '#ffffff',
                border: theme.border,
                color: theme.textMain,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              title="Ver y redactar notas médicas"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>{totalNotas}</span>
            </button>

            {/* Eliminar (Tacho de basura) */}
            <button
              onClick={() => onEliminar && onEliminar(paciente.id, paciente.dni)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: temaOscuro ? '#1e293b' : '#ffffff',
                border: theme.border,
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              title="Eliminar expediente clínico"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>

          {/* Figura Central: Placeholder clínico de imagen del paciente */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: temaOscuro ? '#38bdf8' : '#2563eb',
            opacity: 0.85
          }}>
            <svg
              width="54"
              height="54"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="4" ry="4" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. DNI DEL PACIENTE (HEADING) */}
        {/* ================================================================= */}
        <div style={{ marginTop: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <h3 style={{
              margin: 0,
              fontSize: '17px',
              fontWeight: '800',
              color: theme.textMain,
              letterSpacing: '-0.02em',
              lineHeight: '1.25'
            }}>
              DNI: {paciente.dni}
            </h3>

            {/* Badges de estado clínico y advertencias */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {tieneAlergia && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (notificar) {
                      notificar({
                        tipo: 'alergia',
                        titulo: 'Alergias / Advertencia',
                        texto: `Atención: El expediente del paciente DNI ${paciente.dni} registra alertas de alergias o condición médica de cuidado sensible.`,
                        contador: '2',
                        actionLabel: 'Got it'
                      })
                    }
                  }}
                  title="Paciente con alertas de alergias activas"
                  style={{
                    fontSize: '10.5px',
                    fontWeight: '700',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    backgroundColor: temaOscuro ? '#451a03' : '#fffbeb',
                    color: temaOscuro ? '#fcd34d' : '#b45309',
                    border: temaOscuro ? '1px solid #78350f' : '1px solid #fde68a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '10px' }}>⚠️</span>
                  <span>Alergias</span>
                </button>
              )}
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: tieneAlerta
                  ? (temaOscuro ? '#1e293b' : '#eff6ff')
                  : (temaOscuro ? '#052e16' : '#f0fdf4'),
                color: tieneAlerta
                  ? (temaOscuro ? '#93c5fd' : '#1d4ed8')
                  : (temaOscuro ? '#86efac' : '#166534'),
                border: tieneAlerta
                  ? (temaOscuro ? '1px solid #334155' : '1px solid #bfdbfe')
                  : (temaOscuro ? '1px solid #14532d' : '1px solid #bbf7d0'),
                whiteSpace: 'nowrap'
              }}>
                {tieneAlerta ? 'Sintomático' : 'Estable'}
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. DESCRIPCIÓN CLÍNICA (SÍNTOMAS / DIAGNÓSTICO) */}
        {/* ================================================================= */}
        <div>
          <p style={{
            margin: 0,
            fontSize: '12.5px',
            color: theme.textMuted,
            lineHeight: '1.45',
            fontWeight: '500',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '36px'
          }} title={descripcionClinica}>
            {descripcionClinica}
          </p>
        </div>

      </div>

      {/* ================================================================= */}
      {/* 4. ACCIÓN DE VER HISTORIA CLÍNICA */}
      {/* ================================================================= */}
      <div style={{ marginTop: '14px' }}>
        <button
          onClick={abrirHistoriaClinica}
          style={{
            width: '100%',
            height: '42px',
            backgroundColor: theme.primaryBtnBg,
            color: theme.primaryBtnColor,
            border: 'none',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: temaOscuro ? '0 4px 14px rgba(56, 189, 248, 0.25)' : '0 2px 8px rgba(15, 23, 42, 0.15)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.primaryBtnHover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.primaryBtnBg
          }}
          title="Ver historia clínica y silueta anatómica"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Ver Historia Clínica</span>
        </button>
      </div>
    </Card>
  )
}
