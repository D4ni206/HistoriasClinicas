import { useState } from 'react'
import { Card } from '@heroui/react'
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
        {/* Fila Superior: Icono Circular HeroUI (como el $ de Acme Creator) y Total de Documentos */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#27272a',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}>
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

        {/* Título y Subtítulo estilo HeroUI ("Become an Acme Creator!") */}
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

                  <button
                    onClick={() => onVerDocumento && onVerDocumento(d)}
                    style={{
                      backgroundColor: '#6FE3B4',
                      color: '#0a5438',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '3px 10px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'opacity 0.15s ease'
                    }}
                    title="Ver archivo en el panel derecho"
                  >
                    Ver
                  </button>
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

      <Card.Footer style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px',
        width: '100%',
        padding: '6px 0 0 0'
      }}>
        {/* 1. + Archivo */}
        <button
          onClick={() => onAgregarArchivo && onAgregarArchivo(paciente.dni, paciente.id)}
          style={{
            backgroundColor: '#7FD6FF',
            color: '#104060',
            border: 'none',
            borderRadius: '8px',
            padding: '7px 4px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            minHeight: '38px',
            transition: 'opacity 0.15s ease'
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
            backgroundColor: '#27272a',
            color: '#f8fafc',
            border: '1px solid #3f3f46',
            borderRadius: '8px',
            padding: '7px 4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '700',
            minHeight: '38px',
            transition: 'background-color 0.15s ease'
          }}
          title="Ver y redactar notas médicas"
        >
          Notas ({totalNotas})
        </button>

        {/* 3. Ver Carpeta */}
        <button
          onClick={() => {
            setExpandido(!expandido)
            if (onVerCarpeta) onVerCarpeta(paciente)
          }}
          style={{
            backgroundColor: '#27272a',
            color: '#f8fafc',
            border: '1px solid #3f3f46',
            borderRadius: '8px',
            padding: '7px 4px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '700',
            lineHeight: '1.2',
            minHeight: '38px',
            transition: 'background-color 0.15s ease'
          }}
          title={expandido ? "Ocultar documentos adicionales" : "Ver todos los documentos del expediente"}
        >
          <span>{expandido ? 'Cerrar' : 'Ver'}</span>
          <span>Carpeta</span>
        </button>

        {/* 4. Borrar */}
        <button
          onClick={() => onEliminar && onEliminar(paciente.id, paciente.dni)}
          style={{
            backgroundColor: '#FFD6E8',
            color: '#802048',
            border: 'none',
            borderRadius: '8px',
            padding: '7px 4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '700',
            minHeight: '38px',
            transition: 'opacity 0.15s ease'
          }}
          title="Eliminar expediente clínico"
        >
          Borrar
        </button>
      </Card.Footer>
    </Card>
  )
}
