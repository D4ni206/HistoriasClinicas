import { useState } from 'react'
import { Card } from '@heroui/react'
import { esPdf, esDocx, esImagen, esTexto, obtenerIconoArchivo } from '../utils/fileHelpers'
import { API_BASE } from '../api/config'

export default function PacienteCard({
  paciente,
  onVerDocumento,
  onVerSilueta,
  onAgregarArchivo,
  onAbrirNotas,
  onVerCarpeta,
  onEliminar
}) {
  const [expandido, setExpandido] = useState(false)

  if (!paciente) return null

  const docs = paciente.documentos || []
  const countPdfs = docs.filter(d => esPdf(d.nombre_archivo)).length
  const countDocx = docs.filter(d => esDocx(d.nombre_archivo)).length
  const countImg = docs.filter(d => esImagen(d.nombre_archivo)).length
  const countTxt = docs.filter(d => esTexto(d.nombre_archivo)).length

  const totalNotas = paciente.total_notas ?? (paciente.notas_medicas ? paciente.notas_medicas.length : 0)

  // Documentos a mostrar: si está expandido muestra todos, de lo contrario los primeros 3
  const docsAMostrar = expandido ? docs : docs.slice(0, 3)

  // Acción para abrir la historia clínica dividida con la silueta anatómica
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
      className="w-full"
      style={{
        backgroundColor: '#18181b',
        color: '#ffffff',
        border: '1px solid #27272a',
        borderRadius: '24px',
        padding: '22px 20px',
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.38)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        boxSizing: 'border-box'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.borderColor = '#3f3f46'
        e.currentTarget.style.boxShadow = '0 16px 36px -4px rgba(0, 0, 0, 0.55)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = '#27272a'
        e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(0, 0, 0, 0.38)'
      }}
    >
      <Card.Header style={{ padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Fila Superior: Icono Circular Interactivo y Total de Documentos */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            onClick={abrirHistoriaClinica}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#27272a',
              border: '1.5px solid rgba(127, 214, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Ver historia clínica y silueta anatómica de este paciente"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7FD6FF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>

          <span style={{
            fontSize: '11.5px',
            fontWeight: '700',
            padding: '3px 10px',
            borderRadius: '12px',
            backgroundColor: docs.length > 0 ? '#6FE3B4' : '#FFD6E8',
            color: docs.length > 0 ? '#0a5438' : '#802048',
            border: docs.length > 0 ? '1px solid #4cc799' : '1px solid #f4a7c7',
            whiteSpace: 'nowrap'
          }}>
            {docs.length} doc{docs.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Título y Subtítulo estilo HeroUI */}
        <div>
          <Card.Title style={{
            fontSize: '17px',
            fontWeight: '800',
            color: '#ffffff',
            letterSpacing: '-0.01em',
            margin: 0,
            lineHeight: '1.25'
          }}>
            DNI: {paciente.dni}
          </Card.Title>
          <Card.Description style={{
            fontSize: '13px',
            color: '#94a3b8',
            fontWeight: '500',
            marginTop: '4px',
            margin: 0,
            lineHeight: '1.4'
          }}>
            Expediente #{paciente.id}
          </Card.Description>
        </div>

        {/* Badges de desglose de formatos */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {countDocx > 0 && (
            <span style={{
              backgroundColor: '#7FD6FF',
              color: '#104060',
              border: '1px solid #54bde8',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: '800'
            }}>
              {countDocx} DOCX
            </span>
          )}
          {countPdfs > 0 && (
            <span style={{
              backgroundColor: '#FFD6E8',
              color: '#802048',
              border: '1px solid #f4a7c7',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: '800'
            }}>
              {countPdfs} PDF
            </span>
          )}
          {countImg > 0 && (
            <span style={{
              backgroundColor: '#6FE3B4',
              color: '#0a5438',
              border: '1px solid #4cc799',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: '800'
            }}>
              {countImg} IMG
            </span>
          )}
          {countTxt > 0 && (
            <span style={{
              backgroundColor: '#27272a',
              color: '#f1f5f9',
              border: '1px solid #3f3f46',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: '800'
            }}>
              {countTxt} TXT
            </span>
          )}
          {docs.length === 0 && (
            <span style={{ fontSize: '11px', color: '#71717a', fontStyle: 'italic' }}>
              Sin archivos adjuntos
            </span>
          )}
        </div>
      </Card.Header>

      <Card.Content style={{ padding: '14px 0', flex: 1 }}>
        {/* Caja Central: CONTENIDO RECIENTE */}
        <div style={{
          backgroundColor: '#202024',
          border: '1px solid #2e2e36',
          borderRadius: '14px',
          padding: '12px 14px'
        }}>
          <div style={{
            textAlign: 'center',
            fontSize: '11px',
            fontWeight: '800',
            color: '#94a3b8',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            CONTENIDO RECIENTE:
          </div>

          {docs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#71717a',
              fontSize: '12px',
              padding: '8px 0',
              fontStyle: 'italic'
            }}>
              No hay documentos cargados
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {docsAMostrar.map((d) => (
                <div
                  key={d.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    {obtenerIconoArchivo(d.nombre_archivo)}
                  </div>

                  <span
                    style={{
                      fontSize: '12px',
                      color: '#e2e8f0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      fontWeight: '500'
                    }}
                    title={d.nombre_archivo}
                  >
                    {d.nombre_archivo}
                  </span>

                  {/* Botones de Acción por Documento: Ver (Ojo) y Descargar (Flecha) */}
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {/* Botón Ver con icono de ojo */}
                    <button
                      onClick={() => {
                        if (onVerDocumento) {
                          onVerDocumento({
                            ...d,
                            paciente: paciente
                          })
                        }
                      }}
                      style={{
                        backgroundColor: '#6FE3B4',
                        color: '#0a5438',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'opacity 0.15s ease'
                      }}
                      title="Ver historia clínica y silueta anatómica"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>Ver</span>
                    </button>

                    {/* Botón Descargar con icono de flecha hacia abajo a bandeja */}
                    {d.id && (
                      <a
                        href={`${API_BASE}/documentos/${d.id}/archivo`}
                        download
                        style={{
                          backgroundColor: '#7FD6FF',
                          color: '#104060',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'opacity 0.15s ease'
                        }}
                        title="Descargar archivo físico"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span>Bajar</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {docs.length > 3 && (
                <div
                  onClick={() => setExpandido(!expandido)}
                  style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#7FD6FF',
                    cursor: 'pointer',
                    marginTop: '4px',
                    padding: '2px 0'
                  }}
                >
                  {expandido ? 'Ver menos' : `+${docs.length - 3} archivo(s) más`}
                </div>
              )}
            </div>
          )}
        </div>
      </Card.Content>

      {/* Footer con 4 Botones y Figuras Intuitivas (Subir, Notas, Historia, Tacho de Basura) */}
      <Card.Footer style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px',
        width: '100%',
        padding: '6px 0 0 0'
      }}>
        {/* 1. Botón Subir Archivo (Icono de documento con +) */}
        <button
          onClick={() => onAgregarArchivo && onAgregarArchivo(paciente.dni, paciente.id)}
          style={{
            backgroundColor: '#7FD6FF',
            color: '#104060',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 4px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            minHeight: '44px',
            transition: 'opacity 0.15s ease'
          }}
          title="Subir nuevo documento a este expediente"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <span style={{ fontSize: '10px', marginTop: '3px' }}>+ Archivo</span>
        </button>

        {/* 2. Botón Notas Médicas (Icono de libreta médica con lápiz) */}
        <button
          onClick={() => onAbrirNotas && onAbrirNotas(paciente)}
          style={{
            backgroundColor: '#27272a',
            color: '#f8fafc',
            border: '1px solid #3f3f46',
            borderRadius: '8px',
            padding: '6px 4px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '700',
            minHeight: '44px',
            transition: 'background-color 0.15s ease'
          }}
          title="Ver y redactar notas médicas"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span style={{ fontSize: '10px', marginTop: '3px' }}>Notas ({totalNotas})</span>
        </button>

        {/* 3. Botón Ver Historia con Silueta Anatómica (Icono de Ojo / Pulso Clínico) */}
        <button
          onClick={abrirHistoriaClinica}
          style={{
            backgroundColor: '#27272a',
            color: '#6FE3B4',
            border: '1.5px solid #4cc799',
            borderRadius: '8px',
            padding: '6px 4px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '700',
            minHeight: '44px',
            transition: 'background-color 0.15s ease'
          }}
          title="Ver historia clínica y silueta anatómica en sector dividido"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span style={{ fontSize: '10px', marginTop: '3px' }}>Historia</span>
        </button>

        {/* 4. Botón Eliminar con Tacho de Basura */}
        <button
          onClick={() => onEliminar && onEliminar(paciente.id, paciente.dni)}
          style={{
            backgroundColor: '#FFD6E8',
            color: '#802048',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 4px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '700',
            minHeight: '44px',
            transition: 'opacity 0.15s ease'
          }}
          title="Eliminar expediente clínico"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          <span style={{ fontSize: '10px', marginTop: '3px' }}>Eliminar</span>
        </button>
      </Card.Footer>
    </Card>
  )
}
