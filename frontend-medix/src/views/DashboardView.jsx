import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { esPdf, esDocx, esImagen, esTexto } from '../utils/fileHelpers'
import NotasMedicasModal from '../components/NotasMedicasModal'
import PacienteCard from '../components/PacienteCard'

function obtenerIniciales(nombre, dni) {
  if (nombre && nombre.trim()) {
    const partes = nombre.trim().split(/\s+/)
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase()
    }
    return partes[0].slice(0, 2).toUpperCase()
  }
  return dni ? String(dni).slice(0, 2) : 'HC'
}

function obtenerUltimaAtencion(paciente) {
  const fechas = []
  ;(paciente.documentos || []).forEach(d => {
    if (d.fecha_subida) fechas.push(d.fecha_subida)
  })
  ;(paciente.notas_medicas || []).forEach(n => {
    if (n.fecha) fechas.push(n.fecha)
  })
  ;(paciente.signos_vitales || []).forEach(s => {
    if (s.fecha) fechas.push(s.fecha)
  })
  if (fechas.length === 0) return null
  fechas.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  return fechas[0]
}

function pacienteTieneAlergia(paciente) {
  return Boolean(
    paciente?.alergias &&
    paciente.alergias.trim() &&
    !paciente.alergias.toLowerCase().includes('ninguna')
  )
}

export default function DashboardView({
  pacientes = [],
  pacientesFiltrados = [],
  todosLosDocumentos = [],
  documentosFiltradosTabla = [],
  totalPdfs = 0,
  totalDocx = 0,
  totalImagenes = 0,
  totalTextos = 0,
  totalArchivosSistema = 0,
  busquedaDni = '',
  setBusquedaDni = () => {},
  vistaDashboard = 'cards',
  setVistaDashboard = () => {},
  filtroTipoDoc = 'todos',
  setFiltroTipoDoc = () => {},
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
  notificar,
  loading,
  cargarDatos,
  usuario
}) {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [pacienteParaNotas, setPacienteParaNotas] = useState(null)

  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [subVistaLista, setSubVistaLista] = useState('tabla')
  const [pagina, setPagina] = useState(1)
  const porPagina = 10

  const esVistaAnalitica = vistaDashboard === 'analitica'

  const pacientesFiltradosFinal = useMemo(() => {
    let lista = pacientes || []
    const q = (busquedaDni || '').trim().toLowerCase()

    if (q) {
      lista = lista.filter(p => {
        const matchDni = p.dni && String(p.dni).toLowerCase().includes(q)
        const matchNombre = p.nombre && p.nombre.toLowerCase().includes(q)
        const matchAlergias = p.alergias && p.alergias.toLowerCase().includes(q)
        const matchDoc = (p.documentos || []).some(d =>
          (d.nombre_original || d.nombre_archivo || '').toLowerCase().includes(q)
        )
        return matchDni || matchNombre || matchAlergias || matchDoc
      })
    }

    if (filtroTipo !== 'todos') {
      lista = lista.filter(p => {
        const docs = p.documentos || []
        if (filtroTipo === 'pdf') return docs.some(d => esPdf(d.nombre_original || d.nombre_archivo))
        if (filtroTipo === 'docx') return docs.some(d => esDocx(d.nombre_original || d.nombre_archivo))
        if (filtroTipo === 'imagen') return docs.some(d => esImagen(d.nombre_original || d.nombre_archivo))
        if (filtroTipo === 'texto') return docs.some(d => esTexto(d.nombre_original || d.nombre_archivo))
        if (filtroTipo === 'notas') return (p.total_notas ?? (p.notas_medicas || []).length) > 0
        if (filtroTipo === 'alergias') return pacienteTieneAlergia(p)
        return true
      })
    }

    if (filtroFecha) {
      lista = lista.filter(p => {
        const ultima = obtenerUltimaAtencion(p)
        const coincideUltima = ultima && ultima.startsWith(filtroFecha)
        const coincideDoc = (p.documentos || []).some(d => (d.fecha_subida || '').startsWith(filtroFecha))
        const coincideNota = (p.notas_medicas || []).some(n => (n.fecha || '').startsWith(filtroFecha))
        const coincideSigno = (p.signos_vitales || []).some(s => (s.fecha || '').startsWith(filtroFecha))
        return coincideUltima || coincideDoc || coincideNota || coincideSigno
      })
    }

    return lista
  }, [pacientes, busquedaDni, filtroTipo, filtroFecha])

  useEffect(() => {
    setPagina(1)
  }, [busquedaDni, filtroTipo, filtroFecha])

  const totalPaginas = Math.max(1, Math.ceil(pacientesFiltradosFinal.length / porPagina))
  const indiceInicio = (pagina - 1) * porPagina
  const pacientesPaginados = pacientesFiltradosFinal.slice(indiceInicio, indiceInicio + porPagina)

  const abrirExpedientePaciente = (p) => {
    if (onVerSilueta) {
      onVerSilueta(p)
      return
    }
    const docPrincipal = (p.documentos && p.documentos.length > 0) ? p.documentos[0] : null
    setDocumentoEnVista({
      id: docPrincipal ? docPrincipal.id : null,
      nombre_archivo: docPrincipal
        ? (docPrincipal.nombre_original || docPrincipal.nombre_archivo)
        : `Historia Clínica - DNI ${p.dni}`,
      nombre_original: docPrincipal ? docPrincipal.nombre_original : null,
      paciente_id: p.id,
      paciente_dni: p.dni,
      paciente: p,
      fecha_subida: docPrincipal ? docPrincipal.fecha_subida : 'Expediente Activo'
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="medix-page-title">Historias Clínicas</h1>
          <p className="medix-page-subtitle">
            Hospital San Juan de Dios de Pisco · {pacientesFiltradosFinal.length} expediente{pacientesFiltradosFinal.length !== 1 ? 's' : ''} registrado{pacientesFiltradosFinal.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            role="group"
            aria-label="Selector de vista del panel"
            className="medix-card"
            style={{ display: 'inline-flex', padding: '3px', gap: '4px', borderRadius: '8px' }}
          >
            <button
              type="button"
              onClick={() => setVistaDashboard('cards')}
              className="medix-btn medix-btn-sm"
              style={{
                backgroundColor: !esVistaAnalitica ? 'var(--color-navy)' : 'transparent',
                color: !esVistaAnalitica ? '#FFFFFF' : theme.textSecondary
              }}
            >
              Lista / Tabla
            </button>
            <button
              type="button"
              onClick={() => setVistaDashboard('analitica')}
              className="medix-btn medix-btn-sm"
              style={{
                backgroundColor: esVistaAnalitica ? 'var(--color-navy)' : 'transparent',
                color: esVistaAnalitica ? '#FFFFFF' : theme.textSecondary
              }}
            >
              Analítica
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/agregarhistoria')}
            className="medix-btn medix-btn-primary"
          >
            Nueva historia
          </button>
        </div>
      </div>

      {!esVistaAnalitica && (
        <>
          <div
            className="medix-card"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: '1 1 560px', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 260px' }}>
                <label htmlFor="buscador-expedientes" className="medix-label">
                  Buscar paciente (DNI o nombre)
                </label>
                <input
                  id="buscador-expedientes"
                  type="search"
                  className="medix-input"
                  placeholder="Buscar por DNI o apellidos y nombres..."
                  value={busquedaDni}
                  onChange={(e) => setBusquedaDni(e.target.value)}
                />
              </div>

              <div style={{ flex: '0 1 190px' }}>
                <label htmlFor="filtro-tipo-expediente" className="medix-label">
                  Tipo / Contenido
                </label>
                <select
                  id="filtro-tipo-expediente"
                  className="medix-input"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="todos">Todos los expedientes</option>
                  <option value="pdf">Documentos PDF</option>
                  <option value="docx">Documentos Word</option>
                  <option value="imagen">Imágenes médicas</option>
                  <option value="notas">Con notas médicas</option>
                  <option value="alergias">Con alerta de alergia</option>
                </select>
              </div>

              <div style={{ flex: '0 1 170px' }}>
                <label htmlFor="filtro-fecha-expediente" className="medix-label">
                  Fecha de atención
                </label>
                <input
                  id="filtro-fecha-expediente"
                  type="date"
                  className="medix-input"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                />
              </div>

              {(busquedaDni || filtroTipo !== 'todos' || filtroFecha) && (
                <button
                  type="button"
                  className="medix-btn medix-btn-secondary"
                  style={{ height: '38px', fontSize: '12px' }}
                  onClick={() => {
                    setBusquedaDni('')
                    setFiltroTipo('todos')
                    setFiltroFecha('')
                  }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="medix-btn medix-btn-secondary"
                style={{ height: '38px', fontSize: '12px' }}
                onClick={() => setSubVistaLista(subVistaLista === 'tabla' ? 'tarjetas' : 'tabla')}
              >
                {subVistaLista === 'tabla' ? 'Ver en tarjetas' : 'Ver en tabla'}
              </button>

              <button
                type="button"
                className="medix-btn medix-btn-secondary"
                style={{ height: '38px', fontSize: '12px' }}
                onClick={() => cargarDatos && cargarDatos(false)}
              >
                Actualizar
              </button>
            </div>
          </div>

          {pacientesFiltradosFinal.length === 0 ? (
            <div className="medix-card" style={{ padding: '40px 24px', textAlign: 'center', color: theme.textSecondary }}>
              No se encontraron expedientes clínicos con los filtros aplicados.
            </div>
          ) : subVistaLista === 'tarjetas' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
              {pacientesPaginados.map(pac => (
                <PacienteCard
                  key={pac.id}
                  paciente={pac}
                  onVerDocumento={(docConPaciente) => {
                    setDocumentoEnVista({
                      ...docConPaciente,
                      paciente: docConPaciente.paciente || pac
                    })
                  }}
                  onVerSilueta={() => abrirExpedientePaciente(pac)}
                  onAgregarArchivo={agregarArchivoACarpeta}
                  onAbrirNotas={setPacienteParaNotas}
                  onEliminar={handleEliminarPaciente}
                  notificar={notificar}
                />
              ))}
            </div>
          ) : (
            <div className="medix-card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="medix-table">
                  <thead>
                    <tr>
                      <th>Paciente</th>
                      <th>Documentos</th>
                      <th>Notas</th>
                      <th>Última atención</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientesPaginados.map((pac) => {
                      const docs = pac.documentos || []
                      const totalNotas = pac.total_notas ?? (pac.notas_medicas ? pac.notas_medicas.length : 0)
                      const ultimaAtencion = obtenerUltimaAtencion(pac)
                      const tieneAlergia = pacienteTieneAlergia(pac)
                      const seleccionado = documentoEnVista && documentoEnVista.paciente_id === pac.id

                      return (
                        <tr key={pac.id} style={{ backgroundColor: seleccionado ? theme.tableRowHover : undefined }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div className="medix-avatar">
                                {obtenerIniciales(pac.nombre, pac.dni)}
                              </div>

                              <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: 600, color: theme.textMain }}>
                                    {pac.nombre || 'Paciente registrado'}
                                  </span>
                                  {tieneAlergia && (
                                    <span className="medix-badge medix-badge-alert" title={`Alergias: ${pac.alergias}`}>
                                      Alergia: {pac.alergias}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
                                  DNI: {pac.dni} · Exp. #{pac.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 600 }}>
                                {docs.length} {docs.length === 1 ? 'archivo' : 'archivos'}
                              </span>
                              {agregarArchivoACarpeta && (
                                <button
                                  type="button"
                                  className="medix-btn medix-btn-secondary medix-btn-sm"
                                  onClick={() => agregarArchivoACarpeta(pac.dni, pac.id)}
                                  aria-label={`Adjuntar documento al paciente DNI ${pac.dni}`}
                                >
                                  + Subir
                                </button>
                              )}
                            </div>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="medix-btn medix-btn-secondary medix-btn-sm"
                              onClick={() => setPacienteParaNotas(pac)}
                            >
                              {totalNotas} {totalNotas === 1 ? 'nota' : 'notas'}
                            </button>
                          </td>

                          <td style={{ color: theme.textSecondary }}>
                            {ultimaAtencion || 'Sin atenciones'}
                          </td>

                          <td>
                            <span className="medix-badge medix-badge-status">Activo</span>
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                className="medix-btn medix-btn-primary medix-btn-sm"
                                onClick={() => abrirExpedientePaciente(pac)}
                              >
                                Ver historia
                              </button>
                              {handleEliminarPaciente && (
                                <button
                                  type="button"
                                  className="medix-btn medix-btn-danger medix-btn-sm"
                                  onClick={() => handleEliminarPaciente(pac.id, pac.dni)}
                                  aria-label={`Eliminar expediente DNI ${pac.dni}`}
                                >
                                  Eliminar
                                </button>
                              )}
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

          {totalPaginas > 1 && (
            <div
              className="medix-card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                Mostrando {indiceInicio + 1} a {Math.min(indiceInicio + porPagina, pacientesFiltradosFinal.length)} de {pacientesFiltradosFinal.length} expedientes
              </span>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="medix-btn medix-btn-secondary medix-btn-sm"
                  onClick={() => setPagina(prev => Math.max(1, prev - 1))}
                  disabled={pagina === 1}
                >
                  Anterior
                </button>
                <span style={{ fontSize: '12px', fontWeight: 600, padding: '0 8px' }}>
                  Página {pagina} de {totalPaginas}
                </span>
                <button
                  type="button"
                  className="medix-btn medix-btn-secondary medix-btn-sm"
                  onClick={() => setPagina(prev => Math.min(totalPaginas, prev + 1))}
                  disabled={pagina === totalPaginas}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {esVistaAnalitica && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
            <div className="medix-card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase' }}>
                Expedientes Clínicos
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: theme.textHeading, marginTop: '6px' }}>
                {pacientes.length}
              </div>
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
                Pacientes registrados por DNI
              </div>
            </div>

            <div className="medix-card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase' }}>
                Documentos Digitalizados
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '6px' }}>
                {totalArchivosSistema}
              </div>
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
                Almacenados en repositorio S3
              </div>
            </div>

            <div className="medix-card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase' }}>
                Promedio por Paciente
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: theme.textHeading, marginTop: '6px' }}>
                {pacientes.length > 0 ? (totalArchivosSistema / pacientes.length).toFixed(1) : '0.0'}
              </div>
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
                Archivos por historia clínica
              </div>
            </div>

            <div className="medix-card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase' }}>
                Pacientes con Alergias
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--alert-red)', marginTop: '6px' }}>
                {pacientes.filter(pacienteTieneAlergia).length}
              </div>
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
                Con alerta clínica activa
              </div>
            </div>
          </div>

          <div className="medix-card" style={{ padding: '18px 20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: theme.textHeading, marginBottom: '12px' }}>
              Distribución de Documentos por Formato
            </h2>

            {totalArchivosSistema > 0 ? (
              <div>
                <div style={{ display: 'flex', height: '12px', borderRadius: '8px', overflow: 'hidden', backgroundColor: theme.bgSubtle, marginBottom: '14px' }}>
                  {totalPdfs > 0 && (
                    <div style={{ width: `${(totalPdfs / totalArchivosSistema) * 100}%`, backgroundColor: '#0B2545' }} title={`PDF: ${totalPdfs}`} />
                  )}
                  {totalDocx > 0 && (
                    <div style={{ width: `${(totalDocx / totalArchivosSistema) * 100}%`, backgroundColor: '#1D5C96' }} title={`Word: ${totalDocx}`} />
                  )}
                  {totalImagenes > 0 && (
                    <div style={{ width: `${(totalImagenes / totalArchivosSistema) * 100}%`, backgroundColor: '#5B6675' }} title={`Imágenes: ${totalImagenes}`} />
                  )}
                  {totalTextos > 0 && (
                    <div style={{ width: `${(totalTextos / totalArchivosSistema) * 100}%`, backgroundColor: '#94A3B8' }} title={`Texto: ${totalTextos}`} />
                  )}
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px', color: theme.textSecondary }}>
                  <span>PDF: <strong>{totalPdfs}</strong></span>
                  <span>Word (.docx): <strong>{totalDocx}</strong></span>
                  <span>Imágenes: <strong>{totalImagenes}</strong></span>
                  <span>Texto: <strong>{totalTextos}</strong></span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '14px', color: theme.textSecondary }}>
                No hay documentos registrados para mostrar estadísticas de formato.
              </p>
            )}
          </div>
        </div>
      )}

      {pacienteParaNotas && (
        <NotasMedicasModal
          paciente={pacienteParaNotas}
          usuario={usuario}
          onClose={() => setPacienteParaNotas(null)}
          notificar={notificar}
          onNotaAgregada={() => {
            if (cargarDatos) cargarDatos(false)
          }}
        />
      )}
    </div>
  )
}
