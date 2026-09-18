import { useNavigate } from 'react-router-dom'
import { obtenerIconoArchivo, esPdf, esDocx, esImagen, esTexto } from '../utils/fileHelpers'
import { API_BASE } from '../api/config'

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
  loading,
  cargarDatos
}) {
  const navigate = useNavigate()

  return (
    <>
      {/* Cabecera del Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f2942', margin: 0 }}>
            Expedientes Clínicos Digitales
          </h2>
          <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            {vistaDashboard === 'carpetas' && (busquedaDni ? `Resultados para el DNI "${busquedaDni}": ${pacientesFiltrados.length} carpetas` : `Total: ${pacientes.length} carpetas registradas`)}
            {vistaDashboard === 'cuadricula' && `Vista en archivador digital · ${pacientesFiltrados.length} carpetas clínicas`}
            {vistaDashboard === 'tabla-documentos' && `Listado consolidado · ${documentosFiltradosTabla.length} de ${todosLosDocumentos.length} documentos clínicos`}
            {vistaDashboard === 'analitica' && `Estadísticas globales, distribución documental y actividad reciente`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/agregarhistoria')}
            style={{
              padding: '8px 14px',
              backgroundColor: '#CFE7D6',
              color: '#134e2b',
              border: '1px solid #9ec6ac',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(158, 198, 172, 0.4)'
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
              backgroundColor: '#A7C7D9',
              color: '#0c354e',
              border: '1px solid #84aabd',
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
        border: '1.5px solid #A7C7D9',
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
          {/* 1. Vista Carpetas (Acordeón) */}
          <button
            onClick={() => setVistaDashboard('carpetas')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 14px',
              borderRadius: '6px',
              border: vistaDashboard === 'carpetas' ? '1.5px solid #84aabd' : '1px solid transparent',
              backgroundColor: vistaDashboard === 'carpetas' ? '#A7C7D9' : '#f8fafc',
              color: vistaDashboard === 'carpetas' ? '#0c354e' : '#64748b',
              fontWeight: vistaDashboard === 'carpetas' ? '700' : '600',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: vistaDashboard === 'carpetas' ? '0 2px 5px rgba(167, 199, 217, 0.4)' : 'none'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Carpetas (Acordeón)</span>
          </button>

          {/* 2. Vista Cuadrícula (Archivador) */}
          <button
            onClick={() => setVistaDashboard('cuadricula')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 14px',
              borderRadius: '6px',
              border: vistaDashboard === 'cuadricula' ? '1.5px solid #9ec6ac' : '1px solid transparent',
              backgroundColor: vistaDashboard === 'cuadricula' ? '#CFE7D6' : '#f8fafc',
              color: vistaDashboard === 'cuadricula' ? '#134e2b' : '#64748b',
              fontWeight: vistaDashboard === 'cuadricula' ? '700' : '600',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: vistaDashboard === 'cuadricula' ? '0 2px 5px rgba(158, 198, 172, 0.4)' : 'none'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Cuadrícula (Archivador)</span>
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
              border: vistaDashboard === 'tabla-documentos' ? '1.5px solid #F6E38F' : '1px solid transparent',
              backgroundColor: vistaDashboard === 'tabla-documentos' ? '#FFF2B6' : '#f8fafc',
              color: vistaDashboard === 'tabla-documentos' ? '#634706' : '#64748b',
              fontWeight: vistaDashboard === 'tabla-documentos' ? '700' : '600',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: vistaDashboard === 'tabla-documentos' ? '0 2px 5px rgba(246, 227, 143, 0.4)' : 'none'
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
              border: vistaDashboard === 'analitica' ? '1.5px solid #e19d85' : '1px solid transparent',
              backgroundColor: vistaDashboard === 'analitica' ? '#F3C7B6' : '#f8fafc',
              color: vistaDashboard === 'analitica' ? '#70220e' : '#64748b',
              fontWeight: vistaDashboard === 'analitica' ? '700' : '600',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: vistaDashboard === 'analitica' ? '0 2px 5px rgba(243, 199, 182, 0.4)' : 'none'
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
      {/* 1. VISTA CARPETAS (ACORDEÓN JERÁRQUICO) */}
      {/* =================================================================== */}
      {vistaDashboard === 'carpetas' && (
        <>
          {/* Barra de Filtro y Controles de Expansión */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #A7C7D9',
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
            {/* Buscador DNI */}
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar carpeta por DNI de paciente..."
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
                onFocus={(e) => e.target.style.borderColor = '#A7C7D9'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '10px', top: '10px' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              {busquedaDni && (
                <button
                  onClick={() => setBusquedaDni('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '7px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  X
                </button>
              )}
            </div>

            {/* Controles de expansión */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={expandirTodas}
                style={{
                  padding: '7px 12px',
                  backgroundColor: '#A7C7D9',
                  border: '1px solid #84aabd',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  color: '#0c354e'
                }}
              >
                Expandir todas
              </button>
              <button
                onClick={colapsarTodas}
                style={{
                  padding: '7px 12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: '#374151'
                }}
              >
                Colapsar todas
              </button>
            </div>
          </div>

          {/* Listado de Carpetas de Pacientes */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              Cargando expedientes clínicos...
            </div>
          ) : pacientesFiltrados.length === 0 ? (
            <div style={{
              padding: '50px 20px',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              color: '#64748b'
            }}>
              <p style={{ fontSize: '17px', margin: '0 0 8px 0', fontWeight: '700', color: '#334155' }}>
                {busquedaDni ? `No se encontró ninguna carpeta con el DNI "${busquedaDni}"` : 'No hay expedientes clínicos registrados todavía.'}
              </p>
              <p style={{ fontSize: '13px', margin: '0 0 16px 0' }}>
                Utiliza la herramienta "Agregar nueva historia" para crear un expediente clínico o subir archivos.
              </p>
              <button
                onClick={() => navigate('/agregarhistoria')}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#A7C7D9',
                  color: '#0c354e',
                  border: '1px solid #84aabd',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Ir a Agregar Nueva Historia
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '30px' }}>
              {pacientesFiltrados.map((pac) => {
                const estaAbierta = carpetasAbiertas.has(pac.id)
                const docs = pac.documentos || []

                return (
                  <div
                    key={pac.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: estaAbierta ? '2px solid #A7C7D9' : '1px solid #e2e8f0',
                      borderRadius: '10px',
                      boxShadow: estaAbierta ? '0 4px 14px rgba(167, 199, 217, 0.25)' : '0 1px 3px rgba(0,0,0,0.03)',
                      overflow: 'hidden',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Cabecera de Carpeta */}
                    <div
                      style={{
                        padding: '12px 16px',
                        backgroundColor: estaAbierta ? '#f2f7fa' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px',
                        borderBottom: estaAbierta ? '1.5px solid #A7C7D9' : 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => toggleCarpeta(pac.id)}
                    >
                      {/* Info DNI */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: estaAbierta ? '#A7C7D9' : '#e2e8f0',
                          color: estaAbierta ? '#0c354e' : '#475569',
                          border: estaAbierta ? '1px solid #84aabd' : '1px solid #cbd5e1',
                          letterSpacing: '0.5px'
                        }}>
                          {estaAbierta ? 'ABIERTA' : 'CARPETA'}
                        </span>

                        <div>
                          {editandoPaciente === pac.id ? (
                            <div
                              style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                value={nuevoDni}
                                onChange={(e) => setNuevoDni(e.target.value)}
                                style={{ padding: '4px 8px', borderRadius: '6px', border: '1.5px solid #A7C7D9', fontSize: '14px', fontWeight: 'bold', outline: 'none' }}
                                autoFocus
                              />
                              <button
                                onClick={() => handleGuardarDni(pac.id)}
                                style={{ padding: '4px 10px', backgroundColor: '#CFE7D6', color: '#134e2b', border: '1px solid #9ec6ac', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditandoPaciente(null)}
                                style={{ padding: '4px 10px', backgroundColor: '#F3C7B6', color: '#70220e', border: '1px solid #e19d85', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f2942' }}>
                                DNI: {pac.dni}
                              </span>
                              <span style={{
                                backgroundColor: docs.length > 0 ? '#CFE7D6' : '#F3C7B6',
                                color: docs.length > 0 ? '#134e2b' : '#70220e',
                                border: docs.length > 0 ? '1px solid #9ec6ac' : '1px solid #e19d85',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '700'
                              }}>
                                {docs.length} {docs.length === 1 ? 'archivo' : 'archivos'}
                              </span>
                            </div>
                          )}
                          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                            Expediente clínico #{pac.id}
                          </p>
                        </div>
                      </div>

                      {/* Botones de Cabecera */}
                      <div
                        style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => agregarArchivoACarpeta(pac.dni, pac.id)}
                          style={{
                            padding: '5px 12px',
                            backgroundColor: '#A7C7D9',
                            color: '#0c354e',
                            border: '1px solid #84aabd',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 4px rgba(167, 199, 217, 0.3)'
                          }}
                          title="Agregar un nuevo documento a este DNI"
                        >
                          + Agregar archivo
                        </button>

                        {editandoPaciente !== pac.id && (
                          <button
                            onClick={() => {
                              setEditandoPaciente(pac.id)
                              setNuevoDni(pac.dni)
                            }}
                            style={{
                              padding: '5px 8px',
                              backgroundColor: '#FFF2B6',
                              border: '1px solid #F6E38F',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700',
                              color: '#634706',
                              cursor: 'pointer'
                            }}
                            title="Modificar DNI"
                          >
                            Editar DNI
                          </button>
                        )}

                        <button
                          onClick={() => handleEliminarPaciente(pac.id, pac.dni)}
                          style={{
                            padding: '5px 8px',
                            backgroundColor: '#F3C7B6',
                            border: '1px solid #e19d85',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#70220e',
                            cursor: 'pointer'
                          }}
                          title="Eliminar carpeta y todos sus archivos"
                        >
                          Borrar
                        </button>

                        <button
                          onClick={() => toggleCarpeta(pac.id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: '#64748b'
                          }}
                          title={estaAbierta ? 'Colapsar carpeta' : 'Abrir carpeta'}
                        >
                          {estaAbierta ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>

                    {/* Contenido Interno de la Carpeta */}
                    {estaAbierta && (
                      <div style={{ padding: '14px', backgroundColor: '#ffffff' }}>
                        {docs.length === 0 ? (
                          <div style={{
                            padding: '20px',
                            textAlign: 'center',
                            backgroundColor: '#FFF2B6',
                            borderRadius: '8px',
                            border: '1px dashed #F6E38F',
                            color: '#634706'
                          }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600' }}>
                              Esta carpeta no contiene documentos actualmente.
                            </p>
                            <button
                              onClick={() => agregarArchivoACarpeta(pac.dni, pac.id)}
                              style={{
                                padding: '6px 14px',
                                backgroundColor: '#A7C7D9',
                                color: '#0c354e',
                                border: '1px solid #84aabd',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '700'
                              }}
                            >
                              + Subir primer documento a este DNI
                            </button>
                          </div>
                        ) : (
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                              <thead>
                                <tr style={{ backgroundColor: '#f2f7fa', borderBottom: '2px solid #A7C7D9', color: '#0f2942' }}>
                                  <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: '700' }}>Tipo</th>
                                  <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: '700' }}>Nombre del Archivo</th>
                                  <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: '700' }}>Fecha de Subida</th>
                                  <th style={{ padding: '9px 12px', textAlign: 'center', fontWeight: '700' }}>Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {docs.map((doc) => {
                                  const esActivo = documentoEnVista && documentoEnVista.id === doc.id
                                  return (
                                    <tr
                                      key={doc.id}
                                      style={{
                                        borderBottom: '1px solid #e2e8f0',
                                        backgroundColor: esActivo ? '#e0f2fe' : 'transparent',
                                        transition: 'background-color 0.15s'
                                      }}
                                    >
                                      <td style={{ padding: '8px 12px' }}>
                                        {obtenerIconoArchivo(doc.nombre_archivo)}
                                      </td>
                                      <td style={{ padding: '8px 12px', fontWeight: '600', color: '#0f2942' }}>
                                        {doc.nombre_archivo}
                                      </td>
                                      <td style={{ padding: '8px 12px', color: '#475569', fontSize: '12px' }}>
                                        {doc.fecha_subida || '—'}
                                      </td>
                                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                                          <button
                                            onClick={() => setDocumentoEnVista(doc)}
                                            style={{
                                              padding: '4px 10px',
                                              backgroundColor: esActivo ? '#059669' : '#CFE7D6',
                                              color: esActivo ? '#ffffff' : '#134e2b',
                                              border: '1px solid #9ec6ac',
                                              borderRadius: '5px',
                                              fontSize: '11px',
                                              fontWeight: '700',
                                              cursor: 'pointer'
                                            }}
                                            title="Ver en el panel lateral derecho"
                                          >
                                            {esActivo ? 'Viendo' : 'Ver'}
                                          </button>

                                          <a
                                            href={`${API_BASE}/documentos/${doc.id}/archivo`}
                                            style={{
                                              padding: '4px 10px',
                                              backgroundColor: '#A7C7D9',
                                              color: '#0c354e',
                                              border: '1px solid #84aabd',
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
                                            onClick={() => handleEliminarDocumento(doc.id, doc.nombre_archivo, pac.id)}
                                            style={{
                                              padding: '4px 10px',
                                              backgroundColor: '#F3C7B6',
                                              color: '#70220e',
                                              border: '1px solid #e19d85',
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
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* =================================================================== */}
      {/* 2. VISTA CUADRÍCULA (ARCHIVADOR DIGITAL POR TARJETAS) */}
      {/* =================================================================== */}
      {vistaDashboard === 'cuadricula' && (
        <>
          {/* Barra de Filtro Rápido */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #CFE7D6',
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
                placeholder="Filtrar archivador por DNI..."
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
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#134e2b' }}>
              {pacientesFiltrados.length} carpetas visibles en el archivador
            </span>
          </div>

          {/* Grid de Carpetas Estilo Archivador */}
          {pacientesFiltrados.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '2px dashed #cbd5e1', color: '#64748b' }}>
              No se encontraron carpetas coincidentes en la vista de cuadrícula.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '16px',
              paddingBottom: '30px'
            }}>
              {pacientesFiltrados.map((pac) => {
                const docs = pac.documentos || []
                const countPdfs = docs.filter(d => esPdf(d.nombre_archivo)).length
                const countDocx = docs.filter(d => esDocx(d.nombre_archivo)).length
                const countImg = docs.filter(d => esImagen(d.nombre_archivo)).length
                const countTxt = docs.filter(d => esTexto(d.nombre_archivo)).length

                return (
                  <div
                    key={pac.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #A7C7D9',
                      borderRadius: '12px',
                      padding: '16px',
                      boxShadow: '0 3px 10px rgba(167, 199, 217, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div>
                      {/* Cabecera de la tarjeta */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: '#A7C7D9',
                            color: '#0c354e',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            </svg>
                          </div>
                          <div>
                            <strong style={{ fontSize: '15px', color: '#0f2942', display: 'block' }}>
                              DNI: {pac.dni}
                            </strong>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              Expediente #{pac.id}
                            </span>
                          </div>
                        </div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor: docs.length > 0 ? '#CFE7D6' : '#FFF2B6',
                          color: docs.length > 0 ? '#134e2b' : '#634706',
                          border: docs.length > 0 ? '1px solid #9ec6ac' : '1px solid #F6E38F'
                        }}>
                          {docs.length} doc{docs.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Desglose de tipos */}
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {countPdfs > 0 && <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#F3C7B6', color: '#70220e', padding: '1px 6px', borderRadius: '4px' }}>{countPdfs} PDF</span>}
                        {countDocx > 0 && <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#A7C7D9', color: '#0c354e', padding: '1px 6px', borderRadius: '4px' }}>{countDocx} DOCX</span>}
                        {countImg > 0 && <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#CFE7D6', color: '#134e2b', padding: '1px 6px', borderRadius: '4px' }}>{countImg} IMG</span>}
                        {countTxt > 0 && <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#FFF2B6', color: '#634706', padding: '1px 6px', borderRadius: '4px' }}>{countTxt} TXT</span>}
                        {docs.length === 0 && <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Sin archivos adjuntos</span>}
                      </div>

                      {/* Vista previa de los primeros 3 documentos */}
                      {docs.length > 0 && (
                        <div style={{ backgroundColor: '#f8fafc', borderRadius: '6px', padding: '8px', marginBottom: '14px', fontSize: '12px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                            Contenido reciente:
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {docs.slice(0, 3).map((d) => (
                              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                  {obtenerIconoArchivo(d.nombre_archivo)}
                                  <span style={{ fontSize: '11px', color: '#334155', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                    {d.nombre_archivo}
                                  </span>
                                </div>
                                <button
                                  onClick={() => setDocumentoEnVista(d)}
                                  style={{
                                    padding: '2px 7px',
                                    backgroundColor: '#CFE7D6',
                                    color: '#134e2b',
                                    border: '1px solid #9ec6ac',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                  title="Ver en visor lateral"
                                >
                                  Ver
                                </button>
                              </div>
                            ))}
                            {docs.length > 3 && (
                              <span style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', marginTop: '2px' }}>
                                +{docs.length - 3} archivo(s) más
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botones inferiores de la tarjeta */}
                    <div style={{ display: 'flex', gap: '6px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => agregarArchivoACarpeta(pac.dni, pac.id)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          backgroundColor: '#A7C7D9',
                          color: '#0c354e',
                          border: '1px solid #84aabd',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        + Archivo
                      </button>
                      <button
                        onClick={() => {
                          setVistaDashboard('carpetas')
                          setCarpetasAbiertas(prev => new Set([...prev, pac.id]))
                        }}
                        style={{
                          flex: 1,
                          padding: '6px',
                          backgroundColor: '#ffffff',
                          color: '#334155',
                          border: '1px solid #d1d5db',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Ver Carpeta
                      </button>
                      <button
                        onClick={() => handleEliminarPaciente(pac.id, pac.dni)}
                        style={{
                          padding: '6px 8px',
                          backgroundColor: '#F3C7B6',
                          color: '#70220e',
                          border: '1px solid #e19d85',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                        title="Eliminar expediente"
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                )
              })}
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
            border: '1.5px solid #F6E38F',
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
                  border: filtroTipoDoc === 'todos' ? '1.5px solid #0f2942' : '1px solid #d1d5db',
                  backgroundColor: filtroTipoDoc === 'todos' ? '#0f2942' : '#ffffff',
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
                  border: filtroTipoDoc === 'pdf' ? '1.5px solid #e19d85' : '1px solid #e2e8f0',
                  backgroundColor: filtroTipoDoc === 'pdf' ? '#F3C7B6' : '#ffffff',
                  color: '#70220e'
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
                  border: filtroTipoDoc === 'docx' ? '1.5px solid #84aabd' : '1px solid #e2e8f0',
                  backgroundColor: filtroTipoDoc === 'docx' ? '#A7C7D9' : '#ffffff',
                  color: '#0c354e'
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
                  border: filtroTipoDoc === 'imagen' ? '1.5px solid #9ec6ac' : '1px solid #e2e8f0',
                  backgroundColor: filtroTipoDoc === 'imagen' ? '#CFE7D6' : '#ffffff',
                  color: '#134e2b'
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
                  border: filtroTipoDoc === 'texto' ? '1.5px solid #F6E38F' : '1px solid #e2e8f0',
                  backgroundColor: filtroTipoDoc === 'texto' ? '#FFF2B6' : '#ffffff',
                  color: '#634706'
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
                style={{ padding: '6px 14px', backgroundColor: '#A7C7D9', color: '#0c354e', border: '1px solid #84aabd', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #A7C7D9', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 3px 12px rgba(0,0,0,0.04)', marginBottom: '30px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f2f7fa', borderBottom: '2px solid #A7C7D9', color: '#0f2942' }}>
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
                            backgroundColor: esActivo ? '#e0f2fe' : 'transparent',
                            transition: 'background-color 0.15s'
                          }}
                        >
                          <td style={{ padding: '9px 14px' }}>
                            {obtenerIconoArchivo(doc.nombre_archivo)}
                          </td>
                          <td style={{ padding: '9px 14px', fontWeight: '600', color: '#0f2942' }}>
                            {doc.nombre_archivo}
                          </td>
                          <td style={{ padding: '9px 14px' }}>
                            <span
                              onClick={() => setBusquedaDni(doc.paciente_dni)}
                              style={{
                                backgroundColor: '#CFE7D6',
                                color: '#134e2b',
                                border: '1px solid #9ec6ac',
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
                                onClick={() => setDocumentoEnVista(doc)}
                                style={{
                                  padding: '4px 10px',
                                  backgroundColor: esActivo ? '#059669' : '#CFE7D6',
                                  color: esActivo ? '#ffffff' : '#134e2b',
                                  border: '1px solid #9ec6ac',
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
                                  backgroundColor: '#A7C7D9',
                                  color: '#0c354e',
                                  border: '1px solid #84aabd',
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
                                  backgroundColor: '#F3C7B6',
                                  color: '#70220e',
                                  border: '1px solid #e19d85',
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
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #A7C7D9', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 6px rgba(167, 199, 217, 0.2)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#0c354e', textTransform: 'uppercase' }}>Carpetas Clínicas</span>
              <strong style={{ display: 'block', fontSize: '28px', color: '#0f2942', margin: '4px 0' }}>{pacientes.length}</strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Expedientes únicos por DNI</span>
            </div>

            {/* Tarjeta 2: Documentos */}
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #CFE7D6', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 6px rgba(158, 198, 172, 0.2)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#134e2b', textTransform: 'uppercase' }}>Documentos Totales</span>
              <strong style={{ display: 'block', fontSize: '28px', color: '#134e2b', margin: '4px 0' }}>{totalArchivosSistema}</strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Almacenados en MinIO S3</span>
            </div>

            {/* Tarjeta 3: Promedio */}
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #F6E38F', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 6px rgba(246, 227, 143, 0.2)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#634706', textTransform: 'uppercase' }}>Promedio por Carpeta</span>
              <strong style={{ display: 'block', fontSize: '28px', color: '#634706', margin: '4px 0' }}>
                {pacientes.length > 0 ? (totalArchivosSistema / pacientes.length).toFixed(1) : 0}
              </strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Documentos por paciente</span>
            </div>

            {/* Tarjeta 4: Formato Predominante */}
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e19d85', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 6px rgba(243, 199, 182, 0.2)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#70220e', textTransform: 'uppercase' }}>Formato Principal</span>
              <strong style={{ display: 'block', fontSize: '22px', color: '#70220e', margin: '8px 0 4px 0' }}>
                {totalDocx >= totalPdfs ? 'Word (.docx)' : 'PDF (.pdf)'}
              </strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{Math.max(totalDocx, totalPdfs)} archivos registrados</span>
            </div>
          </div>

          {/* Tarjeta de Distribución Documental */}
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #A7C7D9', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f2942', margin: '0 0 12px 0' }}>
              Distribución de Documentos por Formato
            </h3>

            {/* Barra de Progreso Segmentada */}
            {totalArchivosSistema > 0 ? (
              <div>
                <div style={{ display: 'flex', height: '18px', borderRadius: '9px', overflow: 'hidden', backgroundColor: '#f1f5f9', marginBottom: '14px' }}>
                  {totalDocx > 0 && (
                    <div style={{ width: `${(totalDocx / totalArchivosSistema) * 100}%`, backgroundColor: '#A7C7D9' }} title={`Word: ${totalDocx}`} />
                  )}
                  {totalPdfs > 0 && (
                    <div style={{ width: `${(totalPdfs / totalArchivosSistema) * 100}%`, backgroundColor: '#F3C7B6' }} title={`PDF: ${totalPdfs}`} />
                  )}
                  {totalImagenes > 0 && (
                    <div style={{ width: `${(totalImagenes / totalArchivosSistema) * 100}%`, backgroundColor: '#CFE7D6' }} title={`Imágenes: ${totalImagenes}`} />
                  )}
                  {totalTextos > 0 && (
                    <div style={{ width: `${(totalTextos / totalArchivosSistema) * 100}%`, backgroundColor: '#FFF2B6' }} title={`Texto: ${totalTextos}`} />
                  )}
                </div>

                {/* Leyenda */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#A7C7D9', display: 'inline-block' }} />
                    <span>Word (.docx): <strong>{totalDocx}</strong> ({((totalDocx / totalArchivosSistema) * 100).toFixed(0)}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#F3C7B6', display: 'inline-block' }} />
                    <span>PDF: <strong>{totalPdfs}</strong> ({((totalPdfs / totalArchivosSistema) * 100).toFixed(0)}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#CFE7D6', display: 'inline-block' }} />
                    <span>Imágenes: <strong>{totalImagenes}</strong> ({((totalImagenes / totalArchivosSistema) * 100).toFixed(0)}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#FFF2B6', display: 'inline-block' }} />
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
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #CFE7D6', borderRadius: '10px', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#134e2b', margin: '0 0 12px 0' }}>
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
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f2942', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {d.nombre_archivo}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            DNI {d.paciente_dni} · {d.fecha_subida || 'Reciente'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setDocumentoEnVista(d)}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#CFE7D6',
                          color: '#134e2b',
                          border: '1px solid #9ec6ac',
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
            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #A7C7D9', borderRadius: '10px', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0c354e', margin: '0 0 12px 0' }}>
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
                            backgroundColor: idx === 0 ? '#FEF7A7' : '#e2e8f0',
                            color: '#0f2942',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            {idx + 1}
                          </span>
                          <div>
                            <strong style={{ fontSize: '13px', color: '#0f2942', display: 'block' }}>
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
                            backgroundColor: '#CFE7D6',
                            color: '#134e2b',
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
                              backgroundColor: '#A7C7D9',
                              color: '#0c354e',
                              border: '1px solid #84aabd',
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
    </>
  )
}
