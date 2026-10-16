import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import DocxViewer from './DocxViewer'
import TextViewer from './TextViewer'
import ManiquiAnatomico from './ManiquiAnatomico'
import { esPdf, esDocx, esImagen, esTexto, obtenerIconoArchivo } from '../utils/fileHelpers'
import { API_BASE } from '../api/config'

export default function VisorLateral({ documentoEnVista, paciente, onCerrar }) {
  const { temaOscuro, theme } = useTheme()
  const [imgError, setImgError] = useState(false)
  // 'dividida' (documento + maniquí), 'documento' (solo archivo), 'maniqui' (solo silueta)
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

  // Ancho dinámico del panel visor adaptable a cualquier resolución
  const anchoVisor = esPantallaPequena ? '100vw' : (esModoDividido ? '84%' : (modoVista === 'maniqui' ? '65%' : '50%'))
  const minAncho = esPantallaPequena ? '0' : (esModoDividido ? '680px' : '400px')

  const pacienteFinal = paciente || documentoEnVista.paciente || null
  const notas = pacienteFinal?.notas_medicas || []
  const signos = pacienteFinal?.signos_vitales || []
  const ultimoSigno = signos.length > 0 ? signos[0] : null

  return (
    <aside style={{
      width: anchoVisor,
      minWidth: minAncho,
      maxWidth: esPantallaPequena ? '100vw' : '1600px',
      flexShrink: 0,
      height: '100vh',
      backgroundColor: theme.bgCard,
      borderLeft: esPantallaPequena ? 'none' : theme.border,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: theme.shadowCard,
      zIndex: esPantallaPequena ? 120 : 30,
      position: esPantallaPequena ? 'fixed' : 'relative',
      top: 0,
      right: 0,
      bottom: 0,
      left: esPantallaPequena ? 0 : undefined,
      boxSizing: 'border-box',
      transition: 'width 0.22s ease'
    }}>
      {/* 1. CABECERA DEL PANEL CON SELECTOR DE VISTAS */}
      <div style={{
        padding: '14px 20px',
        borderBottom: theme.border,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.bgSubtle,
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Info del Documento y Paciente */}
        <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {obtenerIconoArchivo(documentoEnVista.nombre_archivo)}
            <h3 style={{
              margin: 0,
              fontSize: '15px',
              color: theme.textMain,
              fontWeight: '800',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '300px'
            }} title={documentoEnVista.nombre_archivo}>
              {documentoEnVista.nombre_archivo}
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: theme.textMuted }}>
            Expediente DNI: <strong style={{
              color: temaOscuro ? '#7dd3fc' : '#0369a1',
              backgroundColor: temaOscuro ? '#082f49' : '#f0f9ff',
              padding: '2px 8px',
              borderRadius: '6px',
              border: `1px solid ${temaOscuro ? '#0284c7' : '#bae6fd'}`
            }}>
              {documentoEnVista.paciente_dni || pacienteFinal?.dni || 'Sin DNI'}
            </strong> | {documentoEnVista.fecha_subida || 'Expediente Activo'}
          </p>
        </div>

        {/* SELECTOR DE MODO: VISTA DIVIDIDA / DOCUMENTO / MANIQUÍ */}
        <div style={{
          display: 'flex',
          backgroundColor: theme.bgCard,
          borderRadius: '8px',
          padding: '3px',
          border: theme.border,
          gap: '4px'
        }}>
          {[
            { id: 'dividida', label: 'Vista Dividida', desc: 'Ver documento y silueta anatómica simultáneamente' },
            { id: 'documento', label: 'Solo Documento', desc: 'Ver exclusivamente el documento clínico' },
            { id: 'maniqui', label: 'Solo Maniquí', desc: 'Ver exclusivamente la silueta anatómica' }
          ].map(m => {
            const activo = modoVista === m.id
            return (
              <button
                key={m.id}
                onClick={() => setModoVista(m.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: activo ? (temaOscuro ? '#1e293b' : '#0f172a') : 'transparent',
                  color: activo ? (temaOscuro ? '#38bdf8' : '#ffffff') : theme.textMuted,
                  fontWeight: activo ? '700' : '500',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease'
                }}
                title={m.desc}
              >
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>

        {/* Botones de Descargar y Cerrar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {documentoEnVista.id && (
            <a
              href={`${API_BASE}/documentos/${documentoEnVista.id}/archivo`}
              style={{
                padding: '6px 14px',
                backgroundColor: theme.bgCard,
                color: theme.accentCool,
                border: theme.border,
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title="Descargar archivo físico"
            >
              Descargar
            </a>
          )}
          <button
            onClick={onCerrar}
            style={{
              padding: '6px 14px',
              backgroundColor: temaOscuro ? '#3b121e' : '#fef2f2',
              color: temaOscuro ? '#fca5a5' : '#dc2626',
              border: `1px solid ${temaOscuro ? '#881337' : '#fecaca'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
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

      {/* 2. CONTENEDOR CENTRAL: ÁREA EN EL MISMO SECTOR DIVIDIDO */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: (esModoDividido && esPantallaPequena) ? 'column' : 'row',
        overflow: 'auto',
        backgroundColor: theme.bgApp
      }}>

        {/* SECTOR IZQUIERDO: DOCUMENTO O RESUMEN CLÍNICO */}
        {mostrarDoc && (
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
              esPdf(documentoEnVista.nombre_archivo) ? (
                <iframe
                  src={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`}
                  title={`Visor PDF - ${documentoEnVista.nombre_archivo}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff'
                  }}
                />
              ) : esDocx(documentoEnVista.nombre_archivo) ? (
                <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                  <DocxViewer url={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`} />
                </div>
              ) : esImagen(documentoEnVista.nombre_archivo) ? (
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
                      src={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`}
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
              ) : esTexto(documentoEnVista.nombre_archivo) ? (
                <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                  <TextViewer url={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`} />
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: theme.textSecondary, padding: '30px' }}>
                  <p style={{ fontSize: '15px', marginBottom: '14px' }}>
                    Este tipo de archivo no admite previsualización directa en el navegador.
                  </p>
                  <a
                    href={`${API_BASE}/documentos/${documentoEnVista.id}/archivo`}
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
              /* Paciente sin archivo PDF cargado todavía: Mostrar Ficha Clínica Digital */
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
                    Historia Clínica - DNI {documentoEnVista.paciente_dni || pacienteFinal?.dni}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: theme.textMuted }}>
                    Hospital San Juan de Dios de Pisco · Registro Digital Centralizado
                  </p>
                </div>

                {/* Notas Médicas Registradas */}
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

                  {/* Historial de Signos Vitales */}
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

        {/* SECTOR DERECHO: MANIQUÍ ANATÓMICO (EN EL MISMO SECTOR DIVIDIDO) */}
        {mostrarManiqui && (
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
