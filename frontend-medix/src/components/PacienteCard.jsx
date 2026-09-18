import { useState } from 'react'
import { esPdf, esDocx, esImagen, esTexto, obtenerIconoArchivo } from '../utils/fileHelpers'

export default function PacienteCard({
  paciente,
  onVerDocumento,
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

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1.5px solid #7FD6FF',
        borderRadius: '18px',
        padding: '20px 18px',
        boxShadow: '0 4px 16px rgba(127, 214, 255, 0.18)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        boxSizing: 'border-box'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(127, 214, 255, 0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(127, 214, 255, 0.18)'
      }}
    >
      <div>
        {/* Fila Superior: Icono de Carpeta, DNI, Expediente y Badge Total */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Icono de Carpeta en cuadro celeste */}
            <div style={{
              width: '42px',
              height: '42px',
              minWidth: '42px',
              borderRadius: '10px',
              backgroundColor: '#7FD6FF',
              color: '#2B4A66',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(127, 214, 255, 0.35)'
            }}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2B4A66"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>

            {/* DNI y Número de Expediente */}
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: '800',
                color: '#2B4A66',
                lineHeight: '1.2'
              }}>
                DNI: {paciente.dni}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '600',
                marginTop: '3px'
              }}>
                Expediente #{paciente.id}
              </div>
            </div>
          </div>

          {/* Pastilla Verde/Rosa con total de documentos */}
          <span style={{
            fontSize: '12px',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '14px',
            backgroundColor: docs.length > 0 ? '#6FE3B4' : '#FFD6E8',
            color: docs.length > 0 ? '#0a5438' : '#802048',
            border: docs.length > 0 ? '1px solid #4cc799' : '1px solid #f4a7c7',
            whiteSpace: 'nowrap'
          }}>
            {docs.length} doc{docs.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Fila de Resumen por Tipo (1 DOCX, 2 PDF, etc.) */}
        <div style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          marginBottom: '14px'
        }}>
          {countDocx > 0 && (
            <span style={{
              backgroundColor: '#7FD6FF',
              color: '#104060',
              border: '1px solid #54bde8',
              borderRadius: '6px',
              padding: '3px 8px',
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
              padding: '3px 8px',
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
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: '800'
            }}>
              {countImg} IMG
            </span>
          )}
          {countTxt > 0 && (
            <span style={{
              backgroundColor: '#FFF6FB',
              color: '#2B4A66',
              border: '1px solid #e2c5d5',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: '800'
            }}>
              {countTxt} TXT
            </span>
          )}
          {docs.length === 0 && (
            <span style={{
              fontSize: '11px',
              color: '#94a3b8',
              fontStyle: 'italic'
            }}>
              Sin archivos adjuntos
            </span>
          )}
        </div>

        {/* Caja Central: CONTENIDO RECIENTE */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #eef2f6',
          borderRadius: '12px',
          padding: '12px 14px',
          marginBottom: '16px'
        }}>
          <div style={{
            textAlign: 'center',
            fontSize: '11px',
            fontWeight: '800',
            color: '#475569',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            CONTENIDO RECIENTE:
          </div>

          {docs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#94a3b8',
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
                  {/* Pastilla identificadora del tipo */}
                  <div style={{ flexShrink: 0 }}>
                    {obtenerIconoArchivo(d.nombre_archivo)}
                  </div>

                  {/* Nombre de archivo truncado */}
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#334155',
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

                  {/* Botón Ver (Verde) */}
                  <button
                    onClick={() => onVerDocumento && onVerDocumento(d)}
                    style={{
                      backgroundColor: '#6FE3B4',
                      color: '#0a5438',
                      border: '1px solid #4cc799',
                      borderRadius: '5px',
                      padding: '3px 10px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'background-color 0.15s ease'
                    }}
                    title="Ver archivo en el panel derecho"
                  >
                    Ver
                  </button>
                </div>
              ))}

              {/* Si hay más de 3 documentos, permitir alternar expansión */}
              {docs.length > 3 && (
                <div
                  onClick={() => setExpandido(!expandido)}
                  style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#2B4A66',
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
      </div>

      {/* Fila Inferior de Botones de Acción (4 botones) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px',
        paddingTop: '6px'
      }}>
        {/* 1. + Archivo */}
        <button
          onClick={() => onAgregarArchivo && onAgregarArchivo(paciente.dni, paciente.id)}
          style={{
            backgroundColor: '#7FD6FF',
            color: '#104060',
            border: '1px solid #54bde8',
            borderRadius: '7px',
            padding: '7px 4px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            minHeight: '38px'
          }}
          title="Subir nuevo documento a este expediente"
        >
          <span style={{ fontSize: '12px', lineHeight: '1' }}>+</span>
          <span style={{ fontSize: '10.5px' }}>Archivo</span>
        </button>

        {/* 2. Notas */}
        <button
          onClick={() => onAbrirNotas && onAbrirNotas(paciente)}
          style={{
            backgroundColor: '#ffffff',
            color: '#2B4A66',
            border: '1.5px solid #cbd5e1',
            borderRadius: '7px',
            padding: '7px 4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '700',
            minHeight: '38px'
          }}
          title="Ver y redactar notas médicas"
        >
          Notas ({totalNotas})
        </button>

        {/* 3. Ver Carpeta */}
        <button
          onClick={() => onVerCarpeta && onVerCarpeta(paciente)}
          style={{
            backgroundColor: '#ffffff',
            color: '#2B4A66',
            border: '1.5px solid #cbd5e1',
            borderRadius: '7px',
            padding: '7px 4px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '700',
            lineHeight: '1.2',
            minHeight: '38px'
          }}
          title="Abrir vista detallada de la carpeta"
        >
          <span>Ver</span>
          <span>Carpeta</span>
        </button>

        {/* 4. Borrar */}
        <button
          onClick={() => onEliminar && onEliminar(paciente.id, paciente.dni)}
          style={{
            backgroundColor: '#FFD6E8',
            color: '#802048',
            border: '1px solid #f4a7c7',
            borderRadius: '7px',
            padding: '7px 4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '700',
            minHeight: '38px'
          }}
          title="Eliminar expediente clínico"
        >
          Borrar
        </button>
      </div>
    </div>
  )
}
