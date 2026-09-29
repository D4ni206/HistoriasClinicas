import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { API_BASE } from './api/config'
import { esPdf, esDocx, esImagen, esTexto } from './utils/fileHelpers'
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

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()

  // Estado de usuario autenticado
  const [usuario, setUsuario] = useState(() => {
    try {
      const u = localStorage.getItem('medix_usuario')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })

  // Datos principales
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

  // Filtro de búsqueda rápida por DNI
  const [busquedaDni, setBusquedaDni] = useState('')

  // Control de carpetas expandidas (Set de IDs)
  const [carpetasAbiertas, setCarpetasAbiertas] = useState(new Set())

  // Formulario nuevo documento / historia
  const [dni, setDni] = useState('')
  const [file, setFile] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const fileInputRef = useRef(null)

  // Edición de DNI de paciente
  const [editandoPaciente, setEditandoPaciente] = useState(null)
  const [nuevoDni, setNuevoDni] = useState('')

  // Panel / Visor de documento (panel lateral derecho desplegable)
  const [documentoEnVista, setDocumentoEnVista] = useState(null)

  // Gestión de Usuarios
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

  // Diagnóstico / Configuración del sistema
  const [diagnostico, setDiagnostico] = useState(null)
  const [cargandoDiagnostico, setCargandoDiagnostico] = useState(false)

  // Modalidad activa dentro del Dashboard ('cards' | 'carpetas' | 'tabla-documentos' | 'analitica')
  const [vistaDashboard, setVistaDashboard] = useState('cards')
  // Filtro por tipo de documento en la vista de tabla general ('todos' | 'pdf' | 'docx' | 'imagen' | 'texto')
  const [filtroTipoDoc, setFiltroTipoDoc] = useState('todos')

  // Solicitudes de Eliminación (para Administrador y Médicos)
  const [solicitudesPendientesCount, setSolicitudesPendientesCount] = useState(0)
  const [pacienteParaSolicitud, setPacienteParaSolicitud] = useState(null)
  const [confirmacionEliminar, setConfirmacionEliminar] = useState(null)

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

  // Temporizador para auto-cerrar la notificación después de 6.5 segundos
  useEffect(() => {
    if (mensaje && mensaje.texto) {
      const timer = setTimeout(() => {
        setMensaje({ tipo: '', texto: '', titulo: '' })
      }, 6500)
      return () => clearTimeout(timer)
    }
  }, [mensaje])

  const cargarDatos = async (abrirTodos = false) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/pacientes`)
      if (res.ok) {
        const data = await res.json()
        setPacientes(data)
        if (abrirTodos) {
          setCarpetasAbiertas(new Set(data.map(p => p.id)))
        }
      } else {
        notificar('error', 'No se pudieron cargar las carpetas de pacientes.')
      }
    } catch (error) {
      notificar('error', 'Error al conectar con el backend.')
    } finally {
      setLoading(false)
    }
  }

  const cargarUsuarios = async () => {
    setCargandoUsuarios(true)
    try {
      const res = await fetch(`${API_BASE}/usuarios`)
      if (res.ok) {
        const data = await res.json()
        setUsuarios(data)
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err)
    } finally {
      setCargandoUsuarios(false)
    }
  }

  const handleCrearUsuario = async (e) => {
    e.preventDefault()
    if (!formUsuario.username.trim() || !formUsuario.password.trim()) {
      notificar('error', 'Por favor complete todos los campos para crear el usuario.')
      return
    }
    setCreandoUsuario(true)
    try {
      const res = await fetch(`${API_BASE}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formUsuario)
      })
      const data = await res.json()
      if (res.ok) {
        notificar({
          tipo: 'exito',
          titulo: '¡Usuario Creado!',
          texto: data.mensaje || `Usuario "${formUsuario.username}" registrado exitosamente.`,
          contador: '1',
          actionLabel: 'Okay'
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
      } else {
        notificar('error', data.mensaje || 'Error al registrar el usuario.')
      }
    } catch (err) {
      notificar('error', 'Error de red al registrar usuario.')
    } finally {
      setCreandoUsuario(false)
    }
  }

  const handleEliminarUsuario = (id, nombre) => {
    setConfirmacionEliminar({
      tipo: 'usuario',
      usuarioParaBorrar: { id, nombre },
      paciente: { dni: nombre },
      pregunta: `¿Desea eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`
    })
  }

  const ejecutarEliminarUsuario = async (id, nombre) => {
    try {
      const res = await fetch(`${API_BASE}/usuarios/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        notificar({
          tipo: 'eliminacion',
          titulo: 'Usuario Eliminado',
          texto: data.mensaje || `El usuario "${nombre}" ha sido eliminado del sistema.`,
          contador: '1',
          actionLabel: 'Delete',
          secondaryLabel: 'Cancel'
        })
        cargarUsuarios()
      } else {
        notificar('error', data.mensaje || 'No se pudo eliminar el usuario.')
      }
    } catch (err) {
      notificar('error', 'Error al comunicarse con el servidor.')
    }
  }

  const cargarDiagnostico = async () => {
    setCargandoDiagnostico(true)
    try {
      const res = await fetch(`${API_BASE}/sistema/estado`)
      if (res.ok) {
        const data = await res.json()
        setDiagnostico(data)
      }
    } catch (err) {
      console.error('Error cargando diagnóstico:', err)
    } finally {
      setCargandoDiagnostico(false)
    }
  }

  const cargarSolicitudesPendientes = async () => {
    try {
      const res = await fetch(`${API_BASE}/solicitudes-eliminacion?estado=Pendiente`)
      if (res.ok) {
        const data = await res.json()
        setSolicitudesPendientesCount(data.length)
      }
    } catch (err) {
      console.error('Error cargando conteo de solicitudes:', err)
    }
  }

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
  }, [usuario])

  // Alternar apertura/cierre de una carpeta
  const toggleCarpeta = (id) => {
    setCarpetasAbiertas(prev => {
      const nuevo = new Set(prev)
      if (nuevo.has(id)) {
        nuevo.delete(id)
      } else {
        nuevo.add(id)
      }
      return nuevo
    })
  }

  const expandirTodas = () => {
    setCarpetasAbiertas(new Set(pacientes.map(p => p.id)))
  }

  const colapsarTodas = () => {
    setCarpetasAbiertas(new Set())
  }

  // Pre-cargar DNI y navegar a /agregarhistoria
  const agregarArchivoACarpeta = (dniPaciente, pacId) => {
    setDni(dniPaciente)
    setCarpetasAbiertas(prev => new Set([...prev, pacId]))
    navigate('/agregarhistoria')
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.focus()
        fileInputRef.current.click()
      }
    }, 150)
  }

  // C: Subir documento a MinIO y SQL Server
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

    try {
      const response = await fetch(`${API_BASE}/documentos`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (response.ok) {
        const pacId = data.documento ? data.documento.paciente_id : null
        const esNuevo = !pacientes.some(p => p.dni.trim() === dniLimpio)
        notificar({
          tipo: 'exito',
          titulo: esNuevo ? '¡Paciente Creado!' : '¡Expediente Actualizado!',
          texto: data.mensaje || (esNuevo
            ? `El expediente clínico del paciente DNI ${dniLimpio} fue creado y registrado con éxito.`
            : `El archivo clínico fue anexado con éxito a la carpeta del DNI ${dniLimpio}.`),
          contador: '1',
          actionLabel: 'Okay'
        })
        setDni('')
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''

        // Recargar datos y volver al dashboard con la carpeta abierta
        const res = await fetch(`${API_BASE}/pacientes`)
        if (res.ok) {
          const lista = await res.json()
          setPacientes(lista)
          if (pacId) {
            setCarpetasAbiertas(prev => new Set([...prev, pacId]))
          }
        }
        cargarDiagnostico()
        navigate('/dashboard')
      } else {
        notificar('error', data.mensaje || 'Error al subir el documento.')
      }
    } catch (error) {
      notificar('error', 'Error de conexión con el backend.')
    } finally {
      setSubiendo(false)
    }
  }

  // U: Actualizar DNI Paciente
  const handleGuardarDni = async (id) => {
    if (!nuevoDni.trim()) {
      notificar('error', 'El nuevo DNI no puede estar vacío.')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/pacientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: nuevoDni.trim() })
      })
      const data = await response.json()

      if (response.ok) {
        notificar('exito', 'DNI actualizado exitosamente.')
        setEditandoPaciente(null)
        cargarDatos()
      } else {
        notificar('error', data.mensaje || 'Error al actualizar DNI.')
      }
    } catch (error) {
      notificar('error', 'Error al comunicarse con el servidor.')
    }
  }

  // D: Eliminar Documento individual
  const handleEliminarDocumento = (id, nombre, pacId) => {
    setConfirmacionEliminar({
      tipo: 'documento',
      documento: { id, nombre, pacId },
      paciente: { dni: nombre },
      pregunta: `¿Desea eliminar el archivo clínico "${nombre}"?`
    })
  }

  const ejecutarEliminarDocumento = async (id, nombre, pacId) => {
    try {
      const response = await fetch(`${API_BASE}/documentos/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (response.ok) {
        notificar({
          tipo: 'eliminacion',
          titulo: 'Historia Eliminada',
          texto: data.mensaje || `El archivo clínico "${nombre}" ha sido eliminado del expediente.`,
          contador: '1',
          actionLabel: 'Delete',
          secondaryLabel: 'Cancel'
        })
        if (documentoEnVista && documentoEnVista.id === id) {
          setDocumentoEnVista(null)
        }
        const res = await fetch(`${API_BASE}/pacientes`)
        if (res.ok) setPacientes(await res.json())
        cargarDiagnostico()
      } else {
        notificar('error', data.mensaje || 'Error al eliminar.')
      }
    } catch (error) {
      notificar('error', 'Error de red al intentar eliminar documento.')
    }
  }

  // D: Iniciar eliminación de la historia clínica del paciente
  // Abre la tarjeta de Advertencia ("¿Desea eliminar?: Eliminar y Cancelar")
  // Si presiona "Eliminar", se abre la ventana obligatoria donde explica el motivo que va a la bandeja del Admin
  const handleEliminarPaciente = (id, dniPac) => {
    const pac = pacientes.find(p => p.id === id || String(p.dni) === String(dniPac)) || { id, dni: dniPac }
    setConfirmacionEliminar({
      tipo: 'paciente',
      paciente: pac,
      pregunta: `¿Desea eliminar la historia clínica del paciente DNI ${dniPac}?`
    })
  }

  // Manejo de la acción "Eliminar" en la tarjeta Advertencia
  const handleConfirmarEliminar = () => {
    if (!confirmacionEliminar) return
    const { tipo, paciente: pac, documento, usuarioParaBorrar } = confirmacionEliminar
    setConfirmacionEliminar(null)

    if (tipo === 'paciente') {
      // Abre la ventana donde es obligatorio decir por qué desea eliminar la historia,
      // la cual llegará a la bandeja de solicitudes del admin
      setPacienteParaSolicitud(pac)
    } else if (tipo === 'documento') {
      ejecutarEliminarDocumento(documento.id, documento.nombre, documento.pacId)
    } else if (tipo === 'usuario') {
      ejecutarEliminarUsuario(usuarioParaBorrar.id, usuarioParaBorrar.nombre)
    }
  }

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('medix_usuario')
    setUsuario(null)
    navigate('/login')
  }

  // Visualizar silueta anatómica y expediente clínico
  const handleVerSilueta = (paciente) => {
    const primerDoc = (paciente.documentos && paciente.documentos.length > 0) ? paciente.documentos[0] : null
    setDocumentoEnVista({
      id: primerDoc ? primerDoc.id : null,
      nombre_archivo: primerDoc ? primerDoc.nombre_archivo : `Historia Clínica Digital - DNI ${paciente.dni}`,
      paciente_id: paciente.id,
      paciente_dni: paciente.dni,
      paciente: paciente,
      fecha_subida: primerDoc ? primerDoc.fecha_subida : 'Expediente Activo'
    })

    // Detección de Alergias o Contenido Sensible en el historial del paciente
    const notas = paciente.notas_medicas || []
    const signos = paciente.signos_vitales || []
    const textoAnalizar = [
      ...notas.map(n => `${n.diagnostico || ''} ${n.contenido || ''}`),
      ...signos.map(s => s.observaciones || '')
    ].join(' ').toLowerCase()

    const contieneAlergia = /alerg|penicilina|latex|intoleran|sensib|reacci[oó]n|asma|anafilax|cuidado especial/.test(textoAnalizar)

    if (contieneAlergia) {
      notificar({
        tipo: 'alergia',
        titulo: 'Alergias / Advertencia',
        texto: `Atención: El paciente DNI ${paciente.dni} registra alertas de alergias o condición médica de cuidado sensible.`,
        contador: '2',
        actionLabel: 'Got it'
      })
    }
  }

  // Colecciones calculadas
  const pacientesFiltrados = pacientes.filter(p =>
    p.dni.toLowerCase().includes(busquedaDni.trim().toLowerCase())
  )

  const todosLosDocumentos = pacientes.flatMap(p =>
    (p.documentos || []).map(doc => ({
      ...doc,
      paciente_dni: doc.paciente_dni || p.dni,
      paciente_id: doc.paciente_id || p.id
    }))
  )

  const documentosFiltradosTabla = todosLosDocumentos.filter(doc => {
    const q = busquedaDni.trim().toLowerCase()
    const coincideTexto = !q ||
      (doc.paciente_dni && doc.paciente_dni.toLowerCase().includes(q)) ||
      (doc.nombre_archivo && doc.nombre_archivo.toLowerCase().includes(q))

    if (!coincideTexto) return false

    if (filtroTipoDoc === 'pdf') return esPdf(doc.nombre_archivo)
    if (filtroTipoDoc === 'docx') return esDocx(doc.nombre_archivo)
    if (filtroTipoDoc === 'imagen') return esImagen(doc.nombre_archivo)
    if (filtroTipoDoc === 'texto') return esTexto(doc.nombre_archivo)
    return true
  })

  const totalPdfs = todosLosDocumentos.filter(d => esPdf(d.nombre_archivo)).length
  const totalDocx = todosLosDocumentos.filter(d => esDocx(d.nombre_archivo)).length
  const totalImagenes = todosLosDocumentos.filter(d => esImagen(d.nombre_archivo)).length
  const totalTextos = todosLosDocumentos.filter(d => esTexto(d.nombre_archivo)).length
  const totalArchivosSistema = pacientes.reduce((acc, p) => acc + (p.total_documentos || 0), 0)

  const rolRaw = (usuario?.rol || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  const esAdmin = rolRaw.includes('admin')
  const esMedico = rolRaw.includes('medico')
  const esEnfermera = rolRaw.includes('enfermer')

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

  // Si ya tiene sesión e intenta entrar a /login, redirigir según rol
  if (location.pathname === '/login') {
    return <Navigate to={esEnfermera ? "/signosvitales" : "/dashboard"} replace />
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#2B4A66',
      display: 'flex'
    }}>
      {/* 1. PANEL IZQUIERDO: HERRAMIENTAS Y NAVEGACIÓN MODULAR */}
      <Sidebar
        usuario={usuario}
        onLogout={handleLogout}
        totalPacientes={pacientes.length}
        totalDocumentos={totalArchivosSistema}
        totalSolicitudesPendientes={solicitudesPendientesCount}
        busquedaDni={busquedaDni}
        setBusquedaDni={setBusquedaDni}
      />

      {/* 2. PANEL CENTRAL: RUTAS Y VISTAS */}
      <main style={{
        flex: 1,
        height: '100vh',
        overflowY: 'auto',
        padding: '24px 30px',
        boxSizing: 'border-box',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Alerta / Notificación Flotante con Diseño Moderno (Modo Claro y Oscuro) */}
        <AlertToast
          alerta={mensaje}
          onClose={() => setMensaje({ tipo: '', texto: '', titulo: '' })}
        />

        <Routes>
          {/* Ruta Dashboard (Médico y Administrador) */}
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

          {/* Rutas para Agregar Historia (Médico y Administrador - Restringido para Enfermera) */}
          <Route
            path="/agregarhistoria"
            element={
              esEnfermera ? (
                <Navigate to="/signosvitales" replace />
              ) : (
                <NuevaHistoriaView
                  dni={dni}
                  setDni={setDni}
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

          {/* Ruta Signos Vitales / Triaje (Enfermera y Administrador) */}
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

          {/* Ruta Crear / Gestionar Usuarios (Exclusivo Administrador) */}
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

          {/* Ruta Configuración (Exclusivo Administrador) */}
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

          {/* Ruta Solicitudes de Eliminación (Exclusivo Administrador) */}
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

          {/* Redirección por defecto según rol */}
          <Route path="/" element={<Navigate to={esEnfermera ? "/signosvitales" : "/dashboard"} replace />} />
          <Route path="*" element={<Navigate to={esEnfermera ? "/signosvitales" : "/dashboard"} replace />} />
        </Routes>
      </main>

      {/* 3. PANEL DERECHO DESPLEGABLE: VISOR DE HISTORIA CLÍNICA */}
      <VisorLateral
        documentoEnVista={documentoEnVista}
        paciente={
          documentoEnVista?.paciente ||
          pacientes.find(p => p.id === documentoEnVista?.paciente_id || String(p.dni) === String(documentoEnVista?.paciente_dni)) ||
          null
        }
        onCerrar={() => setDocumentoEnVista(null)}
      />

      {/* 4. MODAL DE SOLICITUD DE ELIMINACIÓN CON MOTIVO OBLIGATORIO (Bandeja del Admin) */}
      {pacienteParaSolicitud && (
        <SolicitudEliminacionModal
          paciente={pacienteParaSolicitud}
          usuario={usuario}
          onCerrar={() => setPacienteParaSolicitud(null)}
          onSolicitudEnviada={(msg) => {
            notificar({
              tipo: 'exito',
              titulo: 'Solicitud Enviada',
              texto: msg || 'Su solicitud de eliminación con justificación obligatoria fue enviada a la bandeja del Administrador.',
              contador: '1',
              actionLabel: 'Okay'
            })
            cargarSolicitudesPendientes()
          }}
        />
      )}

      {/* 5. MODAL DE ADVERTENCIA PARA CONFIRMAR ELIMINACIÓN (Reemplaza a localhost:5173 dice) */}
      {confirmacionEliminar && (
        <ConfirmDeleteModal
          paciente={confirmacionEliminar.paciente}
          titulo="Advertencia"
          pregunta={confirmacionEliminar.pregunta}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setConfirmacionEliminar(null)}
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