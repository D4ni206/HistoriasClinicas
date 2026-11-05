import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import NotasMedicasModal from '../components/NotasMedicasModal'

export default function DashboardView({
  pacientes = [],
  pacientesFiltrados: _pacientesFiltrados = [],
  todosLosDocumentos = [],
  documentosFiltradosTabla: _documentosFiltradosTabla = [],
  totalPdfs = 0,
  totalDocx = 0,
  totalImagenes = 0,
  totalTextos = 0,
  totalArchivosSistema = 0,
  busquedaDni = '',
  setBusquedaDni = () => {},
  vistaDashboard = 'tabla',
  setVistaDashboard = () => {},
  filtroTipoDoc = 'todos',
  setFiltroTipoDoc = () => {},
  carpetasAbiertas: _carpetasAbiertas,
  setCarpetasAbiertas: _setCarpetasAbiertas,
  toggleCarpeta: _toggleCarpeta,
  expandirTodas: _expandirTodas,
  colapsarTodas: _colapsarTodas,
  agregarArchivoACarpeta = () => {},
  editandoPaciente: _editandoPaciente,
  setEditandoPaciente: _setEditandoPaciente,
  nuevoDni: _nuevoDni,
  setNuevoDni: _setNuevoDni,
  handleGuardarDni: _handleGuardarDni,
  handleEliminarPaciente = () => {},
  handleEliminarDocumento: _handleEliminarDocumento = () => {},
  documentoEnVista: _documentoEnVista,
  setDocumentoEnVista = () => {},
  onVerSilueta = () => {},
  notificar = () => {},
  loading = false,
  cargarDatos = () => {},
  usuario
}) {
  const navigate = useNavigate()
  const { temaOscuro } = useTheme()
  const [pacienteParaNotas, setPacienteParaNotas] = useState(null)

  // Filtros adicionales: rango de fecha
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')

  // Paginación de la tabla principal
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(10)

  const rolRaw = (usuario?.rol || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  const esAdmin = rolRaw.includes('admin')

  // Obtener fecha más reciente de un paciente
  const obtenerUltimaAtencion = (p) => {
    const fechas = []
    if (p.documentos && p.documentos.length > 0) {
      p.documentos.forEach(d => {
        if (d.fecha_subida) fechas.push(new Date(d.fecha_subida))
      })
    }
    if (p.notas_medicas && p.notas_medicas.length > 0) {
      p.notas_medicas.forEach(n => {
        if (n.fecha_creacion) fechas.push(new Date(n.fecha_creacion))
      })
    }
    if (p.signos_vitales && p.signos_vitales.length > 0) {
      p.signos_vitales.forEach(s => {
        if (s.fecha_registro) fechas.push(new Date(s.fecha_registro))
      })
    }
    if (p.fecha_creacion) {
      fechas.push(new Date(p.fecha_creacion))
    }
    const validas = fechas.filter(f => !isNaN(f.getTime()))
    if (validas.length === 0) return null
    validas.sort((a, b) => b.getTime() - a.getTime())
    return validas[0]
  }

  // Obtener iniciales para avatar sobrio
  const obtenerIniciales = (nombre, dni) => {
    if (nombre && nombre.trim()) {
      const partes = nombre.trim().split(/\s+/).filter(Boolean)
      if (partes.length >= 2) {
        return (partes[0][0] + partes[1][0]).toUpperCase()
      }
      return partes[0].slice(0, 2).toUpperCase()
    }
    return (dni || 'HC').slice(0, 2).toUpperCase()
  }

  // Filtrado de pacientes
  const pacientesFiltrados = useMemo(() => {
    let res = pacientes || []
    const q = (busquedaDni || '').trim().toLowerCase()

    if (q) {
      res = res.filter(p => {
        const matchDni = p.dni && p.dni.toLowerCase().includes(q)
        const matchNombre = p.nombre && p.nombre.toLowerCase().includes(q)
        const matchAlergia = p.alergias && p.alergias.toLowerCase().includes(q)
        return matchDni || matchNombre || matchAlergia
      })
    }

    // Filtro por tipo de documento
    if (filtroTipoDoc && filtroTipoDoc !== 'todos') {
      res = res.filter(p => {
        const docs = p.documentos || []
        return docs.some(d => {
          const ext = (d.nombre_archivo || '').split('.').pop().toLowerCase()
          if (filtroTipoDoc === 'pdf') return ext === 'pdf'
          if (filtroTipoDoc === 'docx') return ext === 'docx' || ext === 'doc'
          if (filtroTipoDoc === 'imagen') return ['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext)
          if (filtroTipoDoc === 'texto') return ['txt', 'csv', 'rtf'].includes(ext)
          return true
        })
      })
    }

    // Filtro por rango de fechas
    if (filtroFechaDesde) {
      const fDesde = new Date(filtroFechaDesde)
      res = res.filter(p => {
        const ultima = obtenerUltimaAtencion(p)
        return ultima ? ultima >= fDesde : false
      })
    }

    if (filtroFechaHasta) {
      const fHasta = new Date(filtroFechaHasta)
      fHasta.setHours(23, 59, 59, 999)
      res = res.filter(p => {
        const ultima = obtenerUltimaAtencion(p)
        return ultima ? ultima <= fHasta : false
      })
    }

    return res
  }, [pacientes, busquedaDni, filtroTipoDoc, filtroFechaDesde, filtroFechaHasta])

  // Reset de página al cambiar filtros
  useEffect(() => {
    setPagina(1)
  }, [busquedaDni, filtroTipoDoc, filtroFechaDesde, filtroFechaHasta, porPagina])

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(pacientesFiltrados.length / porPagina))
  const indiceInicio = (pagina - 1) * porPagina
  const pacientesPaginados = pacientesFiltrados.slice(indiceInicio, indiceInicio + porPagina)

  const abrirVisorPaciente = (pacienteSel) => {
    if (onVerSilueta) {
      onVerSilueta(pacienteSel)
    } else {
      const primerDoc = (pacienteSel.documentos && pacienteSel.documentos.length > 0) ? pacienteSel.documentos[0] : null
      setDocumentoEnVista({
        id: primerDoc ? primerDoc.id : null,
        nombre_archivo: primerDoc ? (primerDoc.nombre_original || primerDoc.nombre_archivo) : `Historia Clínica Digital - DNI ${pacienteSel.dni}`,
        paciente_id: pacienteSel.id,
        paciente_dni: pacienteSel.dni,
        paciente: pacienteSel,
        fecha_subida: primerDoc ? primerDoc.fecha_subida : 'Expediente Activo'
      })
    }
  }

  const esVistaAnalitica = vistaDashboard === 'analitica'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* 1. CABECERA SUPERIOR: TÍTULO, ACCIONES Y VISTAS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--medix-navy, #0B2545)',
              margin: 0,
              letterSpacing: '-0.3px',
              lineHeight: 1.2
            }}
          >
            Historias Clínicas
          </h1>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '13px',
              color: 'var(--medix-text-muted, #5B6675)'
            }}
          >
            {esVistaAnalitica
              ? 'Métricas institucionales y distribución documental'
              : `${pacientesFiltrados.length} expedientes clínicos registrados en el sistema`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Selector de 2 vistas: Tabla y Analítica */}
          <div
            role="tablist"
            aria-label="Vistas del sistema"
            style={{
              display: 'flex',
              backgroundColor: temaOscuro ? 'rgba(255, 255, 255, 0.05)' : '#E9ECEF',
              padding: '3px',
              borderRadius: '8px'
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={!esVistaAnalitica}
              onClick={() => setVistaDashboard('tabla')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: !esVistaAnalitica ? '600' : '500',
                backgroundColor: !esVistaAnalitica
                  ? (temaOscuro ? '#1E293B' : '#FFFFFF')
                  : 'transparent',
                color: !esVistaAnalitica
                  ? 'var(--medix-action, #1D5C96)'
                  : 'var(--medix-text-muted, #5B6675)',
                boxShadow: !esVistaAnalitica ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              <span>Listado de Historias</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={esVistaAnalitica}
              onClick={() => setVistaDashboard('analitica')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: esVistaAnalitica ? '600' : '500',
                backgroundColor: esVistaAnalitica
                  ? (temaOscuro ? '#1E293B' : '#FFFFFF')
                  : 'transparent',
                color: esVistaAnalitica
                  ? 'var(--medix-action, #1D5C96)'
                  : 'var(--medix-text-muted, #5B6675)',
                boxShadow: esVistaAnalitica ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <span>Analítica</span>
            </button>
          </div>

          {/* Botón Primario: Nueva Historia */}
          <button
            type="button"
            onClick={() => navigate('/agregarhistoria')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--medix-action, #1D5C96)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--medix-action-hover, #164775)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--medix-action, #1D5C96)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Nueva historia</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. VISTA PRINCIPAL: TABLA CLÍNICA DE PACIENTES */}
      {/* =================================================================== */}
      {!esVistaAnalitica && (
        <>
          {/* BARRA DE FILTROS: Búsqueda, Tipo de Documento, Rango de Fechas */}
          <div
            style={{
              backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
              border: '1px solid var(--medix-border, #D9DEE5)',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            {/* Buscador por DNI o Nombre */}
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <label htmlFor="input-busqueda-paciente" style={{ display: 'none' }}>
                Buscar paciente por DNI o nombre
              </label>
              <input
                id="input-busqueda-paciente"
                type="text"
                placeholder="Buscar por DNI o nombre del paciente..."
                value={busquedaDni}
                onChange={(e) => setBusquedaDni(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 32px 8px 34px',
                  borderRadius: '6px',
                  border: '1px solid var(--medix-border, #D9DEE5)',
                  fontSize: '13px',
                  backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
                  color: 'var(--medix-text-main, #1F2937)',
                  outline: 'none'
                }}
              />
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--medix-text-muted, #5B6675)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {busquedaDni && (
                <button
                  type="button"
                  aria-label="Limpiar búsqueda"
                  onClick={() => setBusquedaDni('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--medix-text-muted, #5B6675)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '2px 4px'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filtro: Tipo de Documento */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label htmlFor="filtro-tipo-doc" style={{ fontSize: '12px', fontWeight: '500', color: 'var(--medix-text-muted, #5B6675)' }}>
                Tipo:
              </label>
              <select
                id="filtro-tipo-doc"
                value={filtroTipoDoc}
                onChange={(e) => setFiltroTipoDoc(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--medix-border, #D9DEE5)',
                  fontSize: '13px',
                  backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
                  color: 'var(--medix-text-main, #1F2937)',
                  outline: 'none'
                }}
              >
                <option value="todos">Todos los formatos</option>
                <option value="pdf">PDF (.pdf)</option>
                <option value="docx">Word (.docx)</option>
                <option value="imagen">Imágenes</option>
                <option value="texto">Texto plano</option>
              </select>
            </div>

            {/* Filtro: Rango de Fechas */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <label htmlFor="filtro-fecha-desde" style={{ fontSize: '12px', fontWeight: '500', color: 'var(--medix-text-muted, #5B6675)' }}>
                Desde:
              </label>
              <input
                id="filtro-fecha-desde"
                type="date"
                value={filtroFechaDesde}
                onChange={(e) => setFiltroFechaDesde(e.target.value)}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--medix-border, #D9DEE5)',
                  fontSize: '12px',
                  backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
                  color: 'var(--medix-text-main, #1F2937)',
                  outline: 'none'
                }}
              />

              <label htmlFor="filtro-fecha-hasta" style={{ fontSize: '12px', fontWeight: '500', color: 'var(--medix-text-muted, #5B6675)' }}>
                Hasta:
              </label>
              <input
                id="filtro-fecha-hasta"
                type="date"
                value={filtroFechaHasta}
                onChange={(e) => setFiltroFechaHasta(e.target.value)}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--medix-border, #D9DEE5)',
                  fontSize: '12px',
                  backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
                  color: 'var(--medix-text-main, #1F2937)',
                  outline: 'none'
                }}
              />

              {(filtroFechaDesde || filtroFechaHasta) && (
                <button
                  type="button"
                  onClick={() => {
                    setFiltroFechaDesde('')
                    setFiltroFechaHasta('')
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--medix-action, #1D5C96)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  Limpiar fechas
                </button>
              )}
            </div>

            {/* Botón Actualizar */}
            <button
              type="button"
              onClick={() => cargarDatos(false)}
              aria-label="Actualizar datos"
              title="Sincronizar base de datos"
              style={{
                marginLeft: 'auto',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--medix-border, #D9DEE5)',
                backgroundColor: 'transparent',
                color: 'var(--medix-text-muted, #5B6675)',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              <span>Actualizar</span>
            </button>
          </div>

          {/* TABLA PRINCIPAL DE HISTORIAS */}
          <div
            style={{
              backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
              border: '1px solid var(--medix-border, #D9DEE5)',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '14px'
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--medix-border, #D9DEE5)',
                      backgroundColor: temaOscuro ? 'rgba(255, 255, 255, 0.02)' : '#F8F9FA'
                    }}
                  >
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--medix-text-muted, #5B6675)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Paciente
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--medix-text-muted, #5B6675)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Documentos
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--medix-text-muted, #5B6675)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Notas
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--medix-text-muted, #5B6675)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Última atención
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--medix-text-muted, #5B6675)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Estado
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--medix-text-muted, #5B6675)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'right' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesPaginados.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--medix-text-muted, #5B6675)' }}>
                        {loading ? 'Cargando historias clínicas...' : 'No se encontraron expedientes que coincidan con la búsqueda.'}
                      </td>
                    </tr>
                  ) : (
                    pacientesPaginados.map((p) => {
                      const numDocs = (p.documentos || []).length
                      const numNotas = (p.notas_medicas || []).length
                      const ultimaAtencionDate = obtenerUltimaAtencion(p)
                      const ultimaAtencionStr = ultimaAtencionDate
                        ? ultimaAtencionDate.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : '—'
                      const tieneAlergia = p.alergias && p.alergias.trim() && !p.alergias.toLowerCase().includes('ninguna')
                      const iniciales = obtenerIniciales(p.nombre, p.dni)

                      return (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom: '1px solid var(--medix-border, #D9DEE5)',
                            transition: 'background-color 0.12s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = temaOscuro ? 'rgba(255, 255, 255, 0.03)' : '#F9FAFB'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          {/* 1. PACIENTE (Avatar en círculo con iniciales + Nombre + DNI + Alergia badge) */}
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  backgroundColor: '#EBF3FA',
                                  color: 'var(--medix-action, #1D5C96)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: '700',
                                  fontSize: '13px',
                                  flexShrink: 0
                                }}
                              >
                                {iniciales}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span
                                    style={{
                                      fontWeight: '600',
                                      color: 'var(--medix-text-main, #1F2937)',
                                      fontSize: '14px'
                                    }}
                                  >
                                    {p.nombre || `Paciente DNI ${p.dni}`}
                                  </span>

                                  {tieneAlergia && (
                                    <span
                                      title={`Alergias: ${p.alergias}`}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        backgroundColor: 'var(--medix-alert-bg, #FEF3F2)',
                                        color: 'var(--medix-alert-red, #B42318)',
                                        border: '1px solid var(--medix-alert-border, #FECDCA)',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: '600'
                                      }}
                                    >
                                      Alergia
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--medix-text-muted, #5B6675)', display: 'block', marginTop: '2px' }}>
                                  DNI: {p.dni}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 2. DOCUMENTOS (Contador + Link para abrir visor) */}
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                            <button
                              type="button"
                              onClick={() => abrirVisorPaciente(p)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: numDocs > 0 ? 'var(--medix-action, #1D5C96)' : 'var(--medix-text-muted, #5B6675)',
                                fontWeight: '600',
                                fontSize: '13px',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                textDecoration: 'none'
                              }}
                              onMouseEnter={(e) => {
                                if (numDocs > 0) e.currentTarget.style.textDecoration = 'underline'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none'
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                              </svg>
                              <span>{numDocs} {numDocs === 1 ? 'doc' : 'docs'}</span>
                            </button>
                          </td>

                          {/* 3. NOTAS (Contador + Abrir modal) */}
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                            <button
                              type="button"
                              onClick={() => setPacienteParaNotas(p)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: numNotas > 0 ? 'var(--medix-action, #1D5C96)' : 'var(--medix-text-muted, #5B6675)',
                                fontWeight: '600',
                                fontSize: '13px',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                textDecoration: 'none'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none'
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                              </svg>
                              <span>{numNotas} {numNotas === 1 ? 'nota' : 'notas'}</span>
                            </button>
                          </td>

                          {/* 4. ÚLTIMA ATENCIÓN */}
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '13px', color: 'var(--medix-text-main, #1F2937)' }}>
                            {ultimaAtencionStr}
                          </td>

                          {/* 5. ESTADO (Badge 'Activo' en verde) */}
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: 'var(--medix-status-bg, #ECFDF3)',
                                color: 'var(--medix-status-green, #067647)',
                                border: '1px solid var(--medix-status-border, #ABEFC6)'
                              }}
                            >
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: 'var(--medix-status-green, #067647)'
                                }}
                              />
                              Activo
                            </span>
                          </td>

                          {/* 6. ACCIONES (Ver expediente, Anexar doc, Eliminar si admin) */}
                          <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {/* Ver expediente */}
                              <button
                                type="button"
                                onClick={() => abrirVisorPaciente(p)}
                                aria-label={`Ver expediente clínico de ${p.nombre || p.dni}`}
                                title="Ver expediente clínico"
                                style={{
                                  padding: '5px 9px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--medix-border, #D9DEE5)',
                                  backgroundColor: 'transparent',
                                  color: 'var(--medix-action, #1D5C96)',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F5FA'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <span>Ver</span>
                              </button>

                              {/* Anexar documento */}
                              <button
                                type="button"
                                onClick={() => agregarArchivoACarpeta(p.dni, p.id)}
                                aria-label={`Anexar documento al expediente ${p.dni}`}
                                title="Anexar documento a esta historia"
                                style={{
                                  padding: '5px 9px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--medix-border, #D9DEE5)',
                                  backgroundColor: 'transparent',
                                  color: 'var(--medix-text-main, #1F2937)',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F6F9'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <line x1="12" y1="5" x2="12" y2="19"></line>
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>Anexar</span>
                              </button>

                              {/* Eliminar (solo si es Admin) */}
                              {esAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleEliminarPaciente(p.id, p.dni)}
                                  aria-label={`Eliminar historia clínica de ${p.nombre || p.dni}`}
                                  title="Eliminar expediente"
                                  style={{
                                    padding: '5px 7px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(180, 35, 24, 0.2)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--medix-alert-red, #B42318)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--medix-alert-bg, #FEF3F2)'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* BARRA DE PAGINACIÓN */}
            {pacientesFiltrados.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderTop: '1px solid var(--medix-border, #D9DEE5)',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ fontSize: '13px', color: 'var(--medix-text-muted, #5B6675)' }}>
                  Mostrando{' '}
                  <strong style={{ color: 'var(--medix-text-main, #1F2937)' }}>
                    {indiceInicio + 1}
                  </strong>{' '}
                  a{' '}
                  <strong style={{ color: 'var(--medix-text-main, #1F2937)' }}>
                    {Math.min(indiceInicio + porPagina, pacientesFiltrados.length)}
                  </strong>{' '}
                  de{' '}
                  <strong style={{ color: 'var(--medix-text-main, #1F2937)' }}>
                    {pacientesFiltrados.length}
                  </strong>{' '}
                  historias
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor="select-por-pagina" style={{ fontSize: '12px', color: 'var(--medix-text-muted, #5B6675)' }}>
                    Por página:
                  </label>
                  <select
                    id="select-por-pagina"
                    value={porPagina}
                    onChange={(e) => setPorPagina(Number(e.target.value))}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--medix-border, #D9DEE5)',
                      fontSize: '12px',
                      backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
                      color: 'var(--medix-text-main, #1F2937)',
                      outline: 'none'
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                    <button
                      type="button"
                      disabled={pagina <= 1}
                      onClick={() => setPagina(p => Math.max(1, p - 1))}
                      aria-label="Página anterior"
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--medix-border, #D9DEE5)',
                        backgroundColor: 'transparent',
                        color: pagina <= 1 ? 'var(--medix-border, #D9DEE5)' : 'var(--medix-text-main, #1F2937)',
                        cursor: pagina <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Anterior
                    </button>
                    <span style={{ fontSize: '12px', padding: '0 6px', color: 'var(--medix-text-muted, #5B6675)' }}>
                      {pagina} / {totalPaginas}
                    </span>
                    <button
                      type="button"
                      disabled={pagina >= totalPaginas}
                      onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                      aria-label="Página siguiente"
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--medix-border, #D9DEE5)',
                        backgroundColor: 'transparent',
                        color: pagina >= totalPaginas ? 'var(--medix-border, #D9DEE5)' : 'var(--medix-text-main, #1F2937)',
                        cursor: pagina >= totalPaginas ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* =================================================================== */}
      {/* 3. VISTA ANALÍTICA INSTITUCIONAL */}
      {/* =================================================================== */}
      {esVistaAnalitica && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Métricas clave */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div
              style={{
                backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
                border: '1px solid var(--medix-border, #D9DEE5)',
                borderRadius: '8px',
                padding: '16px 18px'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--medix-text-muted, #5B6675)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Total de Historias
              </span>
              <strong style={{ display: 'block', fontSize: '26px', color: 'var(--medix-navy, #0B2545)', margin: '6px 0 2px 0' }}>
                {pacientes.length}
              </strong>
              <span style={{ fontSize: '12px', color: 'var(--medix-text-muted, #5B6675)' }}>Expedientes clínicos registrados</span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
                border: '1px solid var(--medix-border, #D9DEE5)',
                borderRadius: '8px',
                padding: '16px 18px'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--medix-text-muted, #5B6675)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Documentos Totales
              </span>
              <strong style={{ display: 'block', fontSize: '26px', color: 'var(--medix-action, #1D5C96)', margin: '6px 0 2px 0' }}>
                {totalArchivosSistema}
              </strong>
              <span style={{ fontSize: '12px', color: 'var(--medix-text-muted, #5B6675)' }}>Almacenados en repositorio clínico</span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
                border: '1px solid var(--medix-border, #D9DEE5)',
                borderRadius: '8px',
                padding: '16px 18px'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--medix-text-muted, #5B6675)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Promedio por Historia
              </span>
              <strong style={{ display: 'block', fontSize: '26px', color: 'var(--medix-navy, #0B2545)', margin: '6px 0 2px 0' }}>
                {pacientes.length > 0 ? (totalArchivosSistema / pacientes.length).toFixed(1) : 0}
              </strong>
              <span style={{ fontSize: '12px', color: 'var(--medix-text-muted, #5B6675)' }}>Documentos por paciente</span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
                border: '1px solid var(--medix-border, #D9DEE5)',
                borderRadius: '8px',
                padding: '16px 18px'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--medix-text-muted, #5B6675)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Formato Predominante
              </span>
              <strong style={{ display: 'block', fontSize: '20px', color: 'var(--medix-action, #1D5C96)', margin: '10px 0 2px 0' }}>
                {totalDocx >= totalPdfs ? 'Word (.docx)' : 'PDF (.pdf)'}
              </strong>
              <span style={{ fontSize: '12px', color: 'var(--medix-text-muted, #5B6675)' }}>
                {Math.max(totalDocx, totalPdfs)} archivos registrados
              </span>
            </div>
          </div>

          {/* Distribución Documental */}
          <div
            style={{
              backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
              border: '1px solid var(--medix-border, #D9DEE5)',
              borderRadius: '8px',
              padding: '18px 20px'
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--medix-navy, #0B2545)', margin: '0 0 14px 0' }}>
              Distribución de Documentos por Formato
            </h3>

            {totalArchivosSistema > 0 ? (
              <div>
                <div style={{ display: 'flex', height: '14px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#E9ECEF', marginBottom: '14px' }}>
                  {totalDocx > 0 && (
                    <div style={{ width: `${(totalDocx / totalArchivosSistema) * 100}%`, backgroundColor: '#1D5C96' }} title={`Word: ${totalDocx}`} />
                  )}
                  {totalPdfs > 0 && (
                    <div style={{ width: `${(totalPdfs / totalArchivosSistema) * 100}%`, backgroundColor: '#3B82F6' }} title={`PDF: ${totalPdfs}`} />
                  )}
                  {totalImagenes > 0 && (
                    <div style={{ width: `${(totalImagenes / totalArchivosSistema) * 100}%`, backgroundColor: '#64748B' }} title={`Imágenes: ${totalImagenes}`} />
                  )}
                  {totalTextos > 0 && (
                    <div style={{ width: `${(totalTextos / totalArchivosSistema) * 100}%`, backgroundColor: '#94A3B8' }} title={`Texto: ${totalTextos}`} />
                  )}
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--medix-text-muted, #5B6675)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#1D5C96', display: 'inline-block' }} />
                    <span>Word (.docx): <strong>{totalDocx}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#3B82F6', display: 'inline-block' }} />
                    <span>PDF: <strong>{totalPdfs}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#64748B', display: 'inline-block' }} />
                    <span>Imágenes: <strong>{totalImagenes}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#94A3B8', display: 'inline-block' }} />
                    <span>Texto: <strong>{totalTextos}</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--medix-text-muted, #5B6675)', fontSize: '13px', margin: 0 }}>
                No hay documentos registrados para generar la distribución.
              </p>
            )}
          </div>

          {/* Últimos Documentos Subidos */}
          <div
            style={{
              backgroundColor: 'var(--medix-bg-card, #FFFFFF)',
              border: '1px solid var(--medix-border, #D9DEE5)',
              borderRadius: '8px',
              padding: '18px 20px'
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--medix-navy, #0B2545)', margin: '0 0 14px 0' }}>
              Actividad Reciente en Repositorio
            </h3>
            {todosLosDocumentos.length === 0 ? (
              <p style={{ color: 'var(--medix-text-muted, #5B6675)', fontSize: '13px', margin: 0 }}>No hay actividad reciente registrada.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[...todosLosDocumentos].reverse().slice(0, 6).map((d) => (
                  <div
                    key={d.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      backgroundColor: temaOscuro ? 'rgba(255, 255, 255, 0.03)' : '#F8F9FA',
                      border: '1px solid var(--medix-border, #D9DEE5)'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '13px', color: 'var(--medix-text-main, #1F2937)', display: 'block' }}>
                        {d.nombre_original || d.nombre_archivo}
                      </strong>
                      <span style={{ fontSize: '12px', color: 'var(--medix-text-muted, #5B6675)' }}>
                        Paciente DNI {d.paciente_dni || '—'} · {d.fecha_subida ? new Date(d.fecha_subida).toLocaleDateString('es-PE') : 'Fecha no reg.'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setDocumentoEnVista(d)
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--medix-border, #D9DEE5)',
                        backgroundColor: 'transparent',
                        color: 'var(--medix-action, #1D5C96)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Abrir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE NOTAS MÉDICAS */}
      {pacienteParaNotas && (
        <NotasMedicasModal
          paciente={pacienteParaNotas}
          usuario={usuario}
          onClose={() => setPacienteParaNotas(null)}
          notificar={notificar}
          onNotaAgregada={() => {
            cargarDatos(false)
          }}
        />
      )}
    </div>
  )
}
