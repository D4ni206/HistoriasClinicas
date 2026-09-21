import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerIconoArchivo, esPdf, esDocx, esImagen, esTexto } from '../utils/fileHelpers'
import { API_BASE } from '../api/config'
import NotasMedicasModal from '../components/NotasMedicasModal'
import PacienteCard from '../components/PacienteCard'

export default function DashboardView({
  pacientes,
  pacientesFiltrados,
  todosLosDocumentos,
  documentosFiltradosTabla,
  totalPdfs,
  totalDocx,
  totalImagenes,
  totalTextos,
  totalArchivosSistema,
  busquedaDni,
  setBusquedaDni,
  vistaDashboard,
  setVistaDashboard,
  filtroTipoDoc,
  setFiltroTipoDoc,
  carpetasAbiertas,
  setCarpetasAbiertas,
  toggleCarpeta,
  expandirTodas,
  colapsarTodas,
  agregarArchivoACarpeta,
  editandoPaciente,
  setEditandoPaciente,
  nuevoDni,
  setNuevoDni,
  handleGuardarDni,
  handleEliminarPaciente,
  handleEliminarDocumento,
  documentoEnVista,
  setDocumentoEnVista,
  onVerSilueta,
  loading,
  cargarDatos,
  usuario
}) {
  const navigate = useNavigate()
  const [pacienteParaNotas, setPacienteParaNotas] = useState(null)

  return (
    <>
      {/* Cabecera del Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#2B4A66', margin: 0 }}>
            Expedientes Clínicos Digitales
          </h2>
          <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            {(vistaDashboard === 'cards' || vistaDashboard === 'cuadricula') && (busquedaDni ? `Resultados para el DNI "${busquedaDni}": ${pacientesFiltrados.length} expedientes en tarjetas` : `Total: ${pacientesFiltrados.length} expedientes clínicos en tarjetas`)}
            {vistaDashboard === 'carpetas' && (busquedaDni ? `Resultados para el DNI "${busquedaDni}": ${pacientesFiltrados.length} carpetas` : `Total: ${pacientes.length} carpetas registradas`)}
            {vistaDashboard === 'tabla-documentos' && `Listado consolidado · ${documentosFiltradosTabla.length} de ${todosLosDocumentos.length} documentos clínicos`}
            {vistaDashboard === 'analitica' && `Estadísticas globales, distribución documental y actividad reciente`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/agregarhistoria')}
            style={{
              padding: '8px 14px',
              backgroundColor: '#6FE3B4',
              color: '#0a5438',
              border: '1px solid #4cc799',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(111, 227, 180, 0.4)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Nueva Historia</span>
          </button>

          {documentoEnVista && (
            <div style={{
              backgroundColor: '#7FD6FF',
              color: '#104060',
              border: '1px solid #54bde8',
              borderRadius: '20px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>Visor desplegado a la derecha</span>
            </div>
          )}
        </div>
      </div>

      {/* BARRA SELECTORA DE VISTAS DISTINTAS DEL DASHBOARD */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1.5px solid #7FD6FF',
        borderRadius: '10px',
        padding: '6px 10px',
        marginBottom: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
      }}>
        {/* Botonera de Vistas */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {/* 1. Vista Tarjetas / Cards */}
          <button
            onClick={() => setVistaDashboard('cards')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 14px',
              borderRadius: '6px',
              border: (vistaDashboard === 'cards' || vistaDashboard === 'carpetas' || vistaDashboard === 'cuadricula') ? '1.5px solid #4cc799' : '1px solid transparent',
              backgroundColor: (vistaDashboard === 'cards' || vistaDashboard === 'carpetas' || vistaDashboard === 'cuadricula') ? '#6FE3B4' : '#f8fafc',
              color: (vistaDashboard === 'cards' || vistaDashboard === 'carpetas' || vistaDashboard === 'cuadricula') ? '#0a5438' : '#64748b',
              fontWeight: (vistaDashboard === 'cards' || vistaDashboard === 'carpetas' || vistaDashboard === 'cuadricula') ? '700' : '600',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: (vistaDashboard === 'cards' || vistaDashboard === 'carpetas' || vistaDashboard === 'cuadricula') ? '0 2px 5px rgba(111, 227, 180, 0.4)' : 'none'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Tarjetas Clínicas (HeroUI)</span>
          </button>

          {/* 3. Vista Tabla General de Documentos */}
          <button
            onClick={() => setVistaDashboard('tabla-documentos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 14px',
              borderRadius: '6px',
              border: vistaDashboard === 'tabla-documentos' ? '1.5px solid #f4a7c7' : '1px solid transparent',
              backgroundColor: vistaDashboard === 'tabla-documentos' ? '#FFD6E8' : '#f8fafc',
              color: vistaDashboard === 'tabla-documentos' ? '#802048' : '#64748b',
              fontWeight: vistaDashboard === 'tabla-documentos' ? '700' : '600',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: vistaDashboard === 'tabla-documentos' ? '0 2px 5px rgba(255, 214, 232, 0.5)' : 'none'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>Tabla General ({todosLosDocumentos.length})</span>
          </button>

          {/* 4. Vista Analítica */}
          <button
            onClick={() => setVistaDashboard('analitica')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 14px',
              borderRadius: '6px',
              border: vistaDashboard === 'analitica' ? '1.5px solid #2B4A66' : '1px solid transparent',
              backgroundColor: vistaDashboard === 'analitica' ? '#FFF6FB' : '#f8fafc',
              color: vistaDashboard === 'analitica' ? '#2B4A66' : '#64748b',
              fontWeight: vistaDashboard === 'analitica' ? '700' : '600',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: vistaDashboard === 'analitica' ? '0 2px 5px rgba(43, 74, 102, 0.2)' : 'none'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span>Resumen Analítico</span>
          </button>
        </div>

        {/* Botón rápido de actualización */}
        <button
          onClick={() => cargarDatos(false)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '700',
            color: '#475569',
            cursor: 'pointer'
          }}
          title="Sincronizar base de datos"
        >
          Actualizar
        </button>
      </div>

      {/* =================================================================== */}
      {/* 1. VISTA PRINCIPAL: TARJETAS DE EXPEDIENTES (HEROUI CARDS) */}
      {/* =================================================================== */}
      {(vistaDashboard === 'cards' || vistaDashboard === 'carpetas' || vistaDashboard === 'cuadricula') && (
        <>
          {/* Barra de Filtro Rápido */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #7FD6FF',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}>
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar expediente por DNI..."
                value={busquedaDni}
                onChange={(e) => setBusquedaDni(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '6px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13px',
                  backgroundColor: '#f8fafc',
                  outline: 'none'
                }}
              />
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '10px', top: '10px' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#0a5438' }}>
              {pacientesFiltrados.length} expedientes en tarjetas clínicas (HeroUI)
            </span>
          </div>

          {/* Grid de Registros con Componente PacienteCard (HeroUI) */}
          {pacientesFiltrados.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '2px dashed #cbd5e1', color: '#64748b' }}>
              No se encontraron expedientes coincidentes en la vista de tarjetas.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
              paddingBottom: '30px'
            }}>
              {pacientesFiltrados.map((pac) => (
                <PacienteCard
                  key={pac.id}
                  paciente={pac}
                  onVerDocumento={(docConPaciente) => {
                    const pacFinal = docConPaciente.paciente || pac
                    setDocumentoEnVista({
                      ...docConPaciente,
                      paciente: pacFinal
                    })
                  }}
                  onVerSilueta={(p) => {
                    if (onVerSilueta) {
                      onVerSilueta(p)
                    } else {
                      const docPrincipal = (p.documentos && p.documentos.length > 0) ? p.documentos[0] : null
                      setDocumentoEnVista({
                        id: docPrincipal ? docPrincipal.id : null,
                        nombre_archivo: docPrincipal ? docPrincipal.nombre_archivo : `Historia Clínica Digital - DNI ${p.dni}`,
                        paciente_id: p.id,
                        paciente_dni: p.dni,
                        paciente: p,
                        fecha_subida: docPrincipal ? docPrincipal.fecha_subida : 'Expediente Activo'
                      })
                    }
                  }}
                  onAgregarArchivo={agregarArchivoACarpeta}
                  onAbrirNotas={setPacienteParaNotas}
                  onVerCarpeta={(p) => {
                    const docPrincipal = (p.documentos && p.documentos.length > 0) ? p.documentos[0] : null
                    setDocumentoEnVista({
                      id: docPrincipal ? docPrincipal.id : null,
                      nombre_archivo: docPrincipal ? docPrincipal.nombre_archivo : `Historia Clínica Digital - DNI ${p.dni}`,
                      paciente_id: p.id,
                      paciente_dni: p.dni,
                      paciente: p,
                      fecha_subida: docPrincipal ? docPrincipal.fecha_subida : 'Expediente Activo'
                    })
                  }}
                  onEliminar={handleEliminarPaciente}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* =================================================================== */}
      {/* 3. VISTA TABLA GENERAL (LISTADO UNIFICADO DE TODOS LOS DOCUMENTOS) */}
      {/* =================================================================== */}
      {vistaDashboard === 'tabla-documentos' && (
        <>
          {/* Barra de Filtros por Formato y Búsqueda */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #FFD6E8',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}>
            {/* Buscador de Documentos o DNI */}
            <div style={{ flex: '1 1 260px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar por nombre de archivo o DNI..."
                value={busquedaDni}
                onChange={(e) => setBusquedaDni(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '6px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13px',
                  backgroundColor: '#f8fafc',
                  outline: 'none'
                }}
              />
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '10px', top: '10px' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>

            {/* Pastillas de filtro por formato */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setFiltroTipoDoc('todos')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: filtroTipoDoc === 'todos' ? '1.5px solid #2B4A66' : '1px solid #d1d5db',
                  backgroundColor: filtroTipoDoc === 'todos' ? '#2B4A66' : '#ffffff',
                  color: filtroTipoDoc === 'todos' ? '#ffffff' : '#475569'
                }}
              >
                Todos ({todosLosDocumentos.length})
              </button>
              <button
                onClick={() => setFiltroTipoDoc('pdf')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: filtroTipoDoc === 'pdf' ? '1.5px solid #f4a7c7' : '1px solid #e2e8f0',
                  backgroundColor: filtroTipoDoc === 'pdf' ? '#FFD6E8' : '#ffffff',
                  color: '#802048'
                }}
              >
                PDF ({totalPdfs})
              </button>
              <button
                onClick={() => setFiltroTipoDoc('docx')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: filtroTipoDoc === 'docx' ? '1.5px solid #54bde8' : '1px solid #e2e8f0',
                  backgroundColor: filtroTipoDoc === 'docx' ? '#7FD6FF' : '#ffffff',
                  color: '#104060'
                }}
              >
                Word DOCX ({totalDocx})
              </button>
              <button
                onClick={() => setFiltroTipoDoc('imagen')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: filtroTipoDoc === 'imagen' ? '1.5px solid #4cc799' : '1px solid #e2e8f0',
                  backgroundColor: filtroTipoDoc === 'imagen' ? '#6FE3B4' : '#ffffff',
                  color: '#0a5438'
                }}
              >
                Imágenes ({totalImagenes})
              </button>
              <button
                onClick={() => setFiltroTipoDoc('texto')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: filtroTipoDoc === 'texto' ? '1.5px solid #e2c5d5' : '1px solid #e2e8f0',
                  backgroundColor: filtroTipoDoc === 'texto' ? '#FFF6FB' : '#ffffff',
                  color: '#2B4A66'
                }}
              >
                Texto ({totalTextos})
              </button>
            </div>
          </div>

          {/* Tabla de Todos los Documentos */}
          {documentosFiltradosTabla.length === 0 ? (
            <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '2px dashed #cbd5e1', color: '#64748b' }}>
              <p style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 6px 0', color: '#334155' }}>
                No se encontraron documentos con los filtros seleccionados.
              </p>
              <button
                onClick={() => { setBusquedaDni(''); setFiltroTipoDoc('todos'); }}
                style={{ padding: '6px 14px', backgroundColor: '#7FD6FF', color: '#104060', border: '1px solid #54bde8', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #7FD6FF', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 3px 12px rgba(0,0,0,0.04)', marginBottom: '30px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FFF6FB', borderBottom: '2px solid #7FD6FF', color: '#2B4A66' }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700' }}>Formato</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700' }}>Nombre del Documento</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700' }}>Paciente (DNI)</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700' }}>Expediente</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700' }}>Fecha de Registro</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '700' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentosFiltradosTabla.map((doc) => {
                      const esActivo = documentoEnVista && documentoEnVista.id === doc.id
                      return (
                        <tr
                          key={doc.id}
                          style={{
                            borderBottom: '1px solid #e2e8f0',
                            backgroundColor: esActivo ? '#FFF6FB' : 'transparent',
                            transition: 'background-color 0.15s'
                          }}
                        >
                          <td style={{ padding: '9px 14px' }}>
                            {obtenerIconoArchivo(doc.nombre_archivo)}
                          </td>
                          <td style={{ padding: '9px 14px', fontWeight: '600', color: '#2B4A66' }}>
                            {doc.nombre_archivo}
                          </td>
                          <td style={{ padding: '9px 14px' }}>
                            <span
                              onClick={() => setBusquedaDni(doc.paciente_dni)}
                              style={{
                                backgroundColor: '#6FE3B4',
                                color: '#0a5438',
                                border: '1px solid #4cc799',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                              title="Filtrar por este DNI"
                            >
                              DNI {doc.paciente_dni}
                            </span>
                          </td>
                          <td style={{ padding: '9px 14px', color: '#64748b', fontSize: '12px' }}>
                            #{doc.paciente_id}
                          </td>
                          <td style={{ padding: '9px 14px', color: '#64748b', fontSize: '12px' }}>
                            {doc.fecha_subida || '—'}
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                onClick={() => {
                                  const pac = pacientes.find(p => p.id === doc.paciente_id || String(p.dni) === String(doc.paciente_dni))
                                  setDocumentoEnVista({ ...doc, paciente: pac })
                                }}
                                style={{
                                  padding: '4px 10px',
                                  backgroundColor: esActivo ? '#6FE3B4' : '#FFF6FB',
                                  color: esActivo ? '#0a5438' : '#2B4A66',
                                  border: `1px solid ${esActivo ? '#4cc799' : '#e2c5d5'}`,
                                  borderRadius: '5px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                                title="Previsualizar en el visor lateral derecho"
                              >
                                {esActivo ? 'Viendo' : 'Ver'}
                              </button>
                              <a
                                href={`${API_BASE}/documentos/${doc.id}/archivo`}
                                style={{
                                  padding: '4px 10px',
                                  backgroundColor: '#7FD6FF',
                                  color: '#104060',
                                  border: '1px solid #54bde8',
                                  borderRadius: '5px',
                                  textDecoration: 'none',
                                  fontSize: '11px',
                                  fontWeight: '700'
                                }}
                                title="Descargar archivo físico"
                              >
                                Descargar
                              </a>
                              <button
                                onClick={() => handleEliminarDocumento(doc.id, doc.nombre_archivo, doc.paciente_id)}
                                style={{
                                  padding: '4px 10px',
                                  backgroundColor: '#FFD6E8',
                                  color: '#802048',
                                  border: '1px solid #f4a7c7',
                                  borderRadius: '5px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                                title="Eliminar este archivo"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* =================================================================== */}
      {/* 4. VISTA RESUMEN / ANALÍTICA (ESTADÍSTICAS Y ACTIVIDAD RECIENTE) */}
      {/* =================================================================== */}
      {vistaDashboard === 'analitica' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
          {/* 4 Métricas Clave */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {/* Tarjeta 1: Carpetas */}
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #7FD6FF', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 6px rgba(127, 214, 255, 0.2)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#104060', textTransform: 'uppercase' }}>Carpetas Clínicas</span>
              <strong style={{ display: 'block', fontSize: '28px', color: '#2B4A66', margin: '4px 0' }}>{pacientes.length}</strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Expedientes únicos por DNI</span>
            </div>

            {/* Tarjeta 2: Documentos */}
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #6FE3B4', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 6px rgba(111, 227, 180, 0.2)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#0a5438', textTransform: 'uppercase' }}>Documentos Totales</span>
              <strong style={{ display: 'block', fontSize: '28px', color: '#0a5438', margin: '4px 0' }}>{totalArchivosSistema}</strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Almacenados en MinIO S3</span>
            </div>

            {/* Tarjeta 3: Promedio */}
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e2c5d5', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 6px rgba(226, 197, 213, 0.3)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#2B4A66', textTransform: 'uppercase' }}>Promedio por Carpeta</span>
              <strong style={{ display: 'block', fontSize: '28px', color: '#2B4A66', margin: '4px 0' }}>
                {pacientes.length > 0 ? (totalArchivosSistema / pacientes.length).toFixed(1) : 0}
              </strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Documentos por paciente</span>
            </div>

            {/* Tarjeta 4: Formato Predominante */}
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #f4a7c7', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 6px rgba(244, 167, 199, 0.3)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#802048', textTransform: 'uppercase' }}>Formato Principal</span>
              <strong style={{ display: 'block', fontSize: '22px', color: '#802048', margin: '8px 0 4px 0' }}>
                {totalDocx >= totalPdfs ? 'Word (.docx)' : 'PDF (.pdf)'}
              </strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{Math.max(totalDocx, totalPdfs)} archivos registrados</span>
            </div>
          </div>

          {/* Tarjeta de Distribución Documental */}
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #7FD6FF', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#2B4A66', margin: '0 0 12px 0' }}>
              Distribución de Documentos por Formato
            </h3>

            {/* Barra de Progreso Segmentada */}
            {totalArchivosSistema > 0 ? (
              <div>
                <div style={{ display: 'flex', height: '18px', borderRadius: '9px', overflow: 'hidden', backgroundColor: '#f1f5f9', marginBottom: '14px' }}>
                  {totalDocx > 0 && (
                    <div style={{ width: `${(totalDocx / totalArchivosSistema) * 100}%`, backgroundColor: '#7FD6FF' }} title={`Word: ${totalDocx}`} />
                  )}
                  {totalPdfs > 0 && (
                    <div style={{ width: `${(totalPdfs / totalArchivosSistema) * 100}%`, backgroundColor: '#FFD6E8' }} title={`PDF: ${totalPdfs}`} />
                  )}
                  {totalImagenes > 0 && (
                    <div style={{ width: `${(totalImagenes / totalArchivosSistema) * 100}%`, backgroundColor: '#6FE3B4' }} title={`Imágenes: ${totalImagenes}`} />
                  )}
                  {totalTextos > 0 && (
                    <div style={{ width: `${(totalTextos / totalArchivosSistema) * 100}%`, backgroundColor: '#FFF6FB', border: '1px solid #e2c5d5' }} title={`Texto: ${totalTextos}`} />
                  )}
                </div>

                {/* Leyenda */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#7FD6FF', display: 'inline-block' }} />
                    <span>Word (.docx): <strong>{totalDocx}</strong> ({((totalDocx / totalArchivosSistema) * 100).toFixed(0)}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#FFD6E8', display: 'inline-block' }} />
                    <span>PDF: <strong>{totalPdfs}</strong> ({((totalPdfs / totalArchivosSistema) * 100).toFixed(0)}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#6FE3B4', display: 'inline-block' }} />
                    <span>Imágenes: <strong>{totalImagenes}</strong> ({((totalImagenes / totalArchivosSistema) * 100).toFixed(0)}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#FFF6FB', border: '1px solid #e2c5d5', display: 'inline-block' }} />
                    <span>Texto: <strong>{totalTextos}</strong> ({((totalTextos / totalArchivosSistema) * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>No hay documentos registrados para generar el gráfico de distribución.</p>
            )}
          </div>

          {/* Dos Columnas: Últimos Documentos y Carpetas Principales */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {/* Columna 1: Últimos Documentos Subidos */}
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #6FE3B4', borderRadius: '10px', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0a5438', margin: '0 0 12px 0' }}>
                Últimos Documentos Subidos
              </h3>
              {todosLosDocumentos.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px' }}>No hay actividad reciente.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[...todosLosDocumentos].reverse().slice(0, 6).map((d) => (
                    <div
                      key={d.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        {obtenerIconoArchivo(d.nombre_archivo)}
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#2B4A66', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {d.nombre_archivo}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            DNI {d.paciente_dni} · {d.fecha_subida || 'Reciente'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const pac = pacientes.find(p => p.id === d.paciente_id || String(p.dni) === String(d.paciente_dni)) || null
                          setDocumentoEnVista({ ...d, paciente: pac })
                        }}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#6FE3B4',
                          color: '#0a5438',
                          border: '1px solid #4cc799',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Ver
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Columna 2: Expedientes con Mayor Documentación */}
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #7FD6FF', borderRadius: '10px', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#104060', margin: '0 0 12px 0' }}>
                Expedientes con Mayor Documentación
              </h3>
              {pacientes.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px' }}>No hay expedientes registrados.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[...pacientes]
                    .sort((a, b) => ((b.documentos || []).length) - ((a.documentos || []).length))
                    .slice(0, 6)
                    .map((p, idx) => (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: idx === 0 ? '#FFD6E8' : '#e2e8f0',
                            color: idx === 0 ? '#802048' : '#2B4A66',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            {idx + 1}
                          </span>
                          <div>
                            <strong style={{ fontSize: '13px', color: '#2B4A66', display: 'block' }}>
                              DNI {p.dni}
                            </strong>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              Expediente #{p.id}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#6FE3B4',
                            color: '#0a5438',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>
                            {(p.documentos || []).length} archivos
                          </span>
                          <button
                            onClick={() => {
                              setVistaDashboard('carpetas')
                              setCarpetasAbiertas(prev => new Set([...prev, p.id]))
                            }}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#7FD6FF',
                              color: '#104060',
                              border: '1px solid #54bde8',
                              borderRadius: '5px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Abrir
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE NOTAS MÉDICAS (MÉDICO / ADMIN) */}
      {pacienteParaNotas && (
        <NotasMedicasModal
          paciente={pacienteParaNotas}
          usuario={usuario}
          onClose={() => setPacienteParaNotas(null)}
          onNotaAgregada={() => {
            cargarDatos(false)
          }}
        />
      )}
    </>
  )
}
