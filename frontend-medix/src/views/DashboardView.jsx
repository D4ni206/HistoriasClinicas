import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { esPdf, esDocx, esImagen, esTexto } from '../utils/fileHelpers'
import { API_BASE } from '../api/config'
import NotasMedicasModal from '../components/NotasMedicasModal'
import DocxViewer from '../components/DocxViewer'
import TextViewer from '../components/TextViewer'

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

function extraerEdadPaciente(paciente) {
  if (!paciente) return 'N/R'
  if (paciente.edad) return `${paciente.edad} años`
  const textos = [
    ...(paciente.notas_medicas || []).map(n => n.contenido || ''),
    ...(paciente.signos_vitales || []).map(s => s.observaciones || '')
  ].join(' ')
  const match = textos.match(/(\d{1,3})\s*a[ñn]os/i)
  return match ? `${match[1]} años` : 'N/R'
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
  const location = useLocation()
  const { theme } = useTheme()
  const { token } = useAuth()
  const [pacienteParaNotas, setPacienteParaNotas] = useState(null)

  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [pagina, setPagina] = useState(1)
  const porPagina = 10

  // Carpetas desplegadas en la tabla izquierda
  const [carpetasExpandidas, setCarpetasExpandidas] = useState(() => new Set())
  // Pestaña activa en el visor derecho ('documento' | 'notas' | 'timeline')
  const [pestanaVisor, setPestanaVisor] = useState('documento')
  const [imgError, setImgError] = useState(false)
  const [esPantallaPequena, setEsPantallaPequena] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  )

  useEffect(() => {
    const handleResize = () => setEsPantallaPequena(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const esVistaAnalitica = vistaDashboard === 'analitica'

  // Si venimos redirigidos tras guardar una historia (?dni=XXXX), abrir su carpeta y mostrarla a la derecha
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const dniParam = params.get('dni')
    if (dniParam && pacientes.length > 0) {
      const pacEncontrado = pacientes.find(p => String(p.dni).trim() === String(dniParam).trim())
      if (pacEncontrado) {
        setCarpetasExpandidas(prev => {
          const next = new Set(prev)
          next.add(pacEncontrado.id)
          return next
        })
        const docPrincipal = (pacEncontrado.documentos && pacEncontrado.documentos.length > 0)
          ? pacEncontrado.documentos[0]
          : null
        setDocumentoEnVista({
          id: docPrincipal ? docPrincipal.id : null,
          nombre_archivo: docPrincipal
            ? (docPrincipal.nombre_original || docPrincipal.nombre_archivo)
            : `Carpeta Clínica - DNI ${pacEncontrado.dni}`,
          nombre_original: docPrincipal ? docPrincipal.nombre_original : null,
          paciente_id: pacEncontrado.id,
          paciente_dni: pacEncontrado.dni,
          paciente: pacEncontrado,
          fecha_subida: docPrincipal ? docPrincipal.fecha_subida : 'Expediente Activo'
        })
      }
    }
  }, [location.search, pacientes, setDocumentoEnVista])

  useEffect(() => {
    setImgError(false)
  }, [documentoEnVista?.id])

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

  const toggleCarpetaLocal = (pac) => {
    setCarpetasExpandidas(prev => {
      const next = new Set(prev)
      if (next.has(pac.id)) {
        next.delete(pac.id)
      } else {
        next.add(pac.id)
      }
      return next
    })
  }

  const seleccionarPacienteYDocumento = (pac, docEspecifico = null) => {
    setCarpetasExpandidas(prev => {
      const next = new Set(prev)
      next.add(pac.id)
      return next
    })
    const docTarget = docEspecifico || ((pac.documentos && pac.documentos.length > 0) ? pac.documentos[0] : null)
    setDocumentoEnVista({
      id: docTarget ? docTarget.id : null,
      nombre_archivo: docTarget
        ? (docTarget.nombre_original || docTarget.nombre_archivo)
        : `Carpeta Clínica - DNI ${pac.dni}`,
      nombre_original: docTarget ? docTarget.nombre_original : null,
      paciente_id: pac.id,
      paciente_dni: pac.dni,
      paciente: pac,
      fecha_subida: docTarget ? docTarget.fecha_subida : 'Expediente Activo'
    })
    setPestanaVisor('documento')
  }

  // Datos del paciente activo en el visor derecho
  const pacienteEnVisor = useMemo(() => {
    if (!documentoEnVista) return null
    return (
      pacientes.find(p => p.id === documentoEnVista.paciente_id || String(p.dni) === String(documentoEnVista.paciente_dni)) ||
      documentoEnVista.paciente ||
      null
    )
  }, [documentoEnVista, pacientes])

  const notasVisor = useMemo(() => pacienteEnVisor?.notas_medicas || [], [pacienteEnVisor])
  const signosVisor = useMemo(() => pacienteEnVisor?.signos_vitales || [], [pacienteEnVisor])
  const docsVisor = useMemo(() => pacienteEnVisor?.documentos || [], [pacienteEnVisor])
  const ultimoSignoVisor = signosVisor.length > 0 ? signosVisor[0] : null

  const eventosTimelineVisor = useMemo(() => {
    if (!pacienteEnVisor) return []
    const lista = []
    docsVisor.forEach(doc => {
      lista.push({
        tipo: 'Documento',
        id: `doc-${doc.id}`,
        fechaRaw: doc.fecha_subida ? new Date(doc.fecha_subida).getTime() : 0,
        fecha: doc.fecha_subida || 'Sin fecha',
        titulo: doc.nombre_original || doc.nombre_archivo || 'Documento clínico',
        subtitulo: 'Archivo en carpeta del paciente',
        doc
      })
    })
    notasVisor.forEach(nota => {
      lista.push({
        tipo: 'Nota médica',
        id: `nota-${nota.id}`,
        fechaRaw: nota.fecha ? new Date(nota.fecha).getTime() : 0,
        fecha: nota.fecha || 'Reciente',
        titulo: nota.diagnostico || 'Evolución médica',
        subtitulo: nota.medico_nombre ? `Médico: ${nota.medico_nombre}` : 'Médico tratante',
        contenido: nota.contenido
      })
    })
    signosVisor.forEach(signo => {
      lista.push({
        tipo: 'Signos vitales',
        id: `signo-${signo.id}`,
        fechaRaw: signo.fecha ? new Date(signo.fecha).getTime() : 0,
        fecha: signo.fecha || 'Reciente',
        titulo: 'Control de triaje',
        subtitulo: signo.enfermera_nombre ? `Responsable: ${signo.enfermera_nombre}` : 'Enfermería',
        signoData: signo
      })
    })
    return lista.sort((a, b) => b.fechaRaw - a.fechaRaw)
  }, [pacienteEnVisor, docsVisor, notasVisor, signosVisor])

  const obtenerUrlArchivo = (id, view = false) => {
    let url = `${API_BASE}/documentos/${id}/archivo`
    const params = []
    if (view) params.push('view=1')
    if (token) params.push(`token=${encodeURIComponent(token)}`)
    if (params.length > 0) url += `?${params.join('&')}`
    return url
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      {/* Cabecera superior */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="medix-page-title">Historias Clínicas</h1>
          <p className="medix-page-subtitle">
            Hospital San Juan de Dios de Pisco · {pacientesFiltradosFinal.length} carpeta{pacientesFiltradosFinal.length !== 1 ? 's' : ''} de paciente{pacientesFiltradosFinal.length !== 1 ? 's' : ''}
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
              Carpetas / Tabla
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

      {/* =================================================================== */}
      {/* VISTA PRINCIPAL DIVIDIDA: IZQUIERDA TABLA DE CARPETAS / DERECHA VISOR */}
      {/* =================================================================== */}
      {!esVistaAnalitica && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: esPantallaPequena ? '1fr' : 'minmax(440px, 50%) minmax(400px, 50%)',
            gap: '16px',
            alignItems: 'start',
            flex: 1,
            minHeight: 0
          }}
        >
          {/* =============================================================== */}
          {/* COLUMNA IZQUIERDA: BUSCADOR COMPACTO + TABLA DE CARPETAS */}
          {/* =============================================================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
            {/* Barra de búsqueda y filtros compacta sobre la tabla izquierda */}
            <div
              className="medix-card"
              style={{
                padding: '10px 12px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'flex-end'
              }}
            >
              <div style={{ flex: '1 1 180px', minWidth: '150px' }}>
                <label htmlFor="buscador-expedientes" className="medix-label" style={{ fontSize: '11px' }}>
                  Buscar carpeta (DNI o nombre)
                </label>
                <input
                  id="buscador-expedientes"
                  type="search"
                  className="medix-input"
                  style={{ height: '34px', fontSize: '13px' }}
                  placeholder="DNI o nombre del paciente..."
                  value={busquedaDni}
                  onChange={(e) => setBusquedaDni(e.target.value)}
                />
              </div>

              <div style={{ flex: '0 1 140px' }}>
                <label htmlFor="filtro-tipo-expediente" className="medix-label" style={{ fontSize: '11px' }}>
                  Filtro
                </label>
                <select
                  id="filtro-tipo-expediente"
                  className="medix-input"
                  style={{ height: '34px', fontSize: '12.5px', padding: '0 8px' }}
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="pdf">PDF / Formato</option>
                  <option value="docx">Word</option>
                  <option value="imagen">Imágenes</option>
                  <option value="notas">Con notas</option>
                  <option value="alergias">Con alergia</option>
                </select>
              </div>

              <div style={{ flex: '0 1 135px' }}>
                <label htmlFor="filtro-fecha-expediente" className="medix-label" style={{ fontSize: '11px' }}>
                  Fecha
                </label>
                <input
                  id="filtro-fecha-expediente"
                  type="date"
                  className="medix-input"
                  style={{ height: '34px', fontSize: '12.5px', padding: '0 8px' }}
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {(busquedaDni || filtroTipo !== 'todos' || filtroFecha) && (
                  <button
                    type="button"
                    className="medix-btn medix-btn-secondary medix-btn-sm"
                    style={{ height: '34px' }}
                    onClick={() => {
                      setBusquedaDni('')
                      setFiltroTipo('todos')
                      setFiltroFecha('')
                    }}
                  >
                    Limpiar
                  </button>
                )}
                <button
                  type="button"
                  className="medix-btn medix-btn-secondary medix-btn-sm"
                  style={{ height: '34px' }}
                  onClick={() => cargarDatos && cargarDatos(false)}
                >
                  Actualizar
                </button>
              </div>
            </div>

            {/* Tabla compacta que funciona como carpeta para cada paciente */}
            {pacientesFiltradosFinal.length === 0 ? (
              <div className="medix-card" style={{ padding: '32px 20px', textAlign: 'center', color: theme.textSecondary }}>
                No se encontraron carpetas de pacientes con los filtros aplicados.
              </div>
            ) : (
              <div className="medix-card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="medix-table" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '10px 12px' }}>Carpeta del Paciente</th>
                        <th style={{ padding: '10px 8px' }}>Archivos</th>
                        <th style={{ padding: '10px 8px' }}>Notas</th>
                        <th style={{ padding: '10px 8px' }}>Estado</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pacientesPaginados.map((pac) => {
                        const docs = pac.documentos || []
                        const totalNotas = pac.total_notas ?? (pac.notas_medicas ? pac.notas_medicas.length : 0)
                        const ultimaAtencion = obtenerUltimaAtencion(pac)
                        const tieneAlergia = pacienteTieneAlergia(pac)
                        const seleccionado = documentoEnVista && documentoEnVista.paciente_id === pac.id
                        const carpetaAbierta = carpetasExpandidas.has(pac.id)

                        return (
                          <FragmentCarpetaPaciente
                            key={pac.id}
                            pac={pac}
                            docs={docs}
                            totalNotas={totalNotas}
                            ultimaAtencion={ultimaAtencion}
                            tieneAlergia={tieneAlergia}
                            seleccionado={seleccionado}
                            carpetaAbierta={carpetaAbierta}
                            documentoEnVista={documentoEnVista}
                            theme={theme}
                            onToggleCarpeta={() => toggleCarpetaLocal(pac)}
                            onVerHistoria={(docEsp) => seleccionarPacienteYDocumento(pac, docEsp)}
                            onSubirArchivo={agregarArchivoACarpeta ? () => agregarArchivoACarpeta(pac.dni, pac.id) : null}
                            onAbrirNotas={() => setPacienteParaNotas(pac)}
                            onEliminarPaciente={handleEliminarPaciente ? () => handleEliminarPaciente(pac.id, pac.dni) : null}
                            onEliminarDocumento={handleEliminarDocumento}
                            obtenerUrlArchivo={obtenerUrlArchivo}
                          />
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Paginación compacta */}
            {totalPaginas > 1 && (
              <div
                className="medix-card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                  {indiceInicio + 1}–{Math.min(indiceInicio + porPagina, pacientesFiltradosFinal.length)} de {pacientesFiltradosFinal.length} carpetas
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
                  <span style={{ fontSize: '12px', fontWeight: 600, padding: '0 6px' }}>
                    {pagina} / {totalPaginas}
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
          </div>

          {/* =============================================================== */}
          {/* COLUMNA DERECHA: VISOR INTEGRADO EN EL ESPACIO DE LA DERECHA */}
          {/* =============================================================== */}
          <div
            className="medix-card"
            style={{
              position: esPantallaPequena ? 'relative' : 'sticky',
              top: 0,
              height: esPantallaPequena ? '640px' : 'calc(100vh - 118px)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {!documentoEnVista ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px 24px',
                  textAlign: 'center',
                  color: theme.textSecondary,
                  gap: '10px'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    backgroundColor: theme.bgSubtle,
                    border: theme.border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-navy)',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  HC
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: theme.textHeading }}>
                  Visor de Historia Clínica
                </div>
                <p style={{ fontSize: '13px', maxWidth: '340px', lineHeight: 1.45 }}>
                  Seleccione una carpeta de paciente en la tabla izquierda o pulse <strong>"Ver historia"</strong> para visualizar sus documentos y notas médicas en este espacio.
                </p>
              </div>
            ) : (
              <>
                {/* Cabecera compacta del visor derecho */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: theme.border,
                    backgroundColor: theme.bgCard,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 700, color: theme.textHeading, margin: 0 }}>
                        {pacienteEnVisor?.nombre || `Paciente DNI ${documentoEnVista.paciente_dni || pacienteEnVisor?.dni || ''}`}
                      </h2>
                      {pacienteTieneAlergia(pacienteEnVisor) && (
                        <span className="medix-badge medix-badge-alert">
                          Alergia: {pacienteEnVisor.alergias}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: theme.textSecondary, marginTop: '3px' }}>
                      <span>DNI: <strong>{documentoEnVista.paciente_dni || pacienteEnVisor?.dni || '—'}</strong></span>
                      <span>Edad: <strong>{extraerEdadPaciente(pacienteEnVisor)}</strong></span>
                      <span>Carpeta: <strong>#{pacienteEnVisor?.id || documentoEnVista.paciente_id || '—'}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {documentoEnVista.id && (
                      <a
                        href={obtenerUrlArchivo(documentoEnVista.id)}
                        download={documentoEnVista.nombre_original || documentoEnVista.nombre_archivo || 'historia'}
                        className="medix-btn medix-btn-secondary medix-btn-sm"
                      >
                        Descargar
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setDocumentoEnVista(null)}
                      className="medix-btn medix-btn-secondary medix-btn-sm"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>

                {/* 4 cuadros compactos de signos vitales */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                    padding: '8px 14px',
                    backgroundColor: theme.bgApp,
                    borderBottom: theme.border
                  }}
                >
                  {[
                    { label: 'P. Arterial', valor: ultimoSignoVisor?.presion_arterial || '—' },
                    { label: 'F. Cardíaca', valor: ultimoSignoVisor?.frecuencia_cardiaca || '—' },
                    { label: 'Temp.', valor: ultimoSignoVisor?.temperatura || '—' },
                    { label: 'SpO₂', valor: ultimoSignoVisor?.saturacion_oxigeno || '—' }
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        backgroundColor: theme.bgCard,
                        border: theme.border,
                        borderRadius: '6px',
                        padding: '5px 8px'
                      }}
                    >
                      <div style={{ fontSize: '11px', color: theme.textSecondary }}>{item.label}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: theme.textHeading }}>{item.valor}</div>
                    </div>
                  ))}
                </div>

                {/* Barra de pestañas y selector de archivos dentro de la carpeta */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    backgroundColor: theme.bgCard,
                    borderBottom: theme.border,
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { id: 'documento', label: `Documento (${docsVisor.length})` },
                      { id: 'notas', label: `Notas (${notasVisor.length})` },
                      { id: 'timeline', label: 'Línea de Tiempo' }
                    ].map((tab) => {
                      const activa = pestanaVisor === tab.id
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setPestanaVisor(tab.id)}
                          className="medix-btn medix-btn-sm"
                          style={{
                            backgroundColor: activa ? 'var(--color-navy)' : theme.bgSubtle,
                            color: activa ? '#FFFFFF' : theme.textSecondary,
                            border: activa ? 'none' : theme.border
                          }}
                        >
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>

                  {docsVisor.length > 1 && pestanaVisor === 'documento' && (
                    <select
                      aria-label="Seleccionar archivo de la carpeta"
                      className="medix-input"
                      style={{ width: 'auto', maxWidth: '210px', height: '30px', fontSize: '12px', padding: '0 8px' }}
                      value={documentoEnVista.id || ''}
                      onChange={(e) => {
                        const docSel = docsVisor.find(d => String(d.id) === String(e.target.value))
                        if (docSel && pacienteEnVisor) {
                          seleccionarPacienteYDocumento(pacienteEnVisor, docSel)
                        }
                      }}
                    >
                      {docsVisor.map((d, i) => (
                        <option key={d.id} value={d.id}>
                          {i + 1}. {d.nombre_original || d.nombre_archivo}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Cuerpo del visor derecho */}
                <div style={{ flex: 1, overflow: 'auto', padding: '12px', backgroundColor: theme.bgApp }}>
                  {pestanaVisor === 'documento' && (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {documentoEnVista.id ? (
                        (() => {
                          const nombreArch = documentoEnVista.nombre_original || documentoEnVista.nombre_archivo || ''
                          if (esPdf(nombreArch)) {
                            return (
                              <iframe
                                src={obtenerUrlArchivo(documentoEnVista.id, true)}
                                title={`Visor - ${nombreArch}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  minHeight: '420px',
                                  border: theme.border,
                                  borderRadius: '8px',
                                  backgroundColor: '#FFFFFF',
                                  flex: 1
                                }}
                              />
                            )
                          }
                          if (esDocx(nombreArch)) {
                            return <DocxViewer url={obtenerUrlArchivo(documentoEnVista.id, true)} />
                          }
                          if (esImagen(nombreArch)) {
                            return (
                              <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                                {imgError ? (
                                  <div className="medix-card" style={{ padding: '20px', color: theme.textSecondary }}>
                                    No se pudo previsualizar la imagen. Utilice el botón Descargar.
                                  </div>
                                ) : (
                                  <img
                                    src={obtenerUrlArchivo(documentoEnVista.id, true)}
                                    alt={nombreArch}
                                    onError={() => setImgError(true)}
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
                                  />
                                )}
                              </div>
                            )
                          }
                          if (esTexto(nombreArch)) {
                            return <TextViewer url={obtenerUrlArchivo(documentoEnVista.id, true)} />
                          }
                          return (
                            <div className="medix-card" style={{ padding: '24px', textAlign: 'center' }}>
                              <p style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '12px' }}>
                                Este archivo no tiene vista previa directa.
                              </p>
                              <a
                                href={obtenerUrlArchivo(documentoEnVista.id)}
                                download={nombreArch}
                                className="medix-btn medix-btn-primary medix-btn-sm"
                              >
                                Descargar archivo
                              </a>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="medix-card" style={{ padding: '28px 20px', textAlign: 'center', color: theme.textSecondary }}>
                          Esta carpeta aún no tiene archivos digitalizados.
                        </div>
                      )}
                    </div>
                  )}

                  {pestanaVisor === 'notas' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {pacienteEnVisor && (
                          <button
                            type="button"
                            onClick={() => setPacienteParaNotas(pacienteEnVisor)}
                            className="medix-btn medix-btn-primary medix-btn-sm"
                          >
                            + Redactar nota médica
                          </button>
                        )}
                      </div>
                      {notasVisor.length === 0 ? (
                        <div className="medix-card" style={{ padding: '24px', textAlign: 'center', color: theme.textSecondary }}>
                          No hay notas médicas registradas en esta carpeta.
                        </div>
                      ) : (
                        notasVisor.map((n) => (
                          <div key={n.id} className="medix-card" style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '13px', color: theme.textHeading }}>
                                {n.diagnostico || 'Nota de evolución clínica'}
                              </strong>
                              <span style={{ fontSize: '11.5px', color: theme.textSecondary }}>{n.fecha || 'Reciente'}</span>
                            </div>
                            <p style={{ fontSize: '13px', color: theme.textMain, lineHeight: 1.45, margin: 0, whiteSpace: 'pre-wrap' }}>
                              {n.contenido}
                            </p>
                            <div style={{ fontSize: '11.5px', color: theme.textSecondary, marginTop: '6px' }}>
                              Médico: {n.medico_nombre || 'Médico tratante'}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {pestanaVisor === 'timeline' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {eventosTimelineVisor.length === 0 ? (
                        <div className="medix-card" style={{ padding: '24px', textAlign: 'center', color: theme.textSecondary }}>
                          Sin eventos clínicos registrados.
                        </div>
                      ) : (
                        eventosTimelineVisor.map((ev) => (
                          <div key={ev.id} className="medix-card" style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '2px' }}>
                              <strong style={{ color: 'var(--color-primary)' }}>{ev.tipo}</strong>
                              <span style={{ color: theme.textSecondary }}>{ev.fecha}</span>
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: theme.textMain }}>{ev.titulo}</div>
                            <div style={{ fontSize: '11.5px', color: theme.textSecondary }}>{ev.subtitulo}</div>
                            {ev.doc && (
                              <div style={{ marginTop: '6px' }}>
                                <button
                                  type="button"
                                  className="medix-btn medix-btn-primary medix-btn-sm"
                                  onClick={() => pacienteEnVisor && seleccionarPacienteYDocumento(pacienteEnVisor, ev.doc)}
                                >
                                  Abrir documento
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VISTA 2: ANALÍTICA */}
      {/* =================================================================== */}
      {esVistaAnalitica && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
            <div className="medix-card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase' }}>
                Carpetas de Pacientes
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
                Promedio por Carpeta
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
                  <span>PDF / Formato: <strong>{totalPdfs}</strong></span>
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

function FragmentCarpetaPaciente({
  pac,
  docs,
  totalNotas,
  ultimaAtencion,
  tieneAlergia,
  seleccionado,
  carpetaAbierta,
  documentoEnVista,
  theme,
  onToggleCarpeta,
  onVerHistoria,
  onSubirArchivo,
  onAbrirNotas,
  onEliminarPaciente,
  onEliminarDocumento
}) {
  return (
    <>
      <tr
        style={{
          backgroundColor: seleccionado ? theme.tableRowHover : undefined,
          cursor: 'pointer'
        }}
        onClick={onToggleCarpeta}
      >
        <td style={{ padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                width: '14px',
                display: 'inline-block'
              }}
              title={carpetaAbierta ? 'Contraer carpeta' : 'Desplegar carpeta del paciente'}
            >
              {carpetaAbierta ? '▼' : '▶'}
            </span>

            <div className="medix-avatar" style={{ width: '32px', height: '32px', fontSize: '11px' }}>
              {obtenerIniciales(pac.nombre, pac.dni)}
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: theme.textMain, fontSize: '13px' }}>
                  {pac.nombre || 'Paciente registrado'}
                </span>
                {tieneAlergia && (
                  <span className="medix-badge medix-badge-alert" style={{ fontSize: '10.5px', padding: '1px 6px' }}>
                    Alergia: {pac.alergias}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11.5px', color: theme.textSecondary }}>
                DNI: <strong>{pac.dni}</strong> · Carpeta #{pac.id} {ultimaAtencion ? `· ${ultimaAtencion.slice(0, 10)}` : ''}
              </div>
            </div>
          </div>
        </td>

        <td style={{ padding: '10px 8px' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={onToggleCarpeta}
              className="medix-btn medix-btn-secondary medix-btn-sm"
              style={{ height: '26px', padding: '0 8px', fontSize: '11.5px' }}
            >
              {docs.length} {docs.length === 1 ? 'archivo' : 'archivos'}
            </button>
            {onSubirArchivo && (
              <button
                type="button"
                className="medix-btn medix-btn-secondary medix-btn-sm"
                style={{ height: '26px', padding: '0 7px', fontSize: '11px' }}
                onClick={onSubirArchivo}
                title="Subir archivo a esta carpeta"
              >
                +
              </button>
            )}
          </div>
        </td>

        <td style={{ padding: '10px 8px' }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="medix-btn medix-btn-secondary medix-btn-sm"
            style={{ height: '26px', padding: '0 8px', fontSize: '11.5px' }}
            onClick={onAbrirNotas}
          >
            {totalNotas} {totalNotas === 1 ? 'nota' : 'notas'}
          </button>
        </td>

        <td style={{ padding: '10px 8px' }}>
          <span className="medix-badge medix-badge-status" style={{ fontSize: '11px', padding: '1px 7px' }}>
            Activo
          </span>
        </td>

        <td style={{ padding: '10px 12px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="medix-btn medix-btn-primary medix-btn-sm"
              style={{ height: '28px', padding: '0 10px', fontSize: '11.5px' }}
              onClick={() => onVerHistoria(null)}
            >
              Ver historia
            </button>
            {onEliminarPaciente && (
              <button
                type="button"
                className="medix-btn medix-btn-danger medix-btn-sm"
                style={{ height: '28px', padding: '0 8px', fontSize: '11.5px' }}
                onClick={onEliminarPaciente}
              >
                Eliminar
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Contenido desplegable de la Carpeta del Paciente */}
      {carpetaAbierta && (
        <tr>
          <td colSpan={5} style={{ padding: '10px 16px 12px 36px', backgroundColor: theme.bgSubtle, borderBottom: theme.border }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: theme.textHeading }}>
                  Archivos dentro de la carpeta de {pac.nombre || `DNI ${pac.dni}`} ({docs.length}):
                </span>
                {onSubirArchivo && (
                  <button
                    type="button"
                    onClick={onSubirArchivo}
                    className="medix-btn medix-btn-secondary medix-btn-sm"
                    style={{ height: '24px', fontSize: '11px', padding: '0 8px' }}
                  >
                    + Agregar archivo a carpeta
                  </button>
                )}
              </div>

              {docs.length === 0 ? (
                <div style={{ fontSize: '12px', color: theme.textSecondary, padding: '4px 0' }}>
                  No hay archivos guardados en esta carpeta.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {docs.map((d, idx) => {
                    const docActivo = documentoEnVista && documentoEnVista.id === d.id
                    const nombreDoc = d.nombre_original || d.nombre_archivo
                    return (
                      <div
                        key={d.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          backgroundColor: docActivo ? theme.tableRowHover : theme.bgCard,
                          border: docActivo ? '1px solid var(--color-primary)' : theme.border,
                          gap: '8px'
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: theme.textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {idx + 1}. {nombreDoc}
                          </div>
                          <div style={{ fontSize: '11px', color: theme.textSecondary }}>
                            Subido: {d.fecha_subida || 'Reciente'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => onVerHistoria(d)}
                            className="medix-btn medix-btn-primary medix-btn-sm"
                            style={{ height: '26px', padding: '0 9px', fontSize: '11px' }}
                          >
                            {docActivo ? 'Viendo a la derecha' : 'Ver a la derecha'}
                          </button>
                          {onEliminarDocumento && (
                            <button
                              type="button"
                              onClick={() => onEliminarDocumento(d.id, nombreDoc, pac.id)}
                              className="medix-btn medix-btn-danger medix-btn-sm"
                              style={{ height: '26px', padding: '0 8px', fontSize: '11px' }}
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
