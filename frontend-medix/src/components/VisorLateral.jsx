import { useState, useEffect, useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import DocxViewer from './DocxViewer'
import TextViewer from './TextViewer'
import ManiquiAnatomico from './ManiquiAnatomico'
import { esPdf, esDocx, esImagen, esTexto } from '../utils/fileHelpers'
import { API_BASE } from '../api/config'

function extraerEdadPaciente(paciente) {
  if (!paciente) return 'N/R'
  if (paciente.edad) return `${paciente.edad} años`
  const textos = [
    ...(paciente.notas_medicas || []).map(n => n.contenido || ''),
    ...(paciente.signos_vitales || []).map(s => s.observaciones || '')
  ].join(' ')
  const match = textos.match(/(\d{1,3})\s*a[ñn]os/i)
  return match ? `${match[1]} años` : 'N/R'
}

export default function VisorLateral({ documentoEnVista, paciente, onCerrar, onSeleccionarDocumento }) {
  const { theme } = useTheme()
  const { token } = useAuth()

  const [imgError, setImgError] = useState(false)
  const [pestanaActiva, setPestanaActiva] = useState('documento')
  const [docSeleccionadoInterno, setDocSeleccionadoInterno] = useState(null)
  const [esPantallaPequena, setEsPantallaPequena] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 960 : false
  )

  useEffect(() => {
    const handleResize = () => {
      setEsPantallaPequena(window.innerWidth < 960)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setImgError(false)
    setDocSeleccionadoInterno(null)
  }, [documentoEnVista?.id, documentoEnVista?.paciente_id])

  const pacienteFinal = paciente || documentoEnVista?.paciente || null
  const notas = useMemo(() => pacienteFinal?.notas_medicas || [], [pacienteFinal])
  const signos = useMemo(() => pacienteFinal?.signos_vitales || [], [pacienteFinal])
  const documentos = useMemo(() => {
    if (pacienteFinal?.documentos && pacienteFinal.documentos.length > 0) {
      return pacienteFinal.documentos
    }
    return documentoEnVista?.id ? [documentoEnVista] : []
  }, [pacienteFinal, documentoEnVista])

  const ultimoSigno = signos.length > 0 ? signos[0] : null

  const eventosLineaTiempo = useMemo(() => {
    if (!documentoEnVista) return []
    const lista = []

    documentos.forEach(doc => {
      lista.push({
        tipo: 'Documento',
        id: `doc-${doc.id}`,
        fechaRaw: doc.fecha_subida ? new Date(doc.fecha_subida).getTime() : 0,
        fecha: doc.fecha_subida || 'Sin fecha',
        titulo: doc.nombre_original || doc.nombre_archivo || 'Documento clínico',
        subtitulo: 'Archivo digitalizado',
        doc
      })
    })

    notas.forEach(nota => {
      lista.push({
        tipo: 'Nota médica',
        id: `nota-${nota.id}`,
        fechaRaw: nota.fecha ? new Date(nota.fecha).getTime() : 0,
        fecha: nota.fecha || 'Reciente',
        titulo: nota.diagnostico || 'Evolución médica',
        subtitulo: nota.medico_nombre ? `Médico: ${nota.medico_nombre}` : 'Médico tratante',
        contenido: nota.contenido
      })
    })

    signos.forEach(signo => {
      lista.push({
        tipo: 'Signos vitales',
        id: `signo-${signo.id}`,
        fechaRaw: signo.fecha ? new Date(signo.fecha).getTime() : 0,
        fecha: signo.fecha || 'Reciente',
        titulo: 'Control de triaje',
        subtitulo: signo.enfermera_nombre ? `Responsable: ${signo.enfermera_nombre}` : 'Enfermería',
        signoData: signo
      })
    })

    return lista.sort((a, b) => b.fechaRaw - a.fechaRaw)
  }, [documentoEnVista, documentos, notas, signos])

  if (!documentoEnVista) return null

  const docActivo = docSeleccionadoInterno || documentoEnVista
  const nombreArchivoMostrado = docActivo.nombre_original || docActivo.nombre_archivo || 'Documento clínico'
  const dniMostrado = documentoEnVista.paciente_dni || pacienteFinal?.dni || 'Sin DNI'
  const edadMostrada = extraerEdadPaciente(pacienteFinal)
  const tieneAlergia = Boolean(
    pacienteFinal?.alergias &&
    pacienteFinal.alergias.trim() &&
    !pacienteFinal.alergias.toLowerCase().includes('ninguna')
  )

  const obtenerUrlArchivo = (id, view = false) => {
    let url = `${API_BASE}/documentos/${id}/archivo`
    const params = []
    if (view) params.push('view=1')
    if (token) params.push(`token=${encodeURIComponent(token)}`)
    if (params.length > 0) url += `?${params.join('&')}`
    return url
  }

  return (
    <aside
      aria-label="Visor de historia clínica"
      style={{
        width: esPantallaPequena ? '100vw' : '76%',
        minWidth: esPantallaPequena ? '0' : '680px',
        maxWidth: esPantallaPequena ? '100vw' : '1440px',
        flexShrink: 0,
        height: '100vh',
        backgroundColor: theme.bgCard,
        borderLeft: esPantallaPequena ? 'none' : theme.border,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: theme.shadowCard,
        zIndex: esPantallaPequena ? 120 : 35,
        position: esPantallaPequena ? 'fixed' : 'relative',
        top: 0,
        right: 0,
        bottom: 0,
        left: esPantallaPequena ? 0 : undefined,
        overflow: 'hidden'
      }}
    >
      <div className="medix-visor-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '220px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: theme.textHeading, margin: 0 }}>
              {pacienteFinal?.nombre || `Paciente DNI ${dniMostrado}`}
            </h2>
            {tieneAlergia && (
              <span className="medix-badge medix-badge-alert">
                Alergia: {pacienteFinal.alergias}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '12px', color: theme.textSecondary }}>
            <span>DNI: <strong>{dniMostrado}</strong></span>
            <span>Edad: <strong>{edadMostrada}</strong></span>
            <span>Expediente: <strong>#{pacienteFinal?.id || documentoEnVista.paciente_id || '—'}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {docActivo.id && (
            <a
              href={obtenerUrlArchivo(docActivo.id)}
              download={nombreArchivoMostrado}
              className="medix-btn medix-btn-secondary medix-btn-sm"
            >
              Descargar archivo
            </a>
          )}
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar visor de historia clínica"
            className="medix-btn medix-btn-secondary medix-btn-sm"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="medix-vital-grid">
        {[
          { label: 'Presión arterial', valor: ultimoSigno?.presion_arterial || '—', unidad: ultimoSigno?.presion_arterial ? 'mmHg' : '' },
          { label: 'Frecuencia cardíaca', valor: ultimoSigno?.frecuencia_cardiaca || '—', unidad: ultimoSigno?.frecuencia_cardiaca ? 'lpm' : '' },
          { label: 'Temperatura', valor: ultimoSigno?.temperatura || '—', unidad: ultimoSigno?.temperatura ? '°C' : '' },
          { label: 'Saturación O₂', valor: ultimoSigno?.saturacion_oxigeno || '—', unidad: '' }
        ].map((item) => (
          <div key={item.label} className="medix-vital-box">
            <div style={{ fontSize: '12px', color: theme.textSecondary, fontWeight: 500 }}>
              {item.label}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: theme.textHeading, marginTop: '2px' }}>
              {item.valor} {item.unidad && <span style={{ fontSize: '12px', fontWeight: 500, color: theme.textSecondary }}>{item.unidad}</span>}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: esPantallaPequena ? 'column' : 'row',
          overflow: 'hidden',
          backgroundColor: theme.bgApp
        }}
      >
        <div
          style={{
            width: esPantallaPequena ? '100%' : '320px',
            flex: esPantallaPequena ? '0 0 240px' : '0 0 320px',
            borderRight: esPantallaPequena ? 'none' : theme.border,
            borderBottom: esPantallaPequena ? theme.border : 'none',
            backgroundColor: theme.bgCard,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: theme.borderSubtle }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.textHeading, margin: 0 }}>
              Línea de Tiempo Clínica
            </h3>
            <p style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
              Notas, signos vitales y documentos ({eventosLineaTiempo.length})
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
            {eventosLineaTiempo.length === 0 ? (
              <div style={{ fontSize: '14px', color: theme.textSecondary, textAlign: 'center', padding: '24px 8px' }}>
                Sin eventos registrados en este expediente.
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {eventosLineaTiempo.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      position: 'relative',
                      backgroundColor: theme.bgSubtle,
                      border: theme.border,
                      borderRadius: '8px',
                      padding: '10px 12px'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: '-22px',
                        top: '14px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)',
                        border: '2px solid var(--bg-card)'
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>
                        {ev.tipo}
                      </span>
                      <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                        {ev.fecha}
                      </span>
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: 600, color: theme.textMain }}>
                      {ev.titulo}
                    </div>
                    <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
                      {ev.subtitulo}
                    </div>

                    {ev.contenido && (
                      <p style={{ marginTop: '6px', fontSize: '12px', color: theme.textMain, lineHeight: 1.4 }}>
                        {ev.contenido}
                      </p>
                    )}

                    {ev.signoData && (
                      <div style={{ marginTop: '6px', fontSize: '12px', color: theme.textSecondary }}>
                        PA: {ev.signoData.presion_arterial || '—'} · FC: {ev.signoData.frecuencia_cardiaca || '—'} · Temp: {ev.signoData.temperatura || '—'}
                      </div>
                    )}

                    {ev.doc && (
                      <div style={{ marginTop: '8px' }}>
                        <button
                          type="button"
                          className="medix-btn medix-btn-primary medix-btn-sm"
                          onClick={() => {
                            setDocSeleccionadoInterno(ev.doc)
                            if (onSeleccionarDocumento) onSeleccionarDocumento(ev.doc)
                            setPestanaActiva('documento')
                          }}
                        >
                          Ver documento
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div
            role="tablist"
            aria-label="Secciones del expediente"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: theme.bgCard,
              borderBottom: theme.border,
              flexShrink: 0
            }}
          >
            {[
              { id: 'documento', label: 'Documento' },
              { id: 'notas', label: `Notas (${notas.length})` },
              { id: 'anatomia', label: 'Anatomía' }
            ].map((tab) => {
              const activa = pestanaActiva === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activa}
                  onClick={() => setPestanaActiva(tab.id)}
                  className="medix-btn medix-btn-sm"
                  style={{
                    backgroundColor: activa ? 'var(--color-navy)' : theme.bgSubtle,
                    color: activa ? '#FFFFFF' : theme.textSecondary,
                    border: activa ? 'none' : theme.border
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '14px' }}>
            {pestanaActiva === 'documento' && (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {docActivo.id ? (
                  esPdf(nombreArchivoMostrado) ? (
                    <iframe
                      src={obtenerUrlArchivo(docActivo.id, true)}
                      title={`Visor PDF - ${nombreArchivoMostrado}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        minHeight: '480px',
                        border: theme.border,
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF'
                      }}
                    />
                  ) : esDocx(nombreArchivoMostrado) ? (
                    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                      <DocxViewer url={obtenerUrlArchivo(docActivo.id, true)} />
                    </div>
                  ) : esImagen(nombreArchivoMostrado) ? (
                    <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                      {imgError ? (
                        <div className="medix-card" style={{ padding: '24px', color: theme.textSecondary }}>
                          No se pudo previsualizar la imagen. Utilice el botón Descargar archivo.
                        </div>
                      ) : (
                        <img
                          src={obtenerUrlArchivo(docActivo.id, true)}
                          alt={nombreArchivoMostrado}
                          onError={() => setImgError(true)}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
                        />
                      )}
                    </div>
                  ) : esTexto(nombreArchivoMostrado) ? (
                    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                      <TextViewer url={obtenerUrlArchivo(docActivo.id, true)} />
                    </div>
                  ) : (
                    <div className="medix-card" style={{ padding: '32px', textAlign: 'center' }}>
                      <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '12px' }}>
                        Este formato de archivo no tiene vista previa integrada.
                      </p>
                      <a
                        href={obtenerUrlArchivo(docActivo.id)}
                        download={nombreArchivoMostrado}
                        className="medix-btn medix-btn-primary"
                      >
                        Descargar archivo
                      </a>
                    </div>
                  )
                ) : (
                  <div className="medix-card" style={{ padding: '32px', textAlign: 'center', color: theme.textSecondary }}>
                    Este paciente no cuenta con documentos escaneados seleccionados.
                  </div>
                )}
              </div>
            )}

            {pestanaActiva === 'notas' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notas.length === 0 ? (
                  <div className="medix-card" style={{ padding: '24px', textAlign: 'center', color: theme.textSecondary }}>
                    No hay notas médicas registradas para este paciente.
                  </div>
                ) : (
                  notas.map((n) => (
                    <div key={n.id} className="medix-card" style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <strong style={{ fontSize: '14px', color: theme.textHeading }}>
                          {n.diagnostico || 'Nota de evolución clínica'}
                        </strong>
                        <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                          {n.fecha || 'Reciente'}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: theme.textMain, lineHeight: 1.5, margin: 0 }}>
                        {n.contenido}
                      </p>
                      <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
                        Médico: {n.medico_nombre || 'Médico tratante'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {pestanaActiva === 'anatomia' && (
              <ManiquiAnatomico
                paciente={pacienteFinal}
                documentoActual={docActivo}
                modoCompacto={true}
              />
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
