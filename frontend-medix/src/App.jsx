import { useState, useEffect, useRef, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from './context/ThemeContext'
import { useAuth } from './context/AuthContext'
import { esPdf, esDocx, esImagen, esTexto } from './utils/fileHelpers'
import * as api from './api/pacientesService'

import Sidebar from './components/Sidebar'
import VisorLateral from './components/VisorLateral'
import LoginView from './views/LoginView'
import DashboardView from './views/DashboardView'
import NuevaHistoriaView from './views/NuevaHistoriaView'
import UsuariosView from './views/UsuariosView'
import ConfiguracionView from './views/ConfiguracionView'
import SignosVitalesView from './views/SignosVitalesView'
import SolicitudesView from './views/SolicitudesView'
import SolicitudEliminacionModal from './components/SolicitudEliminacionModal'
import AlertToast from './components/AlertToast'
import ConfirmDeleteModal from './components/ConfirmDeleteModal'
import CambiarPasswordModal from './components/CambiarPasswordModal'

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { temaOscuro, theme } = useTheme()
  const {
    usuario,
    setUsuario,
    authFetch,
    logout,
    esAdmin,
    esMedico,
    esEnfermera,
    modalPasswordAbierto,
    abrirModalPassword,
    cerrarModalPassword
  } = useAuth()

  // Datos principales
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

  // Búsqueda y Carpetas
  const [busquedaDni, setBusquedaDni] = useState('')
  const [carpetasAbiertas, setCarpetasAbiertas] = useState(new Set())

  // Formulario nuevo documento / historia con datos del paciente
  const [dni, setDni] = useState('')
  const [nombre, setNombre] = useState('')
  const [alergias, setAlergias] = useState('')
  const [file, setFile] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const fileInputRef = useRef(null)

  // Edición rápida de DNI
  const [editandoPaciente, setEditandoPaciente] = useState(null)
  const [nuevoDni, setNuevoDni] = useState('')

  // Panel Visor de documento lateral
  const [documentoEnVista, setDocumentoEnVista] = useState(null)

  // Usuarios del sistema
  const [usuarios, setUsuarios] = useState([])
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false)
  const [formUsuario, setFormUsuario] = useState({
    username: '',
    password: '',
    rol: 'Médico',
    telefono: '',
    correo: '',
    nombres_completos: ''
  })
  const [creandoUsuario, setCreandoUsuario] = useState(false)

  // Diagnóstico
  const [diagnostico, setDiagnostico] = useState(null)
  const [cargandoDiagnostico, setCargandoDiagnostico] = useState(false)

  // Vistas Dashboard
  const [vistaDashboard, setVistaDashboard] = useState('cards')
  const [filtroTipoDoc, setFiltroTipoDoc] = useState('todos')

  // Solicitudes de Eliminación y Modales
  const [solicitudesPendientesCount, setSolicitudesPendientesCount] = useState(0)
  const [pacienteParaSolicitud, setPacienteParaSolicitud] = useState(null)
  const [confirmacionEliminar, setConfirmacionEliminar] = useState(null)

  // Responsividad móvil
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 840 : false)
  const [sidebarMobileAbierto, setSidebarMobileAbierto] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 840
      setIsMobile(mobile)
      if (!mobile) setSidebarMobileAbierto(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const notificar = (tipo, texto = '', titulo = '', opciones = {}) => {
    let payload = {}
    if (typeof tipo === 'object' && tipo !== null) {
      payload = {
        id: Date.now(),
        tipo: tipo.tipo || 'info',
        titulo: tipo.titulo || '',
        texto: tipo.texto || '',
        contador: tipo.contador,
        actionLabel: tipo.actionLabel,
        secondaryLabel: tipo.secondaryLabel,
        onAction: tipo.onAction
      }
    } else {
      payload = {
        id: Date.now(),
        tipo: tipo || 'info',
        texto: texto || '',
        titulo: titulo || '',
        ...opciones
      }
    }
    setMensaje(payload)
  }

  useEffect(() => {
    if (mensaje && mensaje.texto) {
      const timer = setTimeout(() => {
        setMensaje({ tipo: '', texto: '', titulo: '' })
      }, 6500)
      return () => clearTimeout(timer)
    }
  }, [mensaje])

  // Carga de Pacientes
  const cargarDatos = useCallback(async (abrirTodos = false) => {
    if (!usuario) return
    setLoading(true)
    try {
      const data = await api.listarPacientes(authFetch)
      setPacientes(data)
      if (abrirTodos) {
        setCarpetasAbiertas(new Set(data.map(p => p.id)))
      }
    } catch {
      notificar('error', 'No se pudieron cargar los expedientes de pacientes.')
    } finally {
      setLoading(false)
    }
  }, [authFetch, usuario])

  // Carga de Usuarios
  const cargarUsuarios = useCallback(async () => {
    if (!usuario || !esAdmin) return
    setCargandoUsuarios(true)
    try {
      const data = await api.listarUsuarios(authFetch)
      setUsuarios(data)
    } catch (err) {
      console.error('Error cargando usuarios:', err)
    } finally {
      setCargandoUsuarios(false)
    }
  }, [authFetch, usuario, esAdmin])

  // Carga de Diagnóstico
  const cargarDiagnostico = useCallback(async () => {
    if (!usuario) return
    setCargandoDiagnostico(true)
    try {
      const data = await api.obtenerDiagnostico(authFetch)
      setDiagnostico(data)
    } catch (err) {
      console.error('Error cargando diagnóstico:', err)
    } finally {
      setCargandoDiagnostico(false)
    }
  }, [authFetch, usuario])

  // Carga de Solicitudes Pendientes
  const cargarSolicitudesPendientes = useCallback(async () => {
    if (!usuario) return
    try {
      const data = await api.listarSolicitudes(authFetch, 'Pendiente')
      setSolicitudesPendientesCount(data.length)
    } catch (err) {
      console.error('Error cargando conteo de solicitudes:', err)
    }
  }, [authFetch, usuario])

  useEffect(() => {
    if (usuario) {
      cargarDatos(true)
      cargarUsuarios()
      cargarDiagnostico()
      cargarSolicitudesPendientes()
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDocumentoEnVista(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [usuario, cargarDatos, cargarUsuarios, cargarDiagnostico, cargarSolicitudesPendientes])

  // Control de carpetas
  const toggleCarpeta = (id) => {
    setCarpetasAbiertas(prev => {
      const nuevo = new Set(prev)
      nuevo.has(id) ? nuevo.delete(id) : nuevo.add(id)
      return nuevo
    })
  }

  const expandirTodas = () => setCarpetasAbiertas(new Set(pacientes.map(p => p.id)))
  const colapsarTodas = () => setCarpetasAbiertas(new Set())

  const agregarArchivoACarpeta = (dniPaciente, pacId) => {
    setDni(dniPaciente)
    const pacExistente = pacientes.find(p => p.id === pacId || p.dni === dniPaciente)
    if (pacExistente) {
      setNombre(pacExistente.nombre || '')
      setAlergias(pacExistente.alergias || '')
    }
    setCarpetasAbiertas(prev => new Set([...prev, pacId]))
    navigate('/agregarhistoria')
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.focus()
        fileInputRef.current.click()
      }
    }, 150)
  }

  // Subir Documento e Historia Clínica con Nombre y Alergias
  const handleUpload = async (e) => {
    e.preventDefault()
    const dniLimpio = dni.trim()
    if (!dniLimpio || !file) {
      notificar('error', 'Por favor ingresa el DNI y selecciona un archivo.')
      return
    }

    setSubiendo(true)
    const formData = new FormData()
    formData.append('dni', dniLimpio)
    formData.append('archivo', file)
    if (nombre.trim()) formData.append('nombre', nombre.trim())
    if (alergias.trim()) formData.append('alergias', alergias.trim())

    try {
      const data = await api.subirDocumento(authFetch, formData)
      const pacId = data.documento ? data.documento.paciente_id : null
      const esNuevo = !pacientes.some(p => p.dni.trim() === dniLimpio)

      notificar({
        tipo: 'exito',
        titulo: esNuevo ? '¡Paciente Creado!' : '¡Expediente Actualizado!',
        texto: data.mensaje || (esNuevo
          ? `El expediente clínico del paciente DNI ${dniLimpio} fue creado con éxito.`
          : `El archivo clínico fue anexado con éxito a la carpeta del DNI ${dniLimpio}.`),
        actionLabel: 'Entendido'
      })

      setDni('')
      setNombre('')
      setAlergias('')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''

      await cargarDatos()
      if (pacId) {
        setCarpetasAbiertas(prev => new Set([...prev, pacId]))
      }
      cargarDiagnostico()
      navigate('/dashboard')
    } catch (error) {
      notificar('error', error.message || 'Error al subir el documento.')
    } finally {
      setSubiendo(false)
    }
  }

  // Actualizar DNI
  const handleGuardarDni = async (id) => {
    if (!nuevoDni.trim()) {
      notificar('error', 'El nuevo DNI no puede estar vacío.')
      return
    }

    try {
      await api.actualizarPaciente(authFetch, id, { dni: nuevoDni.trim() })
      notificar('exito', 'DNI actualizado exitosamente.')
      setEditandoPaciente(null)
      cargarDatos()
    } catch (error) {
      notificar('error', error.message || 'Error al actualizar DNI.')
    }
  }

  // Eliminar Documento
  const handleEliminarDocumento = (id, nombreDoc, pacId) => {
    setConfirmacionEliminar({
      tipo: 'documento',
      documento: { id, nombre: nombreDoc, pacId },
      paciente: { dni: nombreDoc },
      pregunta: `¿Desea eliminar el archivo clínico "${nombreDoc}"?`
    })
  }

  const ejecutarEliminarDocumento = async (id, nombreDoc) => {
    try {
      const data = await api.eliminarDocumento(authFetch, id)
      notificar({
        tipo: 'eliminacion',
        titulo: 'Archivo Eliminado',
        texto: data.mensaje || `El archivo clínico "${nombreDoc}" ha sido eliminado del expediente.`,
        actionLabel: 'Entendido'
      })
      if (documentoEnVista && documentoEnVista.id === id) {
        setDocumentoEnVista(null)
      }
      cargarDatos()
      cargarDiagnostico()
    } catch (error) {
      notificar('error', error.message || 'Error al eliminar el documento.')
    }
  }

  // Eliminar Paciente
  const handleEliminarPaciente = (id, dniPac) => {
    const pac = pacientes.find(p => p.id === id || String(p.dni) === String(dniPac)) || { id, dni: dniPac }
    setConfirmacionEliminar({
      tipo: 'paciente',
      paciente: pac,
      pregunta: `¿Desea eliminar la historia clínica del paciente DNI ${dniPac}?`
    })
  }

  // Crear Usuario
  const handleCrearUsuario = async (e) => {
    e.preventDefault()
    if (!formUsuario.username.trim() || !formUsuario.password.trim()) {
      notificar('error', 'Por favor complete el nombre de usuario y contraseña.')
      return
    }
    setCreandoUsuario(true)
    try {
      const data = await api.crearUsuario(authFetch, formUsuario)
      notificar({
        tipo: 'exito',
        titulo: '¡Usuario Creado!',
        texto: data.mensaje || `Usuario "${formUsuario.username}" registrado exitosamente.`,
        actionLabel: 'Entendido'
      })
      setFormUsuario({
        username: '',
        password: '',
        rol: 'Médico',
        telefono: '',
        correo: '',
        nombres_completos: ''
      })
      cargarUsuarios()
    } catch (err) {
      notificar('error', err.message || 'Error al registrar usuario.')
    } finally {
      setCreandoUsuario(false)
    }
  }

  // Eliminar Usuario
  const handleEliminarUsuario = (id, nombreUser) => {
    setConfirmacionEliminar({
      tipo: 'usuario',
      usuarioParaBorrar: { id, nombre: nombreUser },
      paciente: { dni: nombreUser },
      pregunta: `¿Desea eliminar al usuario "${nombreUser}"? Esta acción no se puede deshacer.`
    })
  }

  const ejecutarEliminarUsuario = async (id, nombreUser) => {
    try {
      const data = await api.eliminarUsuario(authFetch, id)
      notificar({
        tipo: 'eliminacion',
        titulo: 'Usuario Eliminado',
        texto: data.mensaje || `El usuario "${nombreUser}" ha sido eliminado del sistema.`,
        actionLabel: 'Entendido'
      })
      cargarUsuarios()
    } catch (err) {
      notificar('error', err.message || 'No se pudo eliminar el usuario.')
    }
  }

  // Confirmar Acción de Eliminación
  const handleConfirmarEliminar = () => {
    if (!confirmacionEliminar) return
    const { tipo, paciente: pac, documento, usuarioParaBorrar } = confirmacionEliminar
    setConfirmacionEliminar(null)

    if (tipo === 'paciente') {
      setPacienteParaSolicitud(pac)
    } else if (tipo === 'documento') {
      ejecutarEliminarDocumento(documento.id, documento.nombre, documento.pacId)
    } else if (tipo === 'usuario') {
      ejecutarEliminarUsuario(usuarioParaBorrar.id, usuarioParaBorrar.nombre)
    }
  }

  // Visualizar Maniquí / Silueta y Expediente
  const handleVerSilueta = (pacienteSel) => {
    const primerDoc = (pacienteSel.documentos && pacienteSel.documentos.length > 0) ? pacienteSel.documentos[0] : null
    setDocumentoEnVista({
      id: primerDoc ? primerDoc.id : null,
      nombre_archivo: primerDoc ? (primerDoc.nombre_original || primerDoc.nombre_archivo) : `Historia Clínica Digital - DNI ${pacienteSel.dni}`,
      paciente_id: pacienteSel.id,
      paciente_dni: pacienteSel.dni,
      paciente: pacienteSel,
      fecha_subida: primerDoc ? primerDoc.fecha_subida : 'Expediente Activo'
    })

    if (pacienteSel.alergias && !pacienteSel.alergias.toLowerCase().includes('ninguna')) {
      notificar({
        tipo: 'alergia',
        titulo: 'Alergias / Advertencia',
        texto: `Atención: El paciente ${pacienteSel.nombre || `DNI ${pacienteSel.dni}`} registra alertas de alergias: ${pacienteSel.alergias}.`,
        contador: '2',
        actionLabel: 'Entendido'
      })
    }
  }

  // Colecciones calculadas para filtros
  const pacientesFiltrados = pacientes.filter(p => {
    const q = busquedaDni.trim().toLowerCase()
    if (!q) return true
    return (
      (p.dni && p.dni.toLowerCase().includes(q)) ||
      (p.nombre && p.nombre.toLowerCase().includes(q)) ||
      (p.alergias && p.alergias.toLowerCase().includes(q))
    )
  })

  const todosLosDocumentos = pacientes.flatMap(p =>
    (p.documentos || []).map(doc => ({
      ...doc,
      paciente_dni: doc.paciente_dni || p.dni,
      paciente_id: doc.paciente_id || p.id,
      paciente_nombre: doc.paciente_nombre || p.nombre || null
    }))
  )

  const documentosFiltradosTabla = todosLosDocumentos.filter(doc => {
    const q = busquedaDni.trim().toLowerCase()
    const coincideTexto = !q ||
      (doc.paciente_dni && doc.paciente_dni.toLowerCase().includes(q)) ||
      (doc.paciente_nombre && doc.paciente_nombre.toLowerCase().includes(q)) ||
      (doc.nombre_archivo && doc.nombre_archivo.toLowerCase().includes(q)) ||
      (doc.nombre_original && doc.nombre_original.toLowerCase().includes(q))

    if (!coincideTexto) return false

    const nombreArchivo = doc.nombre_original || doc.nombre_archivo
    if (filtroTipoDoc === 'pdf') return esPdf(nombreArchivo)
    if (filtroTipoDoc === 'docx') return esDocx(nombreArchivo)
    if (filtroTipoDoc === 'imagen') return esImagen(nombreArchivo)
    if (filtroTipoDoc === 'texto') return esTexto(nombreArchivo)
    return true
  })

  const totalPdfs = todosLosDocumentos.filter(d => esPdf(d.nombre_original || d.nombre_archivo)).length
  const totalDocx = todosLosDocumentos.filter(d => esDocx(d.nombre_original || d.nombre_archivo)).length
  const totalImagenes = todosLosDocumentos.filter(d => esImagen(d.nombre_original || d.nombre_archivo)).length
  const totalTextos = todosLosDocumentos.filter(d => esTexto(d.nombre_original || d.nombre_archivo)).length
  const totalArchivosSistema = pacientes.reduce((acc, p) => acc + (p.total_documentos || 0), 0)

  // Si no hay sesión iniciada
  if (!usuario) {
    if (location.pathname !== '/login') {
      return <Navigate to="/login" replace />
    }
    return (
      <LoginView
        onLoginSuccess={(u) => {
          setUsuario(u)
          const r = (u?.rol || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
          if (r.includes('enfermer')) {
            navigate('/signosvitales')
          } else {
            navigate('/dashboard')
          }
        }}
      />
    )
  }

  // Si tiene sesión e intenta ingresar a /login
  if (location.pathname === '/login') {
    return <Navigate to={esEnfermera ? "/signosvitales" : "/dashboard"} replace />
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: theme.bgApp,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: theme.textMain,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      transition: 'background-color 0.2s ease, color 0.2s ease'
    }}>
      {/* Overlay para menú en dispositivos móviles */}
      {isMobile && sidebarMobileAbierto && (
        <div
          onClick={() => setSidebarMobileAbierto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 8, 15, 0.65)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            zIndex: 90
          }}
        />
      )}

      {/* Barra Superior Móvil */}
      {isMobile && (
        <header style={{
          height: '56px',
          backgroundColor: theme.bgCard,
          borderBottom: theme.border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          flexShrink: 0,
          boxShadow: theme.shadowCard,
          zIndex: 40
        }}>
          <button
            onClick={() => setSidebarMobileAbierto(true)}
            title="Abrir menú"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: theme.border,
              backgroundColor: theme.bgSubtle,
              color: theme.textMain,
              cursor: 'pointer'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <span style={{ fontSize: '15px', fontWeight: '800', color: theme.textMain }}>
            Medix Pisco
          </span>

          <div
            onClick={abrirModalPassword}
            style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: esAdmin ? (temaOscuro ? '#3b0764' : '#fdf2f8') : (temaOscuro ? '#082f49' : '#f0f9ff'),
              color: esAdmin ? (temaOscuro ? '#d8b4fe' : '#9d174d') : (temaOscuro ? '#7dd3fc' : '#0369a1'),
              border: `1px solid ${esAdmin ? (temaOscuro ? '#581c87' : '#fbcfe8') : (temaOscuro ? '#0369a1' : '#bae6fd')}`,
              cursor: 'pointer'
            }}
            title="Haga clic para cambiar contraseña"
          >
            {usuario?.username || 'admin'}
          </div>
        </header>
      )}

      {/* 1. SIDEBAR DE NAVEGACIÓN */}
      <Sidebar
        usuario={usuario}
        onLogout={logout}
        onCambiarPassword={abrirModalPassword}
        totalPacientes={pacientes.length}
        totalDocumentos={totalArchivosSistema}
        totalSolicitudesPendientes={solicitudesPendientesCount}
        busquedaDni={busquedaDni}
        setBusquedaDni={setBusquedaDni}
        isMobile={isMobile}
        sidebarMobileAbierto={sidebarMobileAbierto}
        onCloseMobile={() => setSidebarMobileAbierto(false)}
      />

      {/* 2. ÁREA CENTRAL PRINCIPAL DE VISTAS */}
      <main style={{
        flex: 1,
        height: isMobile ? 'calc(100vh - 56px)' : '100vh',
        overflowY: 'auto',
        padding: isMobile ? '16px 14px' : '24px 30px',
        boxSizing: 'border-box',
        backgroundColor: theme.bgApp,
        color: theme.textMain,
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.2s ease, color 0.2s ease'
      }}>
        <AlertToast
          alerta={mensaje}
          onClose={() => setMensaje({ tipo: '', texto: '', titulo: '' })}
        />

        <Routes>
          <Route
            path="/dashboard"
            element={
              esEnfermera ? (
                <Navigate to="/signosvitales" replace />
              ) : (
                <DashboardView
                  pacientes={pacientes}
                  pacientesFiltrados={pacientesFiltrados}
                  todosLosDocumentos={todosLosDocumentos}
                  documentosFiltradosTabla={documentosFiltradosTabla}
                  totalPdfs={totalPdfs}
                  totalDocx={totalDocx}
                  totalImagenes={totalImagenes}
                  totalTextos={totalTextos}
                  totalArchivosSistema={totalArchivosSistema}
                  busquedaDni={busquedaDni}
                  setBusquedaDni={setBusquedaDni}
                  vistaDashboard={vistaDashboard}
                  setVistaDashboard={setVistaDashboard}
                  filtroTipoDoc={filtroTipoDoc}
                  setFiltroTipoDoc={setFiltroTipoDoc}
                  carpetasAbiertas={carpetasAbiertas}
                  setCarpetasAbiertas={setCarpetasAbiertas}
                  toggleCarpeta={toggleCarpeta}
                  expandirTodas={expandirTodas}
                  colapsarTodas={colapsarTodas}
                  agregarArchivoACarpeta={agregarArchivoACarpeta}
                  editandoPaciente={editandoPaciente}
                  setEditandoPaciente={setEditandoPaciente}
                  nuevoDni={nuevoDni}
                  setNuevoDni={setNuevoDni}
                  handleGuardarDni={handleGuardarDni}
                  handleEliminarPaciente={handleEliminarPaciente}
                  handleEliminarDocumento={handleEliminarDocumento}
                  documentoEnVista={documentoEnVista}
                  setDocumentoEnVista={setDocumentoEnVista}
                  onVerSilueta={handleVerSilueta}
                  notificar={notificar}
                  loading={loading}
                  cargarDatos={cargarDatos}
                  usuario={usuario}
                />
              )
            }
          />

          <Route
            path="/agregarhistoria"
            element={
              esEnfermera ? (
                <Navigate to="/signosvitales" replace />
              ) : (
                <NuevaHistoriaView
                  dni={dni}
                  setDni={setDni}
                  nombre={nombre}
                  setNombre={setNombre}
                  alergias={alergias}
                  setAlergias={setAlergias}
                  file={file}
                  setFile={setFile}
                  fileInputRef={fileInputRef}
                  subiendo={subiendo}
                  pacientes={pacientes}
                  handleUpload={handleUpload}
                />
              )
            }
          />
          <Route path="/nueva-historia" element={<Navigate to="/agregarhistoria" replace />} />

          <Route
            path="/signosvitales"
            element={
              <SignosVitalesView
                pacientes={pacientes}
                usuario={usuario}
                notificar={notificar}
                cargarDatos={cargarDatos}
              />
            }
          />
          <Route path="/triaje" element={<Navigate to="/signosvitales" replace />} />

          <Route
            path="/usuarios"
            element={
              esAdmin ? (
                <UsuariosView
                  usuarios={usuarios}
                  cargandoUsuarios={cargandoUsuarios}
                  formUsuario={formUsuario}
                  setFormUsuario={setFormUsuario}
                  creandoUsuario={creandoUsuario}
                  handleCrearUsuario={handleCrearUsuario}
                  handleEliminarUsuario={handleEliminarUsuario}
                  cargarUsuarios={cargarUsuarios}
                />
              ) : (
                <Navigate to={esEnfermera ? "/signosvitales" : "/dashboard"} replace />
              )
            }
          />

          <Route
            path="/configuracion"
            element={
              esAdmin ? (
                <ConfiguracionView
                  diagnostico={diagnostico}
                  cargandoDiagnostico={cargandoDiagnostico}
                  cargarDiagnostico={cargarDiagnostico}
                  pacientes={pacientes}
                  totalArchivosSistema={totalArchivosSistema}
                  usuario={usuario}
                />
              ) : (
                <Navigate to={esEnfermera ? "/signosvitales" : "/dashboard"} replace />
              )
            }
          />

          <Route
            path="/solicitudes"
            element={
              esAdmin ? (
                <SolicitudesView
                  usuario={usuario}
                  notificar={notificar}
                  onActualizacion={() => {
                    cargarDatos()
                    cargarSolicitudesPendientes()
                  }}
                />
              ) : (
                <Navigate to={esEnfermera ? "/signosvitales" : "/dashboard"} replace />
              )
            }
          />

          <Route path="/" element={<Navigate to={esEnfermera ? "/signosvitales" : "/dashboard"} replace />} />
          <Route path="*" element={<Navigate to={esEnfermera ? "/signosvitales" : "/dashboard"} replace />} />
        </Routes>
      </main>

      {/* 3. VISOR LATERAL CON CABECERA FIJA Y LÍNEA DE TIEMPO */}
      <VisorLateral
        documentoEnVista={documentoEnVista}
        paciente={
          documentoEnVista?.paciente ||
          pacientes.find(p => p.id === documentoEnVista?.paciente_id || String(p.dni) === String(documentoEnVista?.paciente_dni)) ||
          null
        }
        onCerrar={() => setDocumentoEnVista(null)}
        onSeleccionarDocumento={(doc) => {
          const pac = pacientes.find(p => p.id === doc.paciente_id || String(p.dni) === String(doc.paciente_dni))
          setDocumentoEnVista({
            ...doc,
            paciente: pac || null
          })
        }}
      />

      {/* 4. MODAL DE SOLICITUD DE ELIMINACIÓN */}
      {pacienteParaSolicitud && (
        <SolicitudEliminacionModal
          paciente={pacienteParaSolicitud}
          usuario={usuario}
          onCerrar={() => setPacienteParaSolicitud(null)}
          onSolicitudEnviada={(msg) => {
            notificar({
              tipo: 'exito',
              titulo: 'Solicitud Enviada',
              texto: msg || 'Su solicitud de eliminación con justificación obligatoria fue enviada al Administrador.',
              actionLabel: 'Entendido'
            })
            cargarSolicitudesPendientes()
          }}
        />
      )}

      {/* 5. MODAL DE CONFIRMACIÓN */}
      {confirmacionEliminar && (
        <ConfirmDeleteModal
          paciente={confirmacionEliminar.paciente}
          titulo="Advertencia"
          pregunta={confirmacionEliminar.pregunta}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setConfirmacionEliminar(null)}
        />
      )}

      {/* 6. MODAL DE CAMBIO DE CONTRASEÑA (OBLIGATORIO O VOLUNTARIO) */}
      {modalPasswordAbierto && (
        <CambiarPasswordModal
          onCerrar={cerrarModalPassword}
          notificar={notificar}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}