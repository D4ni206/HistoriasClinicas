import { useState, useMemo } from 'react'
import { Card } from '@heroui/react'
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

  // 3: Descripción de lo que tiene el paciente
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

  // 4: Acción de ver historia clínica (abre el visor dividido con la silueta anatómica y el documento)
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
        backgroundColor: '#ffffff',
        color: '#1e293b',
        border: '1.5px solid #e2e8f0',
        borderRadius: '24px',
        padding: '18px',
        boxShadow: hovered
          ? '0 20px 35px -8px rgba(43, 74, 102, 0.16), 0 8px 16px -4px rgba(43, 74, 102, 0.08)'
          : '0 8px 24px -4px rgba(43, 74, 102, 0.07), 0 2px 6px -2px rgba(43, 74, 102, 0.04)',
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
        {/* 1. FOTO DEL PACIENTE (BANNER MINT GREEN CON SILUETA / PLACEHOLDER) */}
        {/* ================================================================= */}
        <div
          onClick={abrirHistoriaClinica}
          style={{
            width: '100%',
            height: '170px',
            backgroundColor: '#a7f3d0',
            background: 'linear-gradient(145deg, #bbf7d0 0%, #a7f3d0 100%)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.6)'
          }}
          title="Ver historia clínica del paciente"
        >
          {/* Insignia superior izquierda: Expediente # y Total de Documentos */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 2
          }}>
            <span style={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(4px)',
              color: '#065f46',
              fontSize: '11px',
              fontWeight: '800',
              padding: '3px 8px',
              borderRadius: '8px',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.06)'
            }}>
              Expediente #{paciente.id}
            </span>
            <span style={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(4px)',
              color: '#047857',
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '8px',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.06)'
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
              gap: '5px',
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
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                border: 'none',
                color: '#104060',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                transition: 'transform 0.15s ease'
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
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                border: 'none',
                color: '#2B4A66',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                transition: 'transform 0.15s ease'
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
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                border: 'none',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                transition: 'transform 0.15s ease'
              }}
              title="Eliminar expediente clínico"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>

          {/* Figura Central: Placeholder exacto de imagen de foto del paciente */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#047857',
            opacity: 0.9
          }}>
            <svg
              width="58"
              height="58"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#047857"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(4, 120, 87, 0.15))' }}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{
              margin: 0,
              fontSize: '19px',
              fontWeight: '800',
              color: '#0f172a',
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
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#fef3c7',
                    color: '#b45309',
                    border: '1px solid #fde68a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 1px 2px rgba(180, 83, 9, 0.1)'
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
                backgroundColor: tieneAlerta ? '#FFD6E8' : '#e0f2fe',
                color: tieneAlerta ? '#802048' : '#0369a1',
                border: tieneAlerta ? '1px solid #f4a7c7' : '1px solid #bae6fd',
                whiteSpace: 'nowrap'
              }}>
                {tieneAlerta ? 'Sintomático' : 'Estable'}
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. DESCRIPCIÓN DE LO QUE TIENE (SÍNTOMAS / DIAGNÓSTICO) */}
        {/* ================================================================= */}
        <div>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#64748b',
            lineHeight: '1.45',
            fontWeight: '500',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '38px'
          }} title={descripcionClinica}>
            {descripcionClinica}
          </p>
        </div>

      </div>

      {/* ================================================================= */}
      {/* 4. ACCIÓN DE VER HISTORIA CLÍNICA (BOTÓN GRANDE ACTION DE LA IMAGEN) */}
      {/* ================================================================= */}
      <div style={{ marginTop: '16px' }}>
        <button
          onClick={abrirHistoriaClinica}
          style={{
            width: '100%',
            height: '46px',
            backgroundColor: '#4f6df5',
            background: 'linear-gradient(180deg, #5b79fa 0%, #4461eb 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '14px',
            fontSize: '13.5px',
            fontWeight: '700',
            letterSpacing: '0.2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(79, 109, 245, 0.35)',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3c5ceb'
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(79, 109, 245, 0.48)'
            e.currentTarget.style.transform = 'scale(1.01)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4f6df5'
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 109, 245, 0.35)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
          title="Ver historia clínica y silueta anatómica"
        >
          <svg
            width="16"
            height="16"
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
