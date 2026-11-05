import { useState, useEffect, useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import DocxViewer from './DocxViewer'
import TextViewer from './TextViewer'
import ManiquiAnatomico from './ManiquiAnatomico'
import { esPdf, esDocx, esImagen, esTexto } from '../utils/fileHelpers'
import { API_BASE } from '../api/config'

export default function VisorLateral({
  documentoEnVista,
  paciente,
  onCerrar,
  onSeleccionarDocumento
}) {
  const { temaOscuro } = useTheme()
  const { token } = useAuth()

  // Pestaña activa en la columna derecha de previsualización: 'documento' | 'notas' | 'anatomia'
  const [pestanaActiva, setPestanaActiva] = useState('documento')
  const [docActivo, setDocActivo] = useState(documentoEnVista)
  const [imgError, setImgError] = useState(false)
  const [esPantallaPequena, setEsPantallaPequena] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 960 : false
  )

  useEffect(() => {
    setDocActivo(documentoEnVista)
    setImgError(false)
  }, [documentoEnVista])

  useEffect(() => {
    const handleResize = () => {
      setEsPantallaPequena(window.innerWidth < 960)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const obtenerUrlArchivo = (id, view = false) => {
    let url = `${API_BASE}/documentos/${id}/archivo`
    const params = []
    if (view) params.push('view=1')
    if (token) params.push(`token=${encodeURIComponent(token)}`)
    if (params.length > 0) url += `?${params.join('&')}`
    return url
  }

  const pacienteFinal = useMemo(() => {
    return paciente || documentoEnVista?.paciente || null
  }, [paciente, documentoEnVista])

  const notas = useMemo(() => {
    return pacienteFinal?.notas_medicas || []
  }, [pacienteFinal])

  const signos = useMemo(() => {
    return pacienteFinal?.signos_vitales || []
  }, [pacienteFinal])

  const documentos = useMemo(() => {
    if (pacienteFinal?.documentos && pacienteFinal.documentos.length > 0) {
      return pacienteFinal.documentos
    }
    return documentoEnVista?.id ? [documentoEnVista] : []
  }, [pacienteFinal, documentoEnVista])

  // Último registro de signos vitales (triaje)
  const ultimoSigno = signos.length > 0 ? signos[0] : null

  // Construcción de la Línea de Tiempo Cronológica Unificada
  const eventosLineaTiempo = useMemo(() => {
    const lista = []

    // 1. Documentos escaneados
    documentos.forEach(doc => {
      lista.push({
        tipo: 'documento',
        id: `doc-${doc.id}`,
        fechaRaw: doc.fecha_subida ? new Date(doc.fecha_subida).getTime() : 0,
        fecha: doc.fecha_subida
          ? new Date(doc.fecha_subida).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          : 'Fecha no registrada',
        titulo: doc.nombre_original || doc.nombre_archivo || 'Documento Clínico',
        subtitulo: 'Archivo Adjunto',
        doc: doc
      })
    })

    // 2. Notas médicas
    notas.forEach(nota => {
      lista.push({
        tipo: 'nota',
        id: `nota-${nota.id}`,
        fechaRaw: (nota.fecha || nota.fecha_creacion) ? new Date(nota.fecha || nota.fecha_creacion).getTime() : 0,
        fecha: (nota.fecha || nota.fecha_creacion)
          ? new Date(nota.fecha || nota.fecha_creacion).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : 'Fecha reciente',
        titulo: nota.diagnostico || 'Evolución Médica',
        subtitulo: `Dr(a). ${nota.medico_nombre || 'Médico Tratante'}`,
        contenido: nota.contenido
      })
    })

    // 3. Controles de Signos Vitales
    signos.forEach(signo => {
      lista.push({
        tipo: 'signo',
        id: `signo-${signo.id}`,
        fechaRaw: (signo.fecha || signo.fecha_registro) ? new Date(signo.fecha || signo.fecha_registro).getTime() : 0,
        fecha: (signo.fecha || signo.fecha_registro)
          ? new Date(signo.fecha || signo.fecha_registro).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : 'Fecha de toma',
        titulo: 'Control de Signos Vitales',
        subtitulo: `Enf. ${signo.enfermera_nombre || 'Enfermería'}`,
        signoData: signo
      })
    })

    // Ordenar cronológicamente descendente
    return lista.sort((a, b) => b.fechaRaw - a.fechaRaw)
  }, [documentos, notas, signos])

  if (!documentoEnVista) return null

  const nombreArchivoMostrado = docActivo?.nombre_original || docActivo?.nombre_archivo || ''
  const tieneAlergia = pacienteFinal?.alergias && pacienteFinal.alergias.trim() && !pacienteFinal.alergias.toLowerCase().includes('ninguna')

  // Manejador al hacer clic en documento del timeline
  const handleSeleccionarDoc = (doc) => {
    setDocActivo(doc)
    setPestanaActiva('documento')
    if (onSeleccionarDocumento) {
      onSeleccionarDocumento(doc)
    }
  }

  return (
    <aside
      aria-label="Expediente Clínico y Visor"
      style={{
        width: esPantallaPequena ? '100vw' : '82%',
        maxWidth: esPantallaPequena ? '100vw' : '1350px',
        flexShrink: 0,
        height: '100vh',
        backgroundColor: 'var(--medix-bg-app, #F4F6F9)',
        borderLeft: esPantallaPequena ? 'none' : '1px solid var(--medix-border, #D9DEE5)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: esPantallaPequena ? 120 : 35,
        position: esPantallaPequena ? 'fixed' : 'relative',
        top: 0,
        right: 0,
        bottom: 0,
        left: esPantallaPequena ? 0 : undefined,
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* =================================================================== */}
      {/* 1. CABECERA FIJA CON DATOS CLAVE (STICKY HEADER) */}
      {/* =================================================================== */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '12px 18px',
          borderBottom: '1px solid var(--medix-border, #D9DEE5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
          flexWrap: 'wrap',
          gap: '12px',
          flexShrink: 0
        }}
      >
        {/* Datos clave del paciente */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--medix-navy, #0B2545)',
                  letterSpacing: '-0.2px'
                }}
              >
                {pacienteFinal?.nombre || `Paciente DNI ${pacienteFinal?.dni || documentoEnVista.paciente_dni}`}
              </h2>

              {tieneAlergia && (
                <span
                  style={{
                    backgroundColor: 'var(--medix-alert-bg, #FEF3F2)',
                    color: 'var(--medix-alert-red, #B42318)',
                    border: '1px solid var(--medix-alert-border, #FECDCA)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}
                  title={`Alergias registradas: ${pacienteFinal.alergias}`}
                >
                  Alergias: {pacienteFinal.alergias}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '3px', fontSize: '12px', color: 'var(--medix-text-muted, #5B6675)' }}>
              <span>
                DNI: <strong style={{ color: 'var(--medix-text-main, #1F2937)' }}>{pacienteFinal?.dni || documentoEnVista.paciente_dni || '—'}</strong>
              </span>
              <span>·</span>
              <span>
                Edad: <strong style={{ color: 'var(--medix-text-main, #1F2937)' }}>{pacienteFinal?.edad || '—'}</strong>
              </span>
              <span>·</span>
              <span>
                Expediente: <strong style={{ color: 'var(--medix-text-main, #1F2937)' }}>#{pacienteFinal?.id || documentoEnVista.paciente_id || '—'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción accesibles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {docActivo?.id && (
            <a
              href={obtenerUrlArchivo(docActivo.id)}
              download={nombreArchivoMostrado}
              aria-label="Descargar archivo original"
              title="Descargar archivo original"
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                color: 'var(--medix-action, #1D5C96)',
                border: '1px solid var(--medix-border, #D9DEE5)',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Descargar</span>
            </a>
          )}

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar visor"
            title="Cerrar expediente"
            style={{
              padding: '6px 12px',
              backgroundColor: 'transparent',
              color: 'var(--medix-text-main, #1F2937)',
              border: '1px solid var(--medix-border, #D9DEE5)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F6F9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span>Cerrar</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. TARJETAS MÉTRICAS DE SIGNOS VITALES (P.A., F.C., Temp, SpO2) */}
      {/* =================================================================== */}
      <div
        style={{
          padding: '10px 18px',
          backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
          borderBottom: '1px solid var(--medix-border, #D9DEE5)',
          display: 'grid',
          gridTemplateColumns: esPantallaPequena ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '10px',
          flexShrink: 0
        }}
      >
        {/* Métrica 1: Presión Arterial */}
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: temaOscuro ? 'rgba(255, 255, 255, 0.03)' : '#F8F9FA',
            border: '1px solid var(--medix-border, #D9DEE5)'
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--medix-text-muted, #5B6675)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            P.A.
          </span>
          <strong style={{ display: 'block', fontSize: '15px', color: 'var(--medix-navy, #0B2545)', marginTop: '2px' }}>
            {ultimoSigno?.presion_arterial || (ultimoSigno?.pa_sistolica ? `${ultimoSigno.pa_sistolica}/${ultimoSigno.pa_diastolica} mmHg` : '—')}
          </strong>
          <span style={{ fontSize: '10px', color: 'var(--medix-text-muted, #5B6675)' }}>
            Presión arterial
          </span>
        </div>

        {/* Métrica 2: Frecuencia Cardíaca */}
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: temaOscuro ? 'rgba(255, 255, 255, 0.03)' : '#F8F9FA',
            border: '1px solid var(--medix-border, #D9DEE5)'
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--medix-text-muted, #5B6675)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            F.C.
          </span>
          <strong style={{ display: 'block', fontSize: '15px', color: 'var(--medix-navy, #0B2545)', marginTop: '2px' }}>
            {ultimoSigno?.frecuencia_cardiaca ? `${ultimoSigno.frecuencia_cardiaca} lpm` : '—'}
          </strong>
          <span style={{ fontSize: '10px', color: 'var(--medix-text-muted, #5B6675)' }}>
            Frecuencia cardíaca
          </span>
        </div>

        {/* Métrica 3: Temperatura */}
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: temaOscuro ? 'rgba(255, 255, 255, 0.03)' : '#F8F9FA',
            border: '1px solid var(--medix-border, #D9DEE5)'
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--medix-text-muted, #5B6675)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Temp
          </span>
          <strong style={{ display: 'block', fontSize: '15px', color: 'var(--medix-navy, #0B2545)', marginTop: '2px' }}>
            {ultimoSigno?.temperatura ? `${ultimoSigno.temperatura} °C` : '—'}
          </strong>
          <span style={{ fontSize: '10px', color: 'var(--medix-text-muted, #5B6675)' }}>
            Temperatura corporal
          </span>
        </div>

        {/* Métrica 4: SpO2 */}
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: temaOscuro ? 'rgba(255, 255, 255, 0.03)' : '#F8F9FA',
            border: '1px solid var(--medix-border, #D9DEE5)'
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--medix-text-muted, #5B6675)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            SpO2
          </span>
          <strong style={{ display: 'block', fontSize: '15px', color: 'var(--medix-navy, #0B2545)', marginTop: '2px' }}>
            {ultimoSigno?.saturacion_oxigeno || ultimoSigno?.spo2 ? `${ultimoSigno.saturacion_oxigeno || ultimoSigno.spo2}%` : '—'}
          </strong>
          <span style={{ fontSize: '10px', color: 'var(--medix-text-muted, #5B6675)' }}>
            Saturación oxígeno
          </span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. ZONA PRINCIPAL EN 2 COLUMNAS (TIMELINE IZQ / PREVIEW DER) */}
      {/* =================================================================== */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: esPantallaPequena ? 'column' : 'row',
          overflow: 'hidden',
          backgroundColor: 'var(--medix-bg-app, #F4F6F9)'
        }}
      >
        {/* ----------------------------------------------------------------- */}
        {/* COLUMNA IZQUIERDA: LÍNEA DE TIEMPO CRONOLÓGICA (FEED VERTICAL) */}
        {/* ----------------------------------------------------------------- */}
        <div
          style={{
            width: esPantallaPequena ? '100%' : '360px',
            flex: esPantallaPequena ? 'none' : '0 0 360px',
            height: esPantallaPequena ? '40vh' : '100%',
            overflowY: 'auto',
            borderRight: esPantallaPequena ? 'none' : '1px solid var(--medix-border, #D9DEE5)',
            borderBottom: esPantallaPequena ? '1px solid var(--medix-border, #D9DEE5)' : 'none',
            backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
            padding: '16px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--medix-navy, #0B2545)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Historial Cronológico
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--medix-text-muted, #5B6675)' }}>
              {eventosLineaTiempo.length} registros (notas, signos y documentos)
            </span>
          </div>

          {eventosLineaTiempo.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--medix-text-muted, #5B6675)', fontSize: '13px' }}>
              Sin registros en el historial clínico.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {eventosLineaTiempo.map((evento) => {
                const esDocSeleccionado = evento.tipo === 'documento' && docActivo?.id === evento.doc?.id

                return (
                  <div
                    key={evento.id}
                    onClick={() => {
                      if (evento.tipo === 'documento') {
                        handleSeleccionarDoc(evento.doc)
                      } else if (evento.tipo === 'nota') {
                        setPestanaActiva('notas')
                      }
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: esDocSeleccionado
                        ? '1px solid var(--medix-action, #1D5C96)'
                        : '1px solid var(--medix-border, #D9DEE5)',
                      backgroundColor: esDocSeleccionado
                        ? '#F0F5FA'
                        : (temaOscuro ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF'),
                      cursor: evento.tipo === 'documento' || evento.tipo === 'nota' ? 'pointer' : 'default',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: '700',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          backgroundColor:
                            evento.tipo === 'documento'
                              ? '#EBF3FA'
                              : evento.tipo === 'nota'
                              ? '#F3E8FF'
                              : '#ECFDF3',
                          color:
                            evento.tipo === 'documento'
                              ? 'var(--medix-action, #1D5C96)'
                              : evento.tipo === 'nota'
                              ? '#7E22CE'
                              : 'var(--medix-status-green, #067647)'
                        }}
                      >
                        {evento.tipo === 'documento' ? 'Documento' : evento.tipo === 'nota' ? 'Nota Médica' : 'Triaje'}
                      </span>

                      <span style={{ fontSize: '11px', color: 'var(--medix-text-muted, #5B6675)' }}>
                        {evento.fecha}
                      </span>
                    </div>

                    <strong style={{ display: 'block', fontSize: '13px', color: 'var(--medix-text-main, #1F2937)' }}>
                      {evento.titulo}
                    </strong>

                    <span style={{ fontSize: '11.5px', color: 'var(--medix-text-muted, #5B6675)', display: 'block', marginTop: '2px' }}>
                      {evento.subtitulo}
                    </span>

                    {/* Contenido de nota */}
                    {evento.contenido && (
                      <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--medix-text-main, #1F2937)', lineHeight: 1.35 }}>
                        {evento.contenido}
                      </p>
                    )}

                    {/* Datos de signos en el evento */}
                    {evento.signoData && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px', fontSize: '11.5px', color: 'var(--medix-text-main, #1F2937)' }}>
                        {evento.signoData.presion_arterial && <span>PA: <strong>{evento.signoData.presion_arterial}</strong></span>}
                        {evento.signoData.frecuencia_cardiaca && <span>FC: <strong>{evento.signoData.frecuencia_cardiaca} lpm</strong></span>}
                        {evento.signoData.temperatura && <span>Temp: <strong>{evento.signoData.temperatura} °C</strong></span>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* COLUMNA DERECHA: PESTAÑAS Y PREVISUALIZACIÓN */}
        {/* ----------------------------------------------------------------- */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'var(--medix-bg-app, #F4F6F9)'
          }}
        >
          {/* Pestañas: Documento / Notas / Anatomía */}
          <div
            role="tablist"
            aria-label="Pestañas de visualización"
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
              borderBottom: '1px solid var(--medix-border, #D9DEE5)',
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              flexShrink: 0
            }}
          >
            {[
              { id: 'documento', label: 'Documento' },
              { id: 'notas', label: `Notas (${notas.length})` },
              { id: 'anatomia', label: 'Anatomía' }
            ].map(tab => {
              const activo = pestanaActiva === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activo}
                  onClick={() => setPestanaActiva(tab.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: activo ? 'var(--medix-action, #1D5C96)' : 'transparent',
                    color: activo ? '#FFFFFF' : 'var(--medix-text-muted, #5B6675)',
                    fontWeight: activo ? '600' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                >
                  {tab.label}
                </button>
              )
            })}

            {docActivo?.id && pestanaActiva === 'documento' && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '12px',
                  color: 'var(--medix-text-muted, #5B6675)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '300px'
                }}
                title={nombreArchivoMostrado}
              >
                {nombreArchivoMostrado}
              </span>
            )}
          </div>

          {/* Contenido de la pestaña activa */}
          <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
            {/* PESTAÑA 1: DOCUMENTO */}
            {pestanaActiva === 'documento' && (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {docActivo?.id ? (
                  esPdf(nombreArchivoMostrado) ? (
                    <iframe
                      src={obtenerUrlArchivo(docActivo.id, true)}
                      title={`Visor PDF - ${nombreArchivoMostrado}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: '#FFFFFF'
                      }}
                    />
                  ) : esDocx(nombreArchivoMostrado) ? (
                    <div style={{ width: '100%', height: '100%', overflow: 'auto', padding: '16px', boxSizing: 'border-box' }}>
                      <DocxViewer url={obtenerUrlArchivo(docActivo.id, true)} />
                    </div>
                  ) : esImagen(nombreArchivoMostrado) ? (
                    <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
                      {imgError ? (
                        <div style={{ padding: '24px', backgroundColor: 'var(--medix-bg-card, #FFFFFF)', borderRadius: '8px', border: '1px solid var(--medix-border, #D9DEE5)' }}>
                          <p style={{ fontSize: '14px', color: 'var(--medix-alert-red, #B42318)', fontWeight: '600', margin: '0 0 6px 0' }}>
                            No se pudo cargar la vista previa de la imagen.
                          </p>
                          <a href={obtenerUrlArchivo(docActivo.id)} download={nombreArchivoMostrado} style={{ color: 'var(--medix-action, #1D5C96)', fontSize: '13px' }}>
                            Descargar imagen
                          </a>
                        </div>
                      ) : (
                        <img
                          src={obtenerUrlArchivo(docActivo.id, true)}
                          alt="Vista previa de documento"
                          onError={() => setImgError(true)}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: '4px'
                          }}
                        />
                      )}
                    </div>
                  ) : esTexto(nombreArchivoMostrado) ? (
                    <div style={{ width: '100%', height: '100%', overflow: 'auto', padding: '16px', boxSizing: 'border-box' }}>
                      <TextViewer url={obtenerUrlArchivo(docActivo.id, true)} />
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--medix-text-muted, #5B6675)' }}>
                      <p style={{ fontSize: '14px', marginBottom: '12px' }}>
                        Este formato no admite previsualización en el navegador.
                      </p>
                      <a
                        href={obtenerUrlArchivo(docActivo.id)}
                        download={nombreArchivoMostrado}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'var(--medix-action, #1D5C96)',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '13px'
                        }}
                      >
                        Descargar archivo
                      </a>
                    </div>
                  )
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--medix-text-muted, #5B6675)' }}>
                    <p style={{ fontSize: '14px', margin: '0 0 8px 0' }}>No hay documento seleccionado para previsualizar.</p>
                    <span style={{ fontSize: '12px' }}>Seleccione un documento del historial o use las pestañas de Notas / Anatomía.</span>
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA 2: NOTAS MÉDICAS */}
            {pestanaActiva === 'notas' && (
              <div style={{ padding: '20px', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: '700', color: 'var(--medix-navy, #0B2545)' }}>
                  Notas Médicas de Evolución
                </h3>
                {notas.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', backgroundColor: 'var(--medix-bg-card, #FFFFFF)', borderRadius: '8px', border: '1px solid var(--medix-border, #D9DEE5)', color: 'var(--medix-text-muted, #5B6675)' }}>
                    No hay notas médicas registradas para este paciente.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {notas.map(n => (
                      <div
                        key={n.id}
                        style={{
                          backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
                          border: '1px solid var(--medix-border, #D9DEE5)',
                          borderRadius: '8px',
                          padding: '14px 16px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <strong style={{ fontSize: '14px', color: 'var(--medix-action, #1D5C96)' }}>
                            {n.diagnostico || 'Nota Clínica'}
                          </strong>
                          <span style={{ fontSize: '12px', color: 'var(--medix-text-muted, #5B6675)' }}>
                            {n.fecha || (n.fecha_creacion ? new Date(n.fecha_creacion).toLocaleDateString('es-PE') : 'Reciente')}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--medix-text-main, #1F2937)', lineHeight: 1.45 }}>
                          {n.contenido}
                        </p>
                        <div style={{ fontSize: '11px', color: 'var(--medix-text-muted, #5B6675)', marginTop: '8px', textAlign: 'right' }}>
                          Dr(a). {n.medico_nombre || 'Médico Tratante'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA 3: ANATOMÍA */}
            {pestanaActiva === 'anatomia' && (
              <div style={{ height: '100%', overflowY: 'auto', padding: '16px', boxSizing: 'border-box' }}>
                <ManiquiAnatomico
                  paciente={pacienteFinal}
                  documentoActual={docActivo}
                  modoCompacto={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
