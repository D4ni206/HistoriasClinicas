import { useState, useEffect, useRef } from 'react'
import * as docx from 'docx-preview'

const API_BASE = 'http://127.0.0.1:5000/api'

// Visor interactivo para documentos de Microsoft Word (.docx)
function DocxViewer({ url }) {
  const containerRef = useRef(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false
    const renderizar = async () => {
      setCargando(true)
      setError(null)
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const blob = await res.blob()
        if (!cancelado && containerRef.current) {
          containerRef.current.innerHTML = ''
          await docx.renderAsync(blob, containerRef.current, null, {
            className: 'docx-preview-doc',
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false
          })
        }
      } catch (err) {
        if (!cancelado) setError('No se pudo procesar la vista previa del archivo Word.')
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    renderizar()
    return () => { cancelado = true }
  }, [url])

  return (
    <div style={{ width: '100%', height: '75vh', overflow: 'auto', backgroundColor: '#e5e7eb', borderRadius: '8px', padding: '16px' }}>
      {cargando && (
        <div style={{ textAlign: 'center', color: '#1f2937', padding: '50px 20px', fontSize: '15px' }}>
          Procesando y renderizando documento Word (.docx)...
        </div>
      )}
      {error && (
        <div style={{ textAlign: 'center', color: '#b91c1c', padding: '30px' }}>
          <p style={{ fontWeight: '600' }}>{error}</p>
          <a
            href={url.replace('?view=1', '')}
            style={{
              display: 'inline-block',
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Descargar archivo Word
          </a>
        </div>
      )}
      <div ref={containerRef} style={{ display: cargando || error ? 'none' : 'block' }} />
    </div>
  )
}

// Visor para archivos de texto plano
function TextViewer({ url }) {
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch(url)
      .then(r => r.text())
      .then(t => { setTexto(t); setCargando(false) })
      .catch(() => setCargando(false))
  }, [url])

  return (
    <div style={{ width: '100%', height: '75vh', overflow: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', padding: '20px' }}>
      {cargando ? <p style={{ color: '#4b5563' }}>Cargando texto...</p> : <pre style={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: '#111827', fontSize: '13px' }}>{texto}</pre>}
    </div>
  )
}

// Componente de Login con fondo institucional y efecto de desenfoque (blur)
function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const u = username.trim()
    const p = password.trim()
    if (!u || !p) {
      setError('Por favor completa todos los campos.')
      return
    }

    setCargando(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('medix_usuario', JSON.stringify(data.usuario))
        onLoginSuccess(data.usuario)
      } else {
        setError(data.mensaje || 'Error al iniciar sesión. Verifique sus credenciales.')
      }
    } catch (err) {
      setError('Error de conexión con el backend de Medix.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      zIndex: 9999,
      backgroundColor: '#0f172a'
    }}>
      {/* Fondo ajustado al tamaño de la pantalla con desenfoque */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: "url('/fondo_login.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(8px) brightness(0.65)',
          zIndex: 1
        }}
      />

      {/* Capa de contraste y oscurecimiento */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          zIndex: 2
        }}
      />

      {/* Tarjeta de Inicio de Sesión */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '430px',
        margin: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.7)',
        padding: '36px 32px',
        boxSizing: 'border-box'
      }}>
        {/* Cabecera Institucional */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 12px',
            backgroundColor: '#eff6ff',
            border: '2px solid #bfdbfe',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)'
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '800',
            color: '#1e3a8a',
            margin: '0 0 4px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Hospital San Juan de Dios
          </h2>
          <p style={{ margin: '0 0 8px 0', color: '#0369a1', fontSize: '13px', fontWeight: '700', letterSpacing: '1px' }}>
            PISCO - PERÚ
          </p>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            Medix · Historias Clínicas Digitales
          </div>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #f87171',
            fontSize: '13px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontWeight: '700' }}>[Aviso]</span>
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1.5px solid #d1d5db',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                color: '#111827'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={mostrarPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                style={{
                  width: '100%',
                  padding: '11px 70px 11px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  color: '#111827'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#2563eb',
                  padding: '4px 6px'
                }}
              >
                {mostrarPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: cargando ? '#93c5fd' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '15px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {cargando ? 'Verificando credenciales...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Credenciales por defecto */}
        <div style={{
          marginTop: '20px',
          padding: '10px 12px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px dashed #cbd5e1',
          fontSize: '12px',
          color: '#64748b',
          textAlign: 'center'
        }}>
          <span>Acceso por defecto: <b>admin</b> / <b>admin123</b></span>
        </div>

        {/* Pie de tarjeta */}
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
          Sistema de Archivo y Gestión Documental © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  // Estado de usuario autenticado
  const [usuario, setUsuario] = useState(() => {
    try {
      const u = localStorage.getItem('medix_usuario')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })

  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

  // Filtro de búsqueda rápida por DNI
  const [busquedaDni, setBusquedaDni] = useState('')

  // Control de carpetas expandidas (Set de IDs)
  const [carpetasAbiertas, setCarpetasAbiertas] = useState(new Set())

  // Formulario nuevo documento
  const [dni, setDni] = useState('')
  const [file, setFile] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const fileInputRef = useRef(null)

  // Edición de DNI de paciente
  const [editandoPaciente, setEditandoPaciente] = useState(null)
  const [nuevoDni, setNuevoDni] = useState('')

  // Panel / Visor de documento (modal)
  const [documentoEnVista, setDocumentoEnVista] = useState(null)

  const esPdf = (nombre = '') => nombre.toLowerCase().endsWith('.pdf')
  const esDocx = (nombre = '') => /\.(docx|doc)$/i.test(nombre)
  const esImagen = (nombre = '') => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(nombre)
  const esTexto = (nombre = '') => /\.(txt|csv|log|json|xml)$/i.test(nombre)

  const obtenerIconoArchivo = (nombre = '') => {
    let tipo = 'DOC'
    let bg = '#f3f4f6'
    let color = '#374151'
    let border = '#d1d5db'

    if (esPdf(nombre)) {
      tipo = 'PDF'
      bg = '#fee2e2'
      color = '#991b1b'
      border = '#fca5a5'
    } else if (esDocx(nombre)) {
      tipo = 'DOCX'
      bg = '#dbeafe'
      color = '#1e40af'
      border = '#93c5fd'
    } else if (esImagen(nombre)) {
      tipo = 'IMG'
      bg = '#dcfce7'
      color = '#166534'
      border = '#86efac'
    } else if (esTexto(nombre)) {
      tipo = 'TXT'
      bg = '#fef3c7'
      color = '#92400e'
      border = '#fde68a'
    }

    return (
      <span style={{
        display: 'inline-block',
        padding: '2px 6px',
        fontSize: '11px',
        fontWeight: '700',
        borderRadius: '4px',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        letterSpacing: '0.5px'
      }}>
        {tipo}
      </span>
    )
  }

  useEffect(() => {
    if (usuario) {
      cargarDatos(true)
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDocumentoEnVista(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [usuario])

  const notificar = (tipo, texto) => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000)
  }

  const cargarDatos = async (abrirTodos = false) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/pacientes`)
      if (res.ok) {
        const data = await res.json()
        setPacientes(data)
        if (abrirTodos) {
          // Abrir todas las carpetas por defecto al inicio
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

  // Pre-cargar DNI y abrir selector de archivos para una carpeta específica
  const agregarArchivoACarpeta = (dniPaciente, pacId) => {
    setDni(dniPaciente)
    setCarpetasAbiertas(prev => new Set([...prev, pacId]))
    if (fileInputRef.current) {
      fileInputRef.current.focus()
      fileInputRef.current.click()
    }
  }

  // C: Crear o agregar documento a la carpeta del DNI
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
        notificar('exito', data.mensaje || `Documento guardado en la carpeta del DNI ${dniLimpio}.`)
        setDni('')
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''

        // Recargar datos y asegurarse de que la carpeta quede abierta
        const res = await fetch(`${API_BASE}/pacientes`)
        if (res.ok) {
          const lista = await res.json()
          setPacientes(lista)
          if (pacId) {
            setCarpetasAbiertas(prev => new Set([...prev, pacId]))
          }
        }
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

  // D: Eliminar Documento individual de una carpeta
  const handleEliminarDocumento = async (id, nombre, pacId) => {
    if (!window.confirm(`¿Eliminar el archivo "${nombre}" (#${id})? Se borrará de SQL Server y MinIO.`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/documentos/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (response.ok) {
        notificar('exito', data.mensaje || 'Documento eliminado de la carpeta.')
        // Recargar pacientes
        const res = await fetch(`${API_BASE}/pacientes`)
        if (res.ok) setPacientes(await res.json())
      } else {
        notificar('error', data.mensaje || 'Error al eliminar.')
      }
    } catch (error) {
      notificar('error', 'Error de red al intentar eliminar documento.')
    }
  }

  // D: Eliminar Carpeta completa del paciente
  const handleEliminarPaciente = async (id, dniPac) => {
    if (!window.confirm(`¿Eliminar la carpeta completa del DNI ${dniPac} (#${id})? Se borrarán todos los documentos contenidos.`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/pacientes/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (response.ok) {
        notificar('exito', data.mensaje || 'Carpeta eliminada.')
        cargarDatos()
      } else {
        notificar('error', data.mensaje || 'Error al eliminar carpeta.')
      }
    } catch (error) {
      notificar('error', 'Error al eliminar la carpeta.')
    }
  }

  // Pacientes filtrados por búsqueda
  const pacientesFiltrados = pacientes.filter(p =>
    p.dni.toLowerCase().includes(busquedaDni.trim().toLowerCase())
  )

  // Verificación en tiempo real si el DNI escrito en el formulario ya existe
  const pacienteDetectado = pacientes.find(p => p.dni.trim() === dni.trim())

  const totalArchivosSistema = pacientes.reduce((acc, p) => acc + (p.total_documentos || 0), 0)

  // Si no hay sesión iniciada, mostrar la pantalla de Login con fondo desenfocado
  if (!usuario) {
    return <LoginView onLoginSuccess={(u) => { setUsuario(u); }} />
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1f2937' }}>
      {/* Encabezado Principal */}
      <header style={{ marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>Medix</span>
              <span style={{ fontSize: '18px', fontWeight: '500', color: '#4b5563' }}>| Expedientes Clínicos Digitales</span>
            </h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              Hospital San Juan de Dios de Pisco · Organización por DNI con SQL Server y MinIO
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid #bfdbfe' }}>
              Carpetas: {pacientes.length}
            </span>
            <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid #bbf7d0' }}>
              Documentos: {totalArchivosSistema}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px', paddingLeft: '8px', borderLeft: '2px solid #e5e7eb' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', backgroundColor: '#f3f4f6', padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                Usuario: {usuario.username} ({usuario.rol || 'Personal'})
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('medix_usuario')
                  setUsuario(null)
                }}
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fca5a5',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
                title="Cerrar sesión y volver a la pantalla de Login"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Alerta de Estado */}
      {mensaje.texto && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: mensaje.tipo === 'exito' ? '#def7ec' : '#fde8e8',
          color: mensaje.tipo === 'exito' ? '#03543f' : '#9b1c1c',
          border: `1px solid ${mensaje.tipo === 'exito' ? '#84e1bc' : '#f8b4b4'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontWeight: '500' }}>{mensaje.texto}</span>
          <button onClick={() => setMensaje({ tipo: '', texto: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
        </div>
      )}

      {/* Panel de Subida con Detección Automática de Carpeta */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '22px',
        marginBottom: '28px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
      }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 14px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Subir Documento a una Carpeta</span>
        </h2>

        <form onSubmit={handleUpload}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: '1 1 220px' }}>
              <input
                type="text"
                placeholder="DNI del Paciente (Ej: 12345678)"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
                required
              />
            </div>

            <div style={{ flex: '2 1 320px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/*, text/plain"
                onChange={(e) => setFile(e.target.files[0])}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  backgroundColor: '#f9fafb'
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={subiendo}
              style={{
                padding: '10px 22px',
                backgroundColor: subiendo ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: subiendo ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              {subiendo ? 'Subiendo a MinIO...' : 'Guardar en Carpeta'}
            </button>
          </div>

          {/* Detección en tiempo real del DNI */}
          {dni.trim().length > 0 && (
            <div style={{ marginTop: '12px' }}>
              {pacienteDetectado ? (
                <div style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1e40af',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>
                    <strong>Carpeta existente detectada:</strong> El archivo se agregará al expediente del <strong>DNI {pacienteDetectado.dni}</strong> (que contiene actualmente {pacienteDetectado.total_documentos} {pacienteDetectado.total_documentos === 1 ? 'documento' : 'documentos'}).
                  </span>
                </div>
              ) : (
                <div style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>
                    <strong>Nueva carpeta:</strong> Se creará un nuevo expediente clínico para el DNI <strong>{dni.trim()}</strong>.
                  </span>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Barra de Búsqueda y Herramientas */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px'
      }}>
        {/* Buscador de DNI */}
        <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 300px' }}>
          <input
            type="text"
            placeholder="Buscar carpeta por DNI..."
            value={busquedaDni}
            onChange={(e) => setBusquedaDni(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '9px 14px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              backgroundColor: '#ffffff'
            }}
          />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '11px' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          {busquedaDni && (
            <button
              onClick={() => setBusquedaDni('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                fontSize: '13px',
                fontWeight: 'bold'
              }}
            >
              X
            </button>
          )}
        </div>

        {/* Acciones de control */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={expandirTodas}
            style={{
              padding: '7px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              color: '#374151'
            }}
          >
            Expandir todas
          </button>
          <button
            onClick={colapsarTodas}
            style={{
              padding: '7px 14px',
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
          <button
            onClick={() => cargarDatos(false)}
            style={{
              padding: '7px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              color: '#374151'
            }}
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* LISTADO DE CARPETAS / EXPEDIENTES CLÍNICOS */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#6b7280' }}>
          Cargando expedientes clínicos...
        </div>
      ) : pacientesFiltrados.length === 0 ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          border: '2px dashed #d1d5db',
          borderRadius: '12px',
          color: '#6b7280'
        }}>
          <p style={{ fontSize: '16px', margin: '0 0 6px 0', fontWeight: '600' }}>
            {busquedaDni ? `No se encontró ninguna carpeta con el DNI "${busquedaDni}"` : 'No hay expedientes clínicos registrados todavía.'}
          </p>
          <p style={{ fontSize: '13px', margin: 0 }}>
            Utiliza el formulario superior para ingresar un DNI y subir el primer documento.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pacientesFiltrados.map((pac) => {
            const estaAbierta = carpetasAbiertas.has(pac.id)
            const docs = pac.documentos || []

            return (
              <div
                key={pac.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: estaAbierta ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '10px',
                  boxShadow: estaAbierta ? '0 4px 12px rgba(59, 130, 246, 0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Cabecera de la Carpeta */}
                <div
                  style={{
                    padding: '14px 18px',
                    backgroundColor: estaAbierta ? '#f0f7ff' : '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    borderBottom: estaAbierta ? '1px solid #bfdbfe' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleCarpeta(pac.id)}
                >
                  {/* Info del DNI */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: estaAbierta ? '#dbeafe' : '#e5e7eb',
                      color: estaAbierta ? '#1e40af' : '#4b5563',
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
                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', fontWeight: 'bold' }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleGuardarDni(pac.id)}
                            style={{ padding: '4px 10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditandoPaciente(null)}
                            style={{ padding: '4px 10px', backgroundColor: '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '17px', fontWeight: '800', color: '#111827' }}>
                            DNI: {pac.dni}
                          </span>
                          <span style={{
                            backgroundColor: docs.length > 0 ? '#dcfce7' : '#fee2e2',
                            color: docs.length > 0 ? '#166534' : '#991b1b',
                            padding: '3px 9px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {docs.length} {docs.length === 1 ? 'archivo' : 'archivos'}
                          </span>
                        </div>
                      )}
                      <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                        Expediente clínico #{pac.id}
                      </p>
                    </div>
                  </div>

                  {/* Botones de acción en la cabecera */}
                  <div
                    style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => agregarArchivoACarpeta(pac.dni, pac.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
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
                          padding: '6px 10px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#374151',
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
                        padding: '6px 10px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #fca5a5',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#dc2626',
                        cursor: 'pointer'
                      }}
                      title="Eliminar carpeta y todos sus archivos"
                    >
                      Borrar
                    </button>

                    <button
                      onClick={() => toggleCarpeta(pac.id)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#6b7280'
                      }}
                      title={estaAbierta ? 'Colapsar carpeta' : 'Abrir carpeta'}
                    >
                      {estaAbierta ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {/* CONTENIDO INTERNO DE LA CARPETA (LISTA DE DOCUMENTOS) */}
                {estaAbierta && (
                  <div style={{ padding: '16px', backgroundColor: '#ffffff' }}>
                    {docs.length === 0 ? (
                      <div style={{
                        padding: '24px',
                        textAlign: 'center',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px dashed #d1d5db',
                        color: '#6b7280'
                      }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                          Esta carpeta no contiene documentos actualmente.
                        </p>
                        <button
                          onClick={() => agregarArchivoACarpeta(pac.dni, pac.id)}
                          style={{
                            padding: '6px 14px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          + Subir primer documento a este DNI
                        </button>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                              <th style={{ padding: '10px 14px', textAlign: 'left' }}>Tipo</th>
                              <th style={{ padding: '10px 14px', textAlign: 'left' }}>Nombre del Archivo</th>
                              <th style={{ padding: '10px 14px', textAlign: 'left' }}>Fecha de Subida</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {docs.map((doc) => (
                              <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '10px 14px' }}>
                                  {obtenerIconoArchivo(doc.nombre_archivo)}
                                </td>
                                <td style={{ padding: '10px 14px', fontWeight: '500', color: '#1e293b' }}>
                                  {doc.nombre_archivo}
                                </td>
                                <td style={{ padding: '10px 14px', color: '#64748b' }}>
                                  {doc.fecha_subida || '—'}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                                    <button
                                      onClick={() => setDocumentoEnVista(doc)}
                                      style={{
                                        padding: '5px 10px',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                      }}
                                      title="Vista previa en panel"
                                    >
                                      Ver
                                    </button>

                                    <a
                                      href={`${API_BASE}/documentos/${doc.id}/archivo`}
                                      style={{
                                        padding: '5px 10px',
                                        backgroundColor: '#6366f1',
                                        color: 'white',
                                        borderRadius: '5px',
                                        textDecoration: 'none',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                      }}
                                      title="Descargar copia física"
                                    >
                                      Descargar
                                    </a>

                                    <button
                                      onClick={() => handleEliminarDocumento(doc.id, doc.nombre_archivo, pac.id)}
                                      style={{
                                        padding: '5px 10px',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                      }}
                                      title="Eliminar este archivo"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
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

      {/* MODAL / PANEL DE VISTA PREVIA INTERACTIVO */}
      {documentoEnVista && (
        <div
          onClick={() => setDocumentoEnVista(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.72)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px',
            backdropFilter: 'blur(3px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '980px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden'
            }}
          >
            {/* Cabecera del Panel */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f9fafb'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#111827', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{obtenerIconoArchivo(documentoEnVista.nombre_archivo)}</span>
                  <span>{documentoEnVista.nombre_archivo}</span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#4b5563' }}>
                  Carpeta DNI: <strong style={{ color: '#0369a1' }}>{documentoEnVista.paciente_dni || 'Sin DNI'}</strong> | Subido el: {documentoEnVista.fecha_subida || '—'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={`${API_BASE}/documentos/${documentoEnVista.id}/archivo`}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  Descargar
                </a>
                <button
                  onClick={() => setDocumentoEnVista(null)}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#e5e7eb',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#374151'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Contenedor del Visor */}
            <div style={{
              flex: 1,
              backgroundColor: '#1f2937',
              padding: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '450px',
              maxHeight: 'calc(92vh - 80px)',
              overflow: 'auto'
            }}>
              {esPdf(documentoEnVista.nombre_archivo) ? (
                <iframe
                  src={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`}
                  title={`Visor PDF - ${documentoEnVista.nombre_archivo}`}
                  style={{
                    width: '100%',
                    height: '75vh',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff'
                  }}
                />
              ) : esDocx(documentoEnVista.nombre_archivo) ? (
                <DocxViewer url={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`} />
              ) : esImagen(documentoEnVista.nombre_archivo) ? (
                <div style={{ textAlign: 'center', width: '100%', maxHeight: '75vh', overflow: 'auto' }}>
                  <img
                    src={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`}
                    alt="Vista previa de documento"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '75vh',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                    }}
                  />
                </div>
              ) : esTexto(documentoEnVista.nombre_archivo) ? (
                <TextViewer url={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`} />
              ) : (
                <div style={{ textAlign: 'center', color: '#f3f4f6', padding: '40px' }}>
                  <p style={{ fontSize: '16px', marginBottom: '12px' }}>
                    Este tipo de archivo no admite previsualización directa en el navegador.
                  </p>
                  <a
                    href={`${API_BASE}/documentos/${documentoEnVista.id}/archivo`}
                    style={{
                      display: 'inline-block',
                      padding: '10px 18px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: '600'
                    }}
                  >
                    Descargar archivo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}