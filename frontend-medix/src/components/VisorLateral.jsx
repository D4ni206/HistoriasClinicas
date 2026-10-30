import { useState, useEffect, useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import DocxViewer from './DocxViewer'
import TextViewer from './TextViewer'
import ManiquiAnatomico from './ManiquiAnatomico'
import { esPdf, esDocx, esImagen, esTexto, obtenerIconoArchivo } from '../utils/fileHelpers'
import { API_BASE } from '../api/config'

export default function VisorLateral({ documentoEnVista, paciente, onCerrar, onSeleccionarDocumento }) {
  const { temaOscuro, theme } = useTheme()
  const { token } = useAuth()

  const obtenerUrlArchivo = (id, view = false) => {
    let url = `${API_BASE}/documentos/${id}/archivo`
    const params = []
    if (view) params.push('view=1')
    if (token) params.push(`token=${encodeURIComponent(token)}`)
    if (params.length > 0) url += `?${params.join('&')}`
    return url
  }

  const [imgError, setImgError] = useState(false)
  // 'dividida' | 'documento' | 'maniqui' | 'timeline'
  const [modoVista, setModoVista] = useState('dividida')
  const [esPantallaPequena, setEsPantallaPequena] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 960 : false)

  useEffect(() => {
    const handleResize = () => {
      setEsPantallaPequena(window.innerWidth < 960)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setImgError(false)
  }, [documentoEnVista?.id])

  if (!documentoEnVista) return null

  const esModoDividido = modoVista === 'dividida'
  const mostrarDoc = modoVista === 'dividida' || modoVista === 'documento'
  const mostrarManiqui = modoVista === 'dividida' || modoVista === 'maniqui'
  const mostrarTimeline = modoVista === 'timeline'

  // Ancho dinámico del panel visor adaptable a cualquier resolución
  const anchoVisor = esPantallaPequena
    ? '100vw'
    : (modoVista === 'timeline' ? '70%' : (esModoDividido ? '84%' : (modoVista === 'maniqui' ? '65%' : '52%')))
  const minAncho = esPantallaPequena ? '0' : (esModoDividido ? '680px' : '450px')

  const pacienteFinal = paciente || documentoEnVista.paciente || null
  const notas = pacienteFinal?.notas_medicas || []
  const signos = pacienteFinal?.signos_vitales || []
  const documentos = pacienteFinal?.documentos || (documentoEnVista.id ? [documentoEnVista] : [])
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
        fecha: doc.fecha_subida || 'Fecha no registrada',
        titulo: doc.nombre_original || doc.nombre_archivo || 'Documento Clínico',
        subtitulo: 'Archivo Digital Adjunto',
        icono: '📄',
        color: '#2563eb',
        doc: doc
      })
    })

    // 2. Notas médicas
    notas.forEach(nota => {
      lista.push({
        tipo: 'nota',
        id: `nota-${nota.id}`,
        fechaRaw: nota.fecha ? new Date(nota.fecha).getTime() : 0,
        fecha: nota.fecha || 'Fecha reciente',
        titulo: nota.diagnostico || 'Nota Médica de Evolución',
        subtitulo: `Dr(a). ${nota.medico_nombre || 'Médico Tratante'}`,
        contenido: nota.contenido,
        icono: '🩺',
        color: '#8b5cf6'
      })
    })

    // 3. Controles de Signos Vitales / Triaje
    signos.forEach(signo => {
      lista.push({
        tipo: 'signo',
        id: `signo-${signo.id}`,
        fechaRaw: signo.fecha ? new Date(signo.fecha).getTime() : 0,
        fecha: signo.fecha || 'Fecha de toma',
        titulo: 'Control de Signos Vitales (Triaje)',
        subtitulo: `Enf. ${signo.enfermera_nombre || 'Personal de Enfermería'}`,
        signoData: signo,
        icono: '💓',
        color: '#10b981'
      })
    })

    // 4. Alergias permanentes registradas
    if (pacienteFinal?.alergias && !pacienteFinal.alergias.toLowerCase().includes('ninguna')) {
      lista.push({
        tipo: 'alergia',
        id: 'alerta-alergia',
        fechaRaw: Date.now() + 1000000000, // Siempre fijado en primer lugar de la línea de tiempo
        fecha: 'Condición Médica Permanente',
        titulo: `Alerta: Paciente Alérgico`,
        subtitulo: 'Registro Clínico Oficial',
        contenido: pacienteFinal.alergias,
        icono: '⚠️',
        color: '#f59e0b',
        esAlertaFija: true
      })
    }

    // Ordenar cronológicamente descendente (lo más reciente primero)
    return lista.sort((a, b) => b.fechaRaw - a.fechaRaw)
  }, [pacienteFinal, documentos, notas, signos])

  const nombreArchivoMostrado = documentoEnVista.nombre_original || documentoEnVista.nombre_archivo

  return (
    <aside style={{
      width: anchoVisor,
      minWidth: minAncho,
      maxWidth: esPantallaPequena ? '100vw' : '1650px',
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
      boxSizing: 'border-box',
      transition: 'width 0.22s ease',
      overflow: 'hidden'
    }}>
      {/* ================================================================= */}
      {/* 1. CABECERA FIJA Y PERSISTENTE DEL VISOR (STICKY HEADER) */}
      {/* ================================================================= */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '14px 20px',
        borderBottom: theme.border,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: temaOscuro ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        flexWrap: 'wrap',
        gap: '12px',
        flexShrink: 0
      }}>
        {/* Información del Paciente y Archivo */}
        <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {obtenerIconoArchivo(nombreArchivoMostrado)}
            <h3 style={{
              margin: 0,
              fontSize: '15px',
              color: theme.textMain,
              fontWeight: '800',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '320px'
            }} title={nombreArchivoMostrado}>
              {pacienteFinal?.nombre ? pacienteFinal.nombre : nombreArchivoMostrado}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: theme.textMuted }}>
              DNI: <strong style={{
                color: temaOscuro ? '#7dd3fc' : '#0369a1',
                backgroundColor: temaOscuro ? '#082f49' : '#f0f9ff',
                padding: '1px 7px',
                borderRadius: '5px',
                border: `1px solid ${temaOscuro ? '#0284c7' : '#bae6fd'}`
              }}>
                {documentoEnVista.paciente_dni || pacienteFinal?.dni || 'Sin DNI'}
              </strong>
            </span>

            {/* Badge permanente de Alergias en la cabecera fija */}
            {pacienteFinal?.alergias && !pacienteFinal.alergias.toLowerCase().includes('ninguna') && (
              <span style={{
                backgroundColor: temaOscuro ? '#451a03' : '#fffbeb',
                color: temaOscuro ? '#fcd34d' : '#b45309',
                border: temaOscuro ? '1px solid #78350f' : '1px solid #fde68a',
                padding: '1px 8px',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }} title={`Alergias detectadas: ${pacienteFinal.alergias}`}>
                <span>⚠️ {pacienteFinal.alergias}</span>
              </span>
            )}

            <span style={{ fontSize: '11.5px', color: theme.textMuted }}>
              · {documentoEnVista.fecha_subida || 'Expediente Activo'}
            </span>
          </div>
        </div>

        {/* SELECTOR DE MODO: LÍNEA DE TIEMPO / VISTA DIVIDIDA / DOCUMENTO / MANIQUÍ */}
        <div style={{
          display: 'flex',
          backgroundColor: theme.bgCard,
          borderRadius: '8px',
          padding: '3px',
          border: theme.border,
          gap: '3px'
        }}>
          {[
            { id: 'timeline', label: 'Línea de Tiempo', icon: '⏱️', desc: 'Historial cronológico completo del paciente' },
            { id: 'dividida', label: 'Vista Dividida', icon: '🪟', desc: 'Ver documento y silueta anatómica simultáneamente' },
            { id: 'documento', label: 'Solo Documento', icon: '📄', desc: 'Ver exclusivamente el documento clínico' },
            { id: 'maniqui', label: 'Solo Maniquí', icon: '🧍', desc: 'Ver exclusivamente la silueta anatómica' }
          ].map(m => {
            const activo = modoVista === m.id
            return (
              <button
                key={m.id}
                onClick={() => setModoVista(m.id)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: activo ? (temaOscuro ? '#1e293b' : '#0f172a') : 'transparent',
                  color: activo ? (temaOscuro ? '#38bdf8' : '#ffffff') : theme.textMuted,
                  fontWeight: activo ? '700' : '500',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease'
                }}
                title={m.desc}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>

        {/* Botones de Descargar y Cerrar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {documentoEnVista.id && (
            <a
              href={obtenerUrlArchivo(documentoEnVista.id)}
              download={nombreArchivoMostrado}
              style={{
                padding: '6px 13px',
                backgroundColor: theme.bgCard,
                color: theme.accentCool,
                border: theme.border,
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '11.5px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title="Descargar archivo físico original"
            >
              Descargar
            </a>
          )}
          <button
            onClick={onCerrar}
            style={{
              padding: '6px 13px',
              backgroundColor: temaOscuro ? '#3b121e' : '#fef2f2',
              color: temaOscuro ? '#fca5a5' : '#dc2626',
              border: `1px solid ${temaOscuro ? '#881337' : '#fecaca'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11.5px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Cerrar panel visor"
          >
            Cerrar ✕
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. CONTENIDO PRINCIPAL SCROLLEABLE SEGÚN MODO SELECCIONADO */}
      {/* ================================================================= */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: (esModoDividido && esPantallaPequena) ? 'column' : 'row',
        overflow: 'auto',
        backgroundColor: theme.bgApp,
        position: 'relative'
      }}>

        {/* =============================================================== */}
        {/* MODO A: LÍNEA DE TIEMPO CLÍNICA CRONOLÓGICA (TIMELINE) */}
        {/* =============================================================== */}
        {mostrarTimeline && (
          <div style={{
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            padding: '24px 28px',
            boxSizing: 'border-box'
          }}>
            <div style={{ maxWidth: '850px', margin: '0 auto' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: theme.textMain }}>
                  Línea de Tiempo del Expediente Clínico
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: theme.textMuted }}>
                  Registro histórico secuencial de documentos escaneados, diagnósticos, notas de evolución y signos vitales.
                </p>
              </div>

              {eventosLineaTiempo.length === 0 ? (
                <div style={{
                  padding: '36px',
                  textAlign: 'center',
                  backgroundColor: theme.bgCard,
                  borderRadius: '12px',
                  border: theme.border,
                  color: theme.textMuted
                }}>
                  No se registran eventos clínicos ni documentos en la carpeta de este paciente.
                </div>
              ) : (
                <div style={{ position: 'relative', paddingLeft: '32px' }}>
                  {/* Línea vertical conectora continua */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    bottom: '24px',
                    left: '11px',
                    width: '2px',
                    backgroundColor: temaOscuro ? '#1e293b' : '#e2e8f0'
                  }} />

                  {eventosLineaTiempo.map((ev) => (
                    <div key={ev.id} style={{
                      position: 'relative',
                      marginBottom: '20px'
                    }}>
                      {/* Nodo circular indicador en la línea vertical */}
                      <div style={{
                        position: 'absolute',
                        left: '-32px',
                        top: '4px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: theme.bgCard,
                        border: `2px solid ${ev.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        zIndex: 2,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        {ev.icono}
                      </div>

                      {/* Tarjeta de evento clínico */}
                      <div style={{
                        backgroundColor: theme.bgCard,
                        border: theme.border,
                        borderRadius: '12px',
                        padding: '14px 16px',
                        boxShadow: theme.shadowCard,
                        transition: 'transform 0.15s ease'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                          <div>
                            <span style={{
                              fontSize: '10.5px',
                              fontWeight: '700',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor: `${ev.color}15`,
                              color: ev.color,
                              marginRight: '6px'
                            }}>
                              {ev.tipo.toUpperCase()}
                            </span>
                            <strong style={{ fontSize: '13.5px', color: theme.textMain }}>
                              {ev.titulo}
                            </strong>
                          </div>

                          <span style={{ fontSize: '11.5px', color: theme.textMuted, fontWeight: '500' }}>
                            {ev.fecha}
                          </span>
                        </div>

                        <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '4px' }}>
                          {ev.subtitulo}
                        </div>

                        {ev.contenido && (
                          <p style={{
                            margin: '8px 0 0 0',
                            fontSize: '13px',
                            color: theme.textMain,
                            lineHeight: '1.45',
                            backgroundColor: theme.bgSubtle,
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: theme.borderSubtle
                          }}>
                            {ev.contenido}
                          </p>
                        )}

                        {ev.signoData && (
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '8px',
                            marginTop: '8px',
                            backgroundColor: theme.bgSubtle,
                            padding: '10px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: theme.textMain
                          }}>
                            <div><strong>P.A.:</strong> {ev.signoData.presion_arterial || '—'} mmHg</div>
                            <div><strong>F.C.:</strong> {ev.signoData.frecuencia_cardiaca || '—'} lpm</div>
                            <div><strong>Temp:</strong> {ev.signoData.temperatura || '—'} °C</div>
                            <div><strong>SpO2:</strong> {ev.signoData.saturacion_oxigeno || '—'}</div>
                            <div><strong>Peso:</strong> {ev.signoData.peso || '—'}</div>
                            <div><strong>Talla:</strong> {ev.signoData.talla || '—'}</div>
                            {ev.signoData.observaciones && (
                              <div style={{ gridColumn: '1 / -1', marginTop: '4px', color: theme.textMuted }}>
                                <em>Obs: {ev.signoData.observaciones}</em>
                              </div>
                            )}
                          </div>
                        )}

                        {ev.tipo === 'documento' && ev.doc && (
                          <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => {
                                if (onSeleccionarDocumento) {
                                  onSeleccionarDocumento(ev.doc)
                                }
                                setModoVista('documento')
                              }}
                              style={{
                                padding: '5px 12px',
                                backgroundColor: temaOscuro ? '#1e293b' : '#eff6ff',
                                color: temaOscuro ? '#38bdf8' : '#2563eb',
                                border: `1px solid ${temaOscuro ? '#0284c7' : '#bfdbfe'}`,
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <span>Visualizar este archivo ↗</span>
                            </button>
                            <a
                              href={`${API_BASE}/documentos/${ev.doc.id}/archivo`}
                              style={{
                                padding: '5px 12px',
                                backgroundColor: theme.bgSubtle,
                                color: theme.textSecondary,
                                border: theme.border,
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: '600',
                                textDecoration: 'none'
                              }}
                            >
                              Descargar
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* MODO B: SECTOR DOCUMENTO O RESUMEN CLÍNICO */}
        {/* =============================================================== */}
        {mostrarDoc && !mostrarTimeline && (
          <div style={{
            flex: esModoDividido ? (esPantallaPequena ? 'none' : '1 1 50%') : '1 1 100%',
            height: esModoDividido && esPantallaPequena ? '50vh' : '100%',
            minHeight: esModoDividido && esPantallaPequena ? '360px' : undefined,
            backgroundColor: documentoEnVista.id ? (temaOscuro ? '#0b111e' : '#1e293b') : theme.bgApp,
            padding: documentoEnVista.id ? '10px' : '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto',
            boxSizing: 'border-box',
            borderRight: (esModoDividido && !esPantallaPequena) ? theme.border : 'none',
            borderBottom: (esModoDividido && esPantallaPequena) ? theme.border : 'none'
          }}>
            {documentoEnVista.id ? (
              esPdf(nombreArchivoMostrado) ? (
                <iframe
                  src={obtenerUrlArchivo(documentoEnVista.id, true)}
                  title={`Visor PDF - ${nombreArchivoMostrado}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff'
                  }}
                />
              ) : esDocx(nombreArchivoMostrado) ? (
                <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                  <DocxViewer url={obtenerUrlArchivo(documentoEnVista.id, true)} />
                </div>
              ) : esImagen(nombreArchivoMostrado) ? (
                <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '16px', boxSizing: 'border-box' }}>
                  {imgError ? (
                    <div style={{ textAlign: 'center', color: theme.textMuted, padding: '24px', backgroundColor: theme.bgCard, borderRadius: '10px', border: theme.border }}>
                      <p style={{ fontSize: '15px', color: '#ef4444', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                        No se pudo cargar la vista previa de la imagen.
                      </p>
                      <p style={{ fontSize: '13px', margin: 0 }}>
                        Puedes usar el botón "Descargar" arriba.
                      </p>
                    </div>
                  ) : (
                    <img
                      src={obtenerUrlArchivo(documentoEnVista.id, true)}
                      alt="Vista previa de documento"
                      onError={() => setImgError(true)}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: '6px',
                        boxShadow: theme.shadowCard
                      }}
                    />
                  )}
                </div>
              ) : esTexto(nombreArchivoMostrado) ? (
                <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                  <TextViewer url={obtenerUrlArchivo(documentoEnVista.id, true)} />
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: theme.textSecondary, padding: '30px' }}>
                  <p style={{ fontSize: '15px', marginBottom: '14px' }}>
                    Este tipo de archivo no admite previsualización directa en el navegador.
                  </p>
                  <a
                    href={obtenerUrlArchivo(documentoEnVista.id)}
                    download={nombreArchivoMostrado}
                    style={{
                      display: 'inline-block',
                      padding: '8px 18px',
                      backgroundColor: theme.primaryBtnBg,
                      color: theme.primaryBtnColor,
                      border: 'none',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '700',
                      fontSize: '13px'
                    }}
                  >
                    Descargar archivo
                  </a>
                </div>
              )
            ) : (
              /* Paciente sin archivo cargado: Ficha Digital */
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '14px', color: theme.textMain }}>
                <div style={{
                  backgroundColor: theme.bgCard,
                  borderRadius: '12px',
                  padding: '18px 20px',
                  border: theme.border,
                  boxShadow: theme.shadowCard
                }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Expediente Clínico Digital
                  </span>
                  <h3 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: '900', color: theme.textMain, letterSpacing: '-0.3px' }}>
                    {pacienteFinal?.nombre || `Historia Clínica - DNI ${documentoEnVista.paciente_dni || pacienteFinal?.dni}`}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: theme.textMuted }}>
                    Hospital San Juan de Dios de Pisco · Registro Digital Centralizado
                  </p>
                </div>

                <div style={{
                  flex: 1,
                  backgroundColor: theme.bgCard,
                  borderRadius: '12px',
                  padding: '18px 20px',
                  border: theme.border,
                  boxShadow: theme.shadowCard,
                  overflowY: 'auto'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: theme.textMain }}>
                    Notas Médicas Registradas ({notas.length})
                  </h4>
                  {notas.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: theme.textMuted, fontSize: '12.5px', backgroundColor: theme.bgSubtle, borderRadius: '8px' }}>
                      No hay notas clínicas registradas todavía para este paciente.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {notas.map((n) => (
                        <div key={n.id} style={{
                          padding: '12px 14px',
                          backgroundColor: theme.bgSubtle,
                          border: theme.borderSubtle,
                          borderRadius: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: '700', color: theme.accentCool, marginBottom: '4px' }}>
                            <span>{n.diagnostico || 'Diagnóstico General'}</span>
                            <span style={{ color: theme.textMuted }}>{n.fecha || 'Reciente'}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '12.5px', color: theme.textMain, lineHeight: '1.4' }}>
                            {n.contenido}
                          </p>
                          <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '6px', textAlign: 'right' }}>
                            Dr(a). {n.medico_nombre || 'Médico de Turno'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <h4 style={{ margin: '20px 0 10px 0', fontSize: '14px', fontWeight: '800', color: theme.textMain }}>
                    Último Registro de Triaje
                  </h4>
                  {ultimoSigno ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                      backgroundColor: theme.bgSubtle,
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: theme.borderSubtle,
                      fontSize: '12px',
                      color: theme.textMain
                    }}>
                      <div><strong>PA:</strong> {ultimoSigno.presion_arterial || '—'} mmHg</div>
                      <div><strong>FC:</strong> {ultimoSigno.frecuencia_cardiaca || '—'} lpm</div>
                      <div><strong>SpO2:</strong> {ultimoSigno.saturacion_oxigeno || '—'}</div>
                      <div><strong>Temp:</strong> {ultimoSigno.temperatura || '—'} °C</div>
                    </div>
                  ) : (
                    <div style={{ padding: '14px', textAlign: 'center', color: theme.textMuted, fontSize: '12px', backgroundColor: theme.bgSubtle, borderRadius: '8px' }}>
                      Sin tomas de signos vitales recientes.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =============================================================== */}
        {/* MODO C: SECTOR DERECHO: MANIQUÍ ANATÓMICO */}
        {/* =============================================================== */}
        {mostrarManiqui && !mostrarTimeline && (
          <div style={{
            flex: esModoDividido ? '1 1 50%' : '1 1 100%',
            height: '100%',
            overflowY: 'auto',
            padding: '10px',
            boxSizing: 'border-box',
            backgroundColor: theme.bgApp
          }}>
            <ManiquiAnatomico
              paciente={pacienteFinal}
              documentoActual={documentoEnVista}
              modoCompacto={esModoDividido}
            />
          </div>
        )}

      </div>
    </aside>
  )
}
