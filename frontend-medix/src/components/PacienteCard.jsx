import { useMemo } from 'react'
import { Card } from '@heroui/react'
import { useTheme } from '../context/ThemeContext'
import { analizarPaciente } from '../utils/symptomAnalyzer'

function obtenerIniciales(nombre, dni) {
  if (nombre && nombre.trim()) {
    const partes = nombre.trim().split(/\s+/)
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase()
    }
    return partes[0].slice(0, 2).toUpperCase()
  }
  return dni ? String(dni).slice(0, 2) : 'HC'
}

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
  const { theme } = useTheme()

  const analisis = useMemo(() => {
    if (!paciente) return null
    try {
      return analizarPaciente(paciente)
    } catch {
      return null
    }
  }, [paciente])

  const descripcionClinica = useMemo(() => {
    if (!paciente) return ''
    const notas = paciente.notas_medicas || []
    if (notas.length > 0) {
      const n = notas[0]
      if (n.diagnostico && n.contenido) return `${n.diagnostico} — ${n.contenido}`
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

    return 'Evaluación clínica preventiva. Parámetros fisiológicos estables.'
  }, [paciente, analisis])

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

  if (!paciente) return null

  const docs = paciente.documentos || []
  const totalNotas = paciente.total_notas ?? (paciente.notas_medicas ? paciente.notas_medicas.length : 0)

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

  return (
    <Card
      className="w-full medix-card"
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
            <div
              onClick={abrirHistoriaClinica}
              className="medix-avatar"
              style={{ width: '42px', height: '42px', fontSize: '14px', cursor: 'pointer' }}
              title="Abrir historia clínica"
            >
              {obtenerIniciales(paciente.nombre, paciente.dni)}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: 700,
                  color: theme.textHeading,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={paciente.nombre || `DNI ${paciente.dni}`}
              >
                {paciente.nombre || `Paciente DNI ${paciente.dni}`}
              </h3>
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
                DNI: <strong>{paciente.dni}</strong> · Exp. #{paciente.id}
              </div>
            </div>
          </div>

          <span className="medix-badge medix-badge-status">Activo</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span className="medix-badge medix-badge-neutral">
              {docs.length} doc{docs.length !== 1 ? 's' : ''}
            </span>
            <span className="medix-badge medix-badge-neutral">
              {totalNotas} nota{totalNotas !== 1 ? 's' : ''}
            </span>

            {tieneAlergia && (
              <button
                type="button"
                className="medix-badge medix-badge-alert"
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (notificar) {
                    notificar({
                      tipo: 'alergia',
                      titulo: 'Alerta de Alergia',
                      texto: `El paciente DNI ${paciente.dni} (${paciente.nombre || 'Sin nombre'}) registra alergias: ${paciente.alergias || 'condición médica sensible'}.`,
                      actionLabel: 'Entendido'
                    })
                  }
                }}
                title={paciente.alergias ? `Alergia: ${paciente.alergias}` : 'Paciente con alergias registradas'}
              >
                Alergia: {paciente.alergias || 'Registrada'}
              </button>
            )}
          </div>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: theme.textSecondary,
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '40px'
          }}
          title={descripcionClinica}
        >
          {descripcionClinica}
        </p>
      </div>

      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: theme.borderSubtle, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={abrirHistoriaClinica}
          className="medix-btn medix-btn-primary"
          style={{ flex: 1 }}
        >
          Ver historia
        </button>

        {onAbrirNotas && (
          <button
            type="button"
            onClick={() => onAbrirNotas(paciente)}
            aria-label={`Notas médicas de DNI ${paciente.dni}`}
            className="medix-btn medix-btn-secondary medix-btn-sm"
          >
            Notas
          </button>
        )}

        {onAgregarArchivo && (
          <button
            type="button"
            onClick={() => onAgregarArchivo(paciente.dni, paciente.id)}
            aria-label={`Subir documento para DNI ${paciente.dni}`}
            className="medix-btn medix-btn-secondary medix-btn-sm"
          >
            + Doc
          </button>
        )}

        {onEliminar && (
          <button
            type="button"
            onClick={() => onEliminar(paciente.id, paciente.dni)}
            aria-label={`Eliminar expediente DNI ${paciente.dni}`}
            className="medix-btn medix-btn-danger medix-btn-sm"
          >
            Eliminar
          </button>
        )}
      </div>
    </Card>
  )
}
