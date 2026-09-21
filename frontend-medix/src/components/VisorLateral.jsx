import { useState, useEffect } from 'react'
import DocxViewer from './DocxViewer'
import TextViewer from './TextViewer'
import ManiquiAnatomico from './ManiquiAnatomico'
import { esPdf, esDocx, esImagen, esTexto, obtenerIconoArchivo } from '../utils/fileHelpers'
import { API_BASE } from '../api/config'

export default function VisorLateral({ documentoEnVista, paciente, onCerrar }) {
  const [imgError, setImgError] = useState(false)
  // 'dividida' (documento + maniquí), 'documento' (solo archivo), 'maniqui' (solo silueta)
  const [modoVista, setModoVista] = useState('dividida')

  useEffect(() => {
    setImgError(false)
  }, [documentoEnVista?.id])

  if (!documentoEnVista) return null

  const esModoDividido = modoVista === 'dividida'
  const mostrarDoc = modoVista === 'dividida' || modoVista === 'documento'
  const mostrarManiqui = modoVista === 'dividida' || modoVista === 'maniqui'

  // Ancho dinámico del panel visor: más amplio en modo dividido para acomodar ambos sectores cómodamente
  const anchoVisor = esModoDividido ? '84%' : (modoVista === 'maniqui' ? '65%' : '50%')
  const minAncho = esModoDividido ? '920px' : '480px'

  const pacienteFinal = paciente || documentoEnVista.paciente || null
  const notas = pacienteFinal?.notas_medicas || []
  const signos = pacienteFinal?.signos_vitales || []
  const ultimoSigno = signos.length > 0 ? signos[0] : null

  return (
    <aside style={{
      width: anchoVisor,
      minWidth: minAncho,
      maxWidth: '1600px',
      flexShrink: 0,
      height: '100vh',
      backgroundColor: '#ffffff',
      borderLeft: '2.5px solid #7FD6FF',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-8px 0 32px rgba(43, 74, 102, 0.22)',
      zIndex: 30,
      boxSizing: 'border-box',
      transition: 'width 0.22s ease'
    }}>
      {/* 1. CABECERA DEL PANEL CON SELECTOR DE VISTAS */}
      <div style={{
        padding: '12px 18px',
        borderBottom: '2px solid #7FD6FF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF6FB',
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
              color: '#2B4A66',
              fontWeight: '800',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '300px'
            }} title={documentoEnVista.nombre_archivo}>
              {documentoEnVista.nombre_archivo}
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            Expediente DNI: <strong style={{ color: '#0a5438', backgroundColor: '#6FE3B4', padding: '1px 7px', borderRadius: '4px', border: '1px solid #4cc799' }}>{documentoEnVista.paciente_dni || pacienteFinal?.dni || 'Sin DNI'}</strong> | {documentoEnVista.fecha_subida || 'Expediente Activo'}
          </p>
        </div>

        {/* SELECTOR DE MODO: VISTA DIVIDIDA / DOCUMENTO / MANIQUÍ */}
        <div style={{
          display: 'flex',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '3px',
          border: '1.5px solid #7FD6FF',
          gap: '4px'
        }}>
          <button
            onClick={() => setModoVista('dividida')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: modoVista === 'dividida' ? '#6FE3B4' : 'transparent',
              color: modoVista === 'dividida' ? '#0a5438' : '#64748b',
              fontWeight: modoVista === 'dividida' ? '700' : '500',
              fontSize: '11.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
            title="Ver el documento escaneado y la silueta anatómica simultáneamente en el mismo sector dividido"
          >
            <span>Vista Dividida</span>
          </button>

          <button
            onClick={() => setModoVista('documento')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: modoVista === 'documento' ? '#7FD6FF' : 'transparent',
              color: modoVista === 'documento' ? '#104060' : '#64748b',
              fontWeight: modoVista === 'documento' ? '700' : '500',
              fontSize: '11.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
            title="Ver exclusivamente el documento clínico"
          >
            <span>Solo Documento</span>
          </button>

          <button
            onClick={() => setModoVista('maniqui')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: modoVista === 'maniqui' ? '#2B4A66' : 'transparent',
              color: modoVista === 'maniqui' ? '#ffffff' : '#64748b',
              fontWeight: modoVista === 'maniqui' ? '700' : '500',
              fontSize: '11.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
            title="Ver exclusivamente la silueta anatómica y el mapa de síntomas"
          >
            <span>Solo Maniquí</span>
          </button>
        </div>

        {/* Botones de Descargar y Cerrar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {documentoEnVista.id && (
            <a
              href={`${API_BASE}/documentos/${documentoEnVista.id}/archivo`}
              style={{
                padding: '6px 12px',
                backgroundColor: '#7FD6FF',
                color: '#104060',
                border: '1px solid #54bde8',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '700'
              }}
              title="Descargar archivo físico"
            >
              Descargar
            </a>
          )}
          <button
            onClick={onCerrar}
            style={{
              padding: '6px 12px',
              backgroundColor: '#FFD6E8',
              color: '#802048',
              border: '1px solid #f4a7c7',
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
        flexDirection: 'row',
        overflow: 'hidden',
        backgroundColor: '#f1f5f9'
      }}>

        {/* SECTOR IZQUIERDO: DOCUMENTO O RESUMEN CLÍNICO */}
        {mostrarDoc && (
          <div style={{
            flex: esModoDividido ? '1 1 50%' : '1 1 100%',
            height: '100%',
            backgroundColor: documentoEnVista.id ? '#1e293b' : '#f8fafc',
            padding: documentoEnVista.id ? '10px' : '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto',
            boxSizing: 'border-box',
            borderRight: esModoDividido ? '2.5px solid #7FD6FF' : 'none'
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
                    borderRadius: '6px',
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
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: '15px', color: '#e53e3e', fontWeight: 'bold', margin: '0 0 8px 0' }}>
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
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                      }}
                    />
                  )}
                </div>
              ) : esTexto(documentoEnVista.nombre_archivo) ? (
                <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                  <TextViewer url={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`} />
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#f3f4f6', padding: '30px' }}>
                  <p style={{ fontSize: '15px', marginBottom: '12px' }}>
                    Este tipo de archivo no admite previsualización directa en el navegador.
                  </p>
                  <a
                    href={`${API_BASE}/documentos/${documentoEnVista.id}/archivo`}
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      backgroundColor: '#7FD6FF',
                      color: '#104060',
                      border: '1px solid #54bde8',
                      borderRadius: '6px',
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
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '14px', color: '#2B4A66' }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1.5px solid #FFD6E8',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#802048', textTransform: 'uppercase' }}>
                    Expediente Clínico Digital
                  </span>
                  <h3 style={{ margin: '4px 0 2px 0', fontSize: '18px', fontWeight: '900', color: '#2B4A66' }}>
                    Historia Clínica - DNI {documentoEnVista.paciente_dni || pacienteFinal?.dni}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    Hospital San Juan de Dios de Pisco · Registro Digital Centralizado
                  </p>
                </div>

                {/* Notas Médicas Registradas */}
                <div style={{
                  flex: 1,
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1.5px solid #7FD6FF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  overflowY: 'auto'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800', color: '#104060' }}>
                    Notas Médicas Registradas ({notas.length})
                  </h4>
                  {notas.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                      No hay notas clínicas registradas todavía para este paciente.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {notas.map((n) => (
                        <div key={n.id} style={{
                          padding: '10px 12px',
                          backgroundColor: '#FFF6FB',
                          border: '1px solid #FFD6E8',
                          borderRadius: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#802048', marginBottom: '4px' }}>
                            <span>{n.diagnostico || 'Diagnóstico General'}</span>
                            <span style={{ color: '#64748b' }}>{n.fecha || 'Reciente'}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '12px', color: '#2B4A66', lineHeight: '1.35' }}>
                            {n.contenido}
                          </p>
                          <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '4px', textAlign: 'right' }}>
                            Dr(a). {n.medico_nombre || 'Médico de Turno'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Historial de Signos Vitales */}
                  <h4 style={{ margin: '18px 0 8px 0', fontSize: '14px', fontWeight: '800', color: '#104060' }}>
                    Último Registro de Triaje
                  </h4>
                  {ultimoSigno ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                      backgroundColor: '#f8fafc',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px'
                    }}>
                      <div><strong>PA:</strong> {ultimoSigno.presion_arterial || '—'} mmHg</div>
                      <div><strong>FC:</strong> {ultimoSigno.frecuencia_cardiaca || '—'} lpm</div>
                      <div><strong>SpO2:</strong> {ultimoSigno.saturacion_oxigeno || '—'}</div>
                      <div><strong>Temp:</strong> {ultimoSigno.temperatura || '—'} °C</div>
                    </div>
                  ) : (
                    <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
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
            backgroundColor: '#f8fafc'
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
