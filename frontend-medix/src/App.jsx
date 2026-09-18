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

// Componente de Login con diseño institucional de dos paneles (Banco de Historias Clínicas)
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
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#FAF7F5',
      display: 'flex',
      flexDirection: 'row',
      overflow: 'hidden',
      zIndex: 9999,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* PANEL IZQUIERDO: Tarjeta Amarilla Institucional que llena la mitad izquierda */}
      <div style={{
        flex: '1.2 1 0',
        height: '100vh',
        padding: '16px',
        boxSizing: 'border-box',
        display: 'flex'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#FEF7A7',
          borderRadius: '36px',
          padding: 'clamp(32px, 5vh, 60px) clamp(36px, 5vw, 68px)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 10px 35px rgba(220, 190, 80, 0.16)'
        }}>
          {/* Cabecera: Logo y Nombre del Hospital */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px'
          }}>
            <img
              src="/logo_hospital.png"
              alt="Hospital San Juan de Dios de Pisco"
              style={{
                height: '68px',
                width: 'auto',
                objectFit: 'contain',
                mixBlendMode: 'multiply'
              }}
            />
            <span style={{
              fontSize: 'clamp(17px, 1.8vw, 22px)',
              fontWeight: '900',
              fontStyle: 'italic',
              letterSpacing: '-0.3px',
              color: '#000000',
              textTransform: 'uppercase'
            }}>
              HOSPITAL SAN JUAN DE DIOS - PISCO
            </span>
          </div>

          {/* Bloque Central: BANCO DE HISTORIAS CLINICAS */}
          <div style={{ margin: 'auto 0', padding: '24px 0' }}>
            <h1 style={{
              fontSize: 'clamp(38px, 4.8vw, 72px)',
              fontWeight: '900',
              lineHeight: '1.05',
              color: '#D28A4A',
              margin: '0 0 22px 0',
              textTransform: 'uppercase',
              letterSpacing: '-1px'
            }}>
              BANCO DE<br />
              HISTORIAS<br />
              CLINICAS
            </h1>

            <p style={{
              margin: 0,
              fontSize: 'clamp(13px, 1.2vw, 16px)',
              fontWeight: '500',
              lineHeight: '1.45',
              color: '#8A8765',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              maxWidth: '520px'
            }}>
              SISTEMA QUE AYUDA A VER HISTORIAS CLINICAS, DE FORMA RAPIDA Y SEGURA
            </p>
          </div>

          {/* Pie del Panel Izquierdo */}
          <div>
            <span style={{
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: 'clamp(12px, 1.1vw, 14px)',
              color: '#262626'
            }}>
              Reduce tiempo de busqueda manual
            </span>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO: Formulario de Iniciar Sesión que llena la mitad derecha */}
      <div style={{
        flex: '1 1 0',
        height: '100vh',
        backgroundColor: '#FAF7F5',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(24px, 4vh, 48px) clamp(24px, 4vw, 64px)',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}>
        {/* Contenedor del Formulario perfectamente centrado */}
        <div style={{
          maxWidth: '400px',
          width: '100%',
          margin: 'auto auto'
        }}>
          {/* Título y subtítulo */}
          <h2 style={{
            fontSize: 'clamp(30px, 2.8vw, 38px)',
            fontWeight: '800',
            color: '#000000',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            Iniciar sesion
          </h2>
          <p style={{
            margin: '0 0 32px 0',
            fontSize: '15px',
            color: '#71717a'
          }}>
            Bienvenido, ingrese sus credenciales
          </p>

          {/* Error banner si falla el login */}
          {error && (
            <div style={{
              padding: '10px 16px',
              borderRadius: '16px',
              backgroundColor: '#FDE8E8',
              color: '#9B1C1C',
              border: '1px solid #F8B4B4',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {/* Campo USUARIO */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: '#18181b',
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                USUARIO
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su usuario"
                required
                style={{
                  width: '100%',
                  height: '50px',
                  backgroundColor: '#D9D9D9',
                  border: '2px solid #E5B458',
                  borderRadius: '25px',
                  padding: '0 22px',
                  fontSize: '15px',
                  color: '#18181b',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, background-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#C99335'}
                onBlur={(e) => e.target.style.borderColor = '#E5B458'}
              />
            </div>

            {/* Campo CONTRASEÑA */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: '#18181b',
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                CONTRASEÑA
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    height: '50px',
                    backgroundColor: '#D9D9D9',
                    border: '2px solid #E5B458',
                    borderRadius: '25px',
                    padding: '0 54px 0 22px',
                    fontSize: '15px',
                    color: '#18181b',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, background-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#C99335'}
                  onBlur={(e) => e.target.style.borderColor = '#E5B458'}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#71717a',
                    padding: '4px'
                  }}
                >
                  {mostrarPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            {/* Olvidaste tu contraseña */}
            <div style={{ textAlign: 'right', marginBottom: '26px' }}>
              <a
                href="#recuperar"
                onClick={(e) => {
                  e.preventDefault()
                  alert('Para restablecer su contraseña, por favor acérquese a la oficina de Soporte TI del Hospital San Juan de Dios.')
                }}
                style={{
                  fontSize: '13px',
                  fontStyle: 'italic',
                  color: '#B55D46',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón Acceder al sistema */}
            <button
              type="submit"
              disabled={cargando}
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: cargando ? '#e3b874' : '#DDA757',
                color: '#111111',
                border: 'none',
                borderRadius: '26px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: cargando ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(221, 167, 87, 0.35)',
                transition: 'background-color 0.2s, transform 0.1s'
              }}
            >
              {cargando ? 'Accediendo...' : 'Acceder al sistema'}
            </button>
          </form>

          {/* Ayuda de acceso institucional */}
          <div style={{
            marginTop: '20px',
            padding: '8px 12px',
            backgroundColor: '#FEF7A7',
            borderRadius: '16px',
            fontSize: '12px',
            color: '#634706',
            textAlign: 'center',
            border: '1px solid #E5B458'
          }}>
            Acceso institucional: <strong>admin</strong> / <strong>admin123</strong>
          </div>
        </div>

        {/* Pie del Panel Derecho */}
        <div style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#52525b',
          marginTop: 'auto',
          paddingTop: '20px'
        }}>
          Acceso restringido al personal autorizado{' '}
          <span
            onClick={() => alert('Contacto Soporte TI:\nAnexo: 404\nEmail: soporte@hospitalsanjuandediospisco.gob.pe')}
            style={{
              color: '#BD6E38',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Soporte TI
          </span>
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

  // Herramienta activa en el panel izquierdo
  const [herramientaActiva, setHerramientaActiva] = useState('dashboard') // 'dashboard' | 'nueva-historia' | 'usuarios' | 'configuracion'

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
  const [formUsuario, setFormUsuario] = useState({ username: '', password: '', rol: 'Médico' })
  const [creandoUsuario, setCreandoUsuario] = useState(false)

  // Diagnóstico / Configuración del sistema
  const [diagnostico, setDiagnostico] = useState(null)
  const [cargandoDiagnostico, setCargandoDiagnostico] = useState(false)

  // Modo de visualización dentro del Dashboard ('carpetas' | 'cuadricula' | 'tabla-documentos' | 'analitica')
  const [vistaDashboard, setVistaDashboard] = useState('carpetas')
  // Filtro por tipo de documento en la vista de tabla general ('todos' | 'pdf' | 'docx' | 'imagen' | 'texto')
  const [filtroTipoDoc, setFiltroTipoDoc] = useState('todos')

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
      bg = '#F3C7B6'
      color = '#70220e'
      border = '#e19d85'
    } else if (esDocx(nombre)) {
      tipo = 'DOCX'
      bg = '#A7C7D9'
      color = '#0c354e'
      border = '#84aabd'
    } else if (esImagen(nombre)) {
      tipo = 'IMG'
      bg = '#CFE7D6'
      color = '#134e2b'
      border = '#9ec6ac'
    } else if (esTexto(nombre)) {
      tipo = 'TXT'
      bg = '#FFF2B6'
      color = '#634706'
      border = '#F6E38F'
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
        notificar('exito', data.mensaje || `Usuario "${formUsuario.username}" registrado exitosamente.`)
        setFormUsuario({ username: '', password: '', rol: 'Médico' })
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

  const handleEliminarUsuario = async (id, nombre) => {
    if (!window.confirm(`¿Seguro que desea eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) {
      return
    }
    try {
      const res = await fetch(`${API_BASE}/usuarios/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        notificar('exito', data.mensaje || 'Usuario eliminado correctamente.')
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

  useEffect(() => {
    if (usuario) {
      cargarDatos(true)
      cargarUsuarios()
      cargarDiagnostico()
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

  // Pre-cargar DNI y abrir herramienta de nueva historia
  const agregarArchivoACarpeta = (dniPaciente, pacId) => {
    setDni(dniPaciente)
    setCarpetasAbiertas(prev => new Set([...prev, pacId]))
    setHerramientaActiva('nueva-historia')
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.focus()
        fileInputRef.current.click()
      }
    }, 150)
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

        // Recargar datos y volver al dashboard abriendo la carpeta
        const res = await fetch(`${API_BASE}/pacientes`)
        if (res.ok) {
          const lista = await res.json()
          setPacientes(lista)
          if (pacId) {
            setCarpetasAbiertas(prev => new Set([...prev, pacId]))
          }
        }
        cargarDiagnostico()
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
        cargarDiagnostico()
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

  // Lista unificada de todos los documentos en el sistema
  const todosLosDocumentos = pacientes.flatMap(p =>
    (p.documentos || []).map(doc => ({
      ...doc,
      paciente_dni: doc.paciente_dni || p.dni,
      paciente_id: doc.paciente_id || p.id
    }))
  )

  // Documentos filtrados para la vista de tabla general
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

  // Conteo de formatos para analítica y filtros
  const totalPdfs = todosLosDocumentos.filter(d => esPdf(d.nombre_archivo)).length
  const totalDocx = todosLosDocumentos.filter(d => esDocx(d.nombre_archivo)).length
  const totalImagenes = todosLosDocumentos.filter(d => esImagen(d.nombre_archivo)).length
  const totalTextos = todosLosDocumentos.filter(d => esTexto(d.nombre_archivo)).length

  // Verificación en tiempo real si el DNI escrito en el formulario ya existe
  const pacienteDetectado = pacientes.find(p => p.dni.trim() === dni.trim())
  const totalArchivosSistema = pacientes.reduce((acc, p) => acc + (p.total_documentos || 0), 0)

  // Si no hay sesión iniciada, mostrar la pantalla de Login completa
  if (!usuario) {
    return <LoginView onLoginSuccess={(u) => { setUsuario(u); }} />
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
      color: '#1e293b',
      display: 'flex'
    }}>
      {/* ========================================================================= */}
      {/* 1. PANEL IZQUIERDO: HERRAMIENTAS Y NAVEGACIÓN MODULAR */}
      {/* ========================================================================= */}
      <aside style={{
        width: '300px',
        flex: '0 0 300px',
        height: '100vh',
        backgroundColor: '#ffffff',
        borderRight: '1.5px solid #A7C7D9',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        zIndex: 20
      }}>
        {/* Contenido superior y menú con scroll independiente */}
        <div style={{ padding: '18px 16px', overflowY: 'auto', flex: 1 }}>
          {/* Cabecera Institucional */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1.5px solid #A7C7D9' }}>
            <img
              src="/logo_hospital.png"
              alt="Hospital San Juan de Dios de Pisco"
              style={{
                height: '46px',
                width: 'auto',
                objectFit: 'contain',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                padding: '2px 4px',
                border: '1.5px solid #A7C7D9',
                boxShadow: '0 2px 5px rgba(167, 199, 217, 0.3)'
              }}
            />
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0f2942', margin: 0, lineHeight: '1.2' }}>
                Medix
              </h1>
              <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '11px', fontWeight: '600' }}>
                HOSPITAL SAN JUAN DE DIOS · PISCO
              </p>
              <span style={{ fontSize: '10px', color: '#0c354e', backgroundColor: '#CFE7D6', padding: '1px 6px', borderRadius: '4px', fontWeight: '700', border: '1px solid #9ec6ac' }}>
                UE-404
              </span>
            </div>
          </div>

          {/* Tarjeta de Sesión de Usuario */}
          <div style={{
            backgroundColor: '#FFF2B6',
            border: '1px solid #F6E38F',
            borderRadius: '10px',
            padding: '10px 12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div>
              <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#634706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Usuario Conectado
              </span>
              <strong style={{ fontSize: '13px', color: '#0f2942' }}>
                {usuario.username}
              </strong>
              <span style={{ fontSize: '11px', color: '#634706', marginLeft: '4px' }}>
                ({usuario.rol || 'Personal'})
              </span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('medix_usuario')
                setUsuario(null)
              }}
              style={{
                backgroundColor: '#F3C7B6',
                color: '#70220e',
                border: '1px solid #e19d85',
                padding: '5px 9px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              title="Cerrar sesión y volver a la pantalla de acceso"
            >
              Cerrar Sesión
            </button>
          </div>

          {/* MENÚ DE HERRAMIENTAS SOLICITADO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', paddingLeft: '4px' }}>
              Herramientas
            </span>

            {/* 1. DASHBOARD */}
            <button
              onClick={() => setHerramientaActiva('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '8px',
                border: herramientaActiva === 'dashboard' ? '1.5px solid #84aabd' : '1px solid #e2e8f0',
                backgroundColor: herramientaActiva === 'dashboard' ? '#A7C7D9' : '#ffffff',
                color: herramientaActiva === 'dashboard' ? '#0c354e' : '#334155',
                fontWeight: herramientaActiva === 'dashboard' ? '700' : '600',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: herramientaActiva === 'dashboard' ? '0 2px 6px rgba(167, 199, 217, 0.45)' : 'none'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Dashboard</span>
                <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: '500' }}>Expedientes y carpetas</span>
              </div>
            </button>

            {/* 2. AGREGAR NUEVA HISTORIA */}
            <button
              onClick={() => setHerramientaActiva('nueva-historia')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '8px',
                border: herramientaActiva === 'nueva-historia' ? '1.5px solid #9ec6ac' : '1px solid #e2e8f0',
                backgroundColor: herramientaActiva === 'nueva-historia' ? '#CFE7D6' : '#ffffff',
                color: herramientaActiva === 'nueva-historia' ? '#134e2b' : '#334155',
                fontWeight: herramientaActiva === 'nueva-historia' ? '700' : '600',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: herramientaActiva === 'nueva-historia' ? '0 2px 6px rgba(158, 198, 172, 0.45)' : 'none'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Agregar nueva historia</span>
                <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: '500' }}>Subir documentos clínicos</span>
              </div>
            </button>

            {/* 3. CREAR USUARIOS */}
            <button
              onClick={() => setHerramientaActiva('usuarios')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '8px',
                border: herramientaActiva === 'usuarios' ? '1.5px solid #F6E38F' : '1px solid #e2e8f0',
                backgroundColor: herramientaActiva === 'usuarios' ? '#FFF2B6' : '#ffffff',
                color: herramientaActiva === 'usuarios' ? '#634706' : '#334155',
                fontWeight: herramientaActiva === 'usuarios' ? '700' : '600',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: herramientaActiva === 'usuarios' ? '0 2px 6px rgba(246, 227, 143, 0.45)' : 'none'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Crear usuarios</span>
                <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: '500' }}>Personal y roles</span>
              </div>
            </button>

            {/* 4. CONFIGURACIÓN */}
            <button
              onClick={() => setHerramientaActiva('configuracion')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '8px',
                border: herramientaActiva === 'configuracion' ? '1.5px solid #e19d85' : '1px solid #e2e8f0',
                backgroundColor: herramientaActiva === 'configuracion' ? '#F3C7B6' : '#ffffff',
                color: herramientaActiva === 'configuracion' ? '#70220e' : '#334155',
                fontWeight: herramientaActiva === 'configuracion' ? '700' : '600',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: herramientaActiva === 'configuracion' ? '0 2px 6px rgba(243, 199, 182, 0.45)' : 'none'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Configuración</span>
                <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: '500' }}>Diagnóstico y servicios</span>
              </div>
            </button>
          </div>

          {/* Métricas Rápidas */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
            <div style={{
              flex: 1,
              backgroundColor: '#A7C7D9',
              border: '1px solid #84aabd',
              borderRadius: '8px',
              padding: '8px 10px',
              textAlign: 'center'
            }}>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#0c354e' }}>Carpetas</span>
              <strong style={{ fontSize: '18px', color: '#0c354e' }}>{pacientes.length}</strong>
            </div>
            <div style={{
              flex: 1,
              backgroundColor: '#CFE7D6',
              border: '1px solid #9ec6ac',
              borderRadius: '8px',
              padding: '8px 10px',
              textAlign: 'center'
            }}>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#134e2b' }}>Documentos</span>
              <strong style={{ fontSize: '18px', color: '#134e2b' }}>{totalArchivosSistema}</strong>
            </div>
          </div>
        </div>

        {/* Pie del Panel Izquierdo */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b', textAlign: 'center', backgroundColor: '#fafafa' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            <span style={{ fontWeight: '700', color: '#0f2942' }}>Sistema Operativo</span>
          </div>
          Hospital San Juan de Dios - Pisco · UE-404
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. PANEL CENTRAL: VISTA DINÁMICA SEGÚN HERRAMIENTA SELECCIONADA */}
      {/* ========================================================================= */}
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
        {/* Alerta de Estado Global */}
        {mensaje.texto && (
          <div style={{
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            backgroundColor: mensaje.tipo === 'exito' ? '#CFE7D6' : '#F3C7B6',
            color: mensaje.tipo === 'exito' ? '#134e2b' : '#70220e',
            border: `1px solid ${mensaje.tipo === 'exito' ? '#9ec6ac' : '#e19d85'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            fontSize: '13px'
          }}>
            <span style={{ fontWeight: '600' }}>{mensaje.texto}</span>
            <button onClick={() => setMensaje({ tipo: '', texto: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'inherit' }}>X</button>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* VISTA A: DASHBOARD CON VISTAS DISTINTAS (CARPETAS, CUADRÍCULA, TABLA GENERAL, ANALÍTICA) */}
        {/* ----------------------------------------------------------------------- */}
        {herramientaActiva === 'dashboard' && (
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
                  onClick={() => setHerramientaActiva('nueva-historia')}
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
                      onClick={() => setHerramientaActiva('nueva-historia')}
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
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* VISTA B: AGREGAR NUEVA HISTORIA CLÍNICA */}
        {/* ----------------------------------------------------------------------- */}
        {herramientaActiva === 'nueva-historia' && (
          <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
            <div style={{ marginBottom: '22px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f2942', margin: '0 0 6px 0' }}>
                Agregar Nueva Historia Clínica
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Registra un nuevo expediente clínico o anexa documentos a una carpeta existente por DNI.
              </p>
            </div>

            {/* Tarjeta del Formulario Principal */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '2px solid #A7C7D9',
              borderRadius: '12px',
              padding: '28px',
              boxShadow: '0 4px 16px rgba(167, 199, 217, 0.25)',
              marginBottom: '20px'
            }}>
              <form onSubmit={handleUpload}>
                {/* Campo DNI */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f2942', marginBottom: '8px' }}>
                    DNI DEL PACIENTE (8 dígitos)
                  </label>
                  <input
                    type="text"
                    placeholder="Ejemplo: 45892314"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1.5px solid #d1d5db',
                      fontSize: '15px',
                      fontWeight: '600',
                      outline: 'none',
                      backgroundColor: '#f8fafc'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#A7C7D9'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                {/* Detección en tiempo real de carpeta por DNI */}
                {dni.trim().length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    {pacienteDetectado ? (
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        backgroundColor: '#CFE7D6',
                        border: '1.5px solid #9ec6ac',
                        color: '#134e2b',
                        fontSize: '13px',
                        lineHeight: '1.4'
                      }}>
                        <strong>Carpeta Identificada:</strong> El DNI <strong>{pacienteDetectado.dni}</strong> ya cuenta con {pacienteDetectado.total_documentos} documento(s) registrado(s). El nuevo archivo se anexará dentro de su carpeta existente de manera ordenada.
                      </div>
                    ) : (
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        backgroundColor: '#FFF2B6',
                        border: '1.5px solid #F6E38F',
                        color: '#634706',
                        fontSize: '13px',
                        lineHeight: '1.4'
                      }}>
                        <strong>Nuevo Expediente:</strong> El DNI <strong>{dni.trim()}</strong> no está registrado. Al guardar se creará una carpeta digital exclusiva para este paciente.
                      </div>
                    )}
                  </div>
                )}

                {/* Campo Selector de Archivo */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f2942', marginBottom: '8px' }}>
                    DOCUMENTO / ARCHIVO ADJUNTO
                  </label>
                  <div style={{
                    border: '2px dashed #A7C7D9',
                    borderRadius: '8px',
                    padding: '24px',
                    textAlign: 'center',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer'
                  }}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/*, text/plain"
                      onChange={(e) => setFile(e.target.files[0])}
                      style={{ display: 'none' }}
                      required
                    />
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0c354e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px auto', display: 'block' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    {file ? (
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f2942', display: 'block' }}>
                          Archivo seleccionado: {file.name}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          Tamaño: {(file.size / 1024).toFixed(1)} KB · Clic para cambiar
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#0c354e', display: 'block' }}>
                          Haz clic aquí para seleccionar el archivo de historia clínica
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          Formatos admitidos: PDF, Word (.docx), Imágenes (JPG, PNG) y Texto (.txt)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón de Envío */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    disabled={subiendo}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      backgroundColor: subiendo ? '#d5e4ec' : '#A7C7D9',
                      color: '#0c354e',
                      border: '1.5px solid #84aabd',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: subiendo ? 'not-allowed' : 'pointer',
                      boxShadow: '0 3px 6px rgba(167, 199, 217, 0.4)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {subiendo ? 'Guardando en MinIO S3 y registrando en SQL Server...' : 'Guardar en Carpeta del Paciente'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setHerramientaActiva('dashboard')}
                    style={{
                      padding: '12px 18px',
                      backgroundColor: '#ffffff',
                      color: '#334155',
                      border: '1.5px solid #d1d5db',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Ver Dashboard
                  </button>
                </div>
              </form>
            </div>

            {/* Tarjeta de Información de Funcionamiento */}
            <div style={{
              backgroundColor: '#FFF2B6',
              border: '1px solid #F6E38F',
              borderRadius: '10px',
              padding: '16px 20px',
              color: '#634706',
              fontSize: '12px',
              lineHeight: '1.5'
            }}>
              <strong style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
                Gestión automatizada de carpetas:
              </strong>
              El sistema agrupa automáticamente los archivos bajo el mismo DNI. Si el paciente ya existe en el sistema, el nuevo documento se anexa a su carpeta clínica sin duplicar expedientes.
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* VISTA C: CREAR Y GESTIONAR USUARIOS */}
        {/* ----------------------------------------------------------------------- */}
        {herramientaActiva === 'usuarios' && (
          <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
            <div style={{ marginBottom: '22px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f2942', margin: '0 0 6px 0' }}>
                Crear y Gestionar Usuarios
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Control de acceso para el personal hospitalario y asignación de roles de seguridad.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '24px', alignItems: 'start' }}>
              {/* Formulario Crear Usuario */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #F6E38F',
                borderRadius: '12px',
                padding: '22px',
                boxShadow: '0 4px 14px rgba(246, 227, 143, 0.25)'
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#634706', margin: '0 0 16px 0', borderBottom: '1px solid #F6E38F', paddingBottom: '8px' }}>
                  Registrar Nuevo Usuario
                </h3>

                <form onSubmit={handleCrearUsuario}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                      NOMBRE DE USUARIO
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: jperalta"
                      value={formUsuario.username}
                      onChange={(e) => setFormUsuario({ ...formUsuario, username: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: '1.5px solid #d1d5db',
                        fontSize: '13px',
                        backgroundColor: '#f8fafc',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#F6E38F'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                      CONTRASEÑA
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={formUsuario.password}
                      onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: '1.5px solid #d1d5db',
                        fontSize: '13px',
                        backgroundColor: '#f8fafc',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#F6E38F'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                      ROL INSTITUCIONAL
                    </label>
                    <select
                      value={formUsuario.rol}
                      onChange={(e) => setFormUsuario({ ...formUsuario, rol: e.target.value })}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: '1.5px solid #d1d5db',
                        fontSize: '13px',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        fontWeight: '600'
                      }}
                    >
                      <option value="Médico">Médico</option>
                      <option value="Recepción">Recepción</option>
                      <option value="Administrador">Administrador</option>
                      <option value="Soporte TI">Soporte TI</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={creandoUsuario}
                    style={{
                      width: '100%',
                      padding: '11px',
                      backgroundColor: creandoUsuario ? '#fef08a' : '#FFF2B6',
                      color: '#634706',
                      border: '1.5px solid #F6E38F',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: creandoUsuario ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 5px rgba(246, 227, 143, 0.4)'
                    }}
                  >
                    {creandoUsuario ? 'Guardando...' : 'Crear Usuario'}
                  </button>
                </form>
              </div>

              {/* Tabla de Usuarios Registrados */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '22px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f2942', margin: 0 }}>
                    Usuarios del Sistema ({usuarios.length})
                  </h3>
                  <button
                    onClick={cargarUsuarios}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      color: '#475569'
                    }}
                  >
                    Actualizar Lista
                  </button>
                </div>

                {cargandoUsuarios ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>Cargando usuarios...</p>
                ) : usuarios.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No hay usuarios registrados.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                          <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>ID</th>
                          <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Usuario</th>
                          <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Rol</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map((u) => {
                          const esAdmin = u.username.toLowerCase() === 'admin'
                          let rolBg = '#CFE7D6'
                          let rolColor = '#134e2b'
                          let rolBorder = '#9ec6ac'
                          if (u.rol === 'Administrador') {
                            rolBg = '#F3C7B6'
                            rolColor = '#70220e'
                            rolBorder = '#e19d85'
                          } else if (u.rol === 'Médico') {
                            rolBg = '#A7C7D9'
                            rolColor = '#0c354e'
                            rolBorder = '#84aabd'
                          } else if (u.rol === 'Soporte TI') {
                            rolBg = '#FFF2B6'
                            rolColor = '#634706'
                            rolBorder = '#F6E38F'
                          }

                          return (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px 10px', color: '#64748b' }}>#{u.id}</td>
                              <td style={{ padding: '8px 10px', fontWeight: '700', color: '#0f2942' }}>
                                {u.username}
                                {esAdmin && (
                                  <span style={{ marginLeft: '6px', fontSize: '10px', color: '#64748b' }}>(Principal)</span>
                                )}
                              </td>
                              <td style={{ padding: '8px 10px' }}>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  backgroundColor: rolBg,
                                  color: rolColor,
                                  border: `1px solid ${rolBorder}`
                                }}>
                                  {u.rol || 'Personal'}
                                </span>
                              </td>
                              <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                {esAdmin ? (
                                  <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Protegido</span>
                                ) : (
                                  <button
                                    onClick={() => handleEliminarUsuario(u.id, u.username)}
                                    style={{
                                      padding: '3px 8px',
                                      backgroundColor: '#F3C7B6',
                                      color: '#70220e',
                                      border: '1px solid #e19d85',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Eliminar
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* VISTA D: CONFIGURACIÓN Y DIAGNÓSTICO DEL SISTEMA */}
        {/* ----------------------------------------------------------------------- */}
        {herramientaActiva === 'configuracion' && (
          <div style={{ maxWidth: '960px', width: '100%', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f2942', margin: '0 0 6px 0' }}>
                  Configuración y Diagnóstico del Sistema
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Monitoreo de estado de servicios, base de datos SQL Server y almacenamiento S3 MinIO.
                </p>
              </div>

              <button
                onClick={cargarDiagnostico}
                disabled={cargandoDiagnostico}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#CFE7D6',
                  color: '#134e2b',
                  border: '1px solid #9ec6ac',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: cargandoDiagnostico ? 'not-allowed' : 'pointer'
                }}
              >
                {cargandoDiagnostico ? 'Verificando...' : 'Recomprobar Conexiones'}
              </button>
            </div>

            {/* Cuadrícula de Diagnósticos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* Tarjeta 1: Base de Datos SQL Server */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #A7C7D9',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 3px 10px rgba(167, 199, 217, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0c354e', margin: 0 }}>
                    Base de Datos SQL Server
                  </h3>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: diagnostico?.base_datos?.estado === 'conectado' ? '#CFE7D6' : '#F3C7B6',
                    color: diagnostico?.base_datos?.estado === 'conectado' ? '#134e2b' : '#70220e',
                    border: `1px solid ${diagnostico?.base_datos?.estado === 'conectado' ? '#9ec6ac' : '#e19d85'}`
                  }}>
                    {diagnostico?.base_datos?.estado === 'conectado' ? 'Operativo' : 'Verificar'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong>Motor:</strong> Microsoft SQL Server</div>
                  <div><strong>Carpetas registradas:</strong> {diagnostico?.base_datos?.total_pacientes ?? pacientes.length}</div>
                  <div><strong>Documentos indexados:</strong> {diagnostico?.base_datos?.total_documentos ?? totalArchivosSistema}</div>
                  <div><strong>Tablas principales:</strong> Paciente, Documento_Escaneado, Usuario</div>
                </div>
              </div>

              {/* Tarjeta 2: Almacenamiento MinIO S3 */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #CFE7D6',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 3px 10px rgba(158, 198, 172, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#134e2b', margin: 0 }}>
                    Almacenamiento S3 MinIO
                  </h3>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: diagnostico?.almacenamiento?.estado === 'conectado' ? '#CFE7D6' : '#F3C7B6',
                    color: diagnostico?.almacenamiento?.estado === 'conectado' ? '#134e2b' : '#70220e',
                    border: `1px solid ${diagnostico?.almacenamiento?.estado === 'conectado' ? '#9ec6ac' : '#e19d85'}`
                  }}>
                    {diagnostico?.almacenamiento?.estado === 'conectado' ? 'Operativo' : 'Verificar'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong>Tipo:</strong> MinIO Object Storage (API S3)</div>
                  <div><strong>Bucket activo:</strong> <code style={{ backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>historias-clinicas</code></div>
                  <div><strong>Disponibilidad de Bucket:</strong> {diagnostico?.almacenamiento?.bucket_disponible ? 'Confirmado' : 'Conectado'}</div>
                  <div><strong>Puerto del servicio:</strong> 9000 (Consola: 9001)</div>
                </div>
              </div>

              {/* Tarjeta 3: Parámetros del Hospital */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #FFF2B6',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 3px 10px rgba(246, 227, 143, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#634706', margin: 0 }}>
                    Entidad Hospitalaria
                  </h3>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: '#FFF2B6',
                    color: '#634706',
                    border: '1px solid #F6E38F'
                  }}>
                    Pisco, Ica
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong>Hospital:</strong> Hospital San Juan de Dios de Pisco</div>
                  <div><strong>Unidad Ejecutora:</strong> UE-404 Salud Pisco</div>
                  <div><strong>Módulo:</strong> Banco de Historias Clínicas</div>
                  <div><strong>Modo de Pantalla:</strong> Fija (100vw x 100vh)</div>
                </div>
              </div>

              {/* Tarjeta 4: Seguridad y Soporte TI */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #F3C7B6',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 3px 10px rgba(243, 199, 182, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#70220e', margin: 0 }}>
                    Seguridad y Soporte
                  </h3>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: '#F3C7B6',
                    color: '#70220e',
                    border: '1px solid #e19d85'
                  }}>
                    Activo
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong>Sesión en uso:</strong> {usuario.username} ({usuario.rol})</div>
                  <div><strong>Cifrado:</strong> Contraseñas con hash seguro Werkzeug</div>
                  <div><strong>Anexo Soporte TI:</strong> 404</div>
                  <div><strong>Contacto:</strong> soporte@hospitalsanjuandediospisco.gob.pe</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. PANEL DERECHO DESPLEGABLE: VISOR DE HISTORIA CLÍNICA / DOCUMENTO */}
      {/* ========================================================================= */}
      {documentoEnVista && (
        <aside style={{
          width: '50%',
          minWidth: '460px',
          maxWidth: '780px',
          height: '100vh',
          backgroundColor: '#ffffff',
          borderLeft: '2px solid #A7C7D9',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-6px 0 25px rgba(0, 0, 0, 0.12)',
          zIndex: 30,
          boxSizing: 'border-box'
        }}>
          {/* Cabecera del Panel Derecho */}
          <div style={{
            padding: '14px 18px',
            borderBottom: '2px solid #A7C7D9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f2f7fa',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {obtenerIconoArchivo(documentoEnVista.nombre_archivo)}
                <h3 style={{
                  margin: 0,
                  fontSize: '15px',
                  color: '#0f2942',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '320px'
                }} title={documentoEnVista.nombre_archivo}>
                  {documentoEnVista.nombre_archivo}
                </h3>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569' }}>
                Carpeta DNI: <strong style={{ color: '#0c354e', backgroundColor: '#CFE7D6', padding: '1px 7px', borderRadius: '4px', border: '1px solid #9ec6ac' }}>{documentoEnVista.paciente_dni || 'Sin DNI'}</strong> | {documentoEnVista.fecha_subida || '—'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <a
                href={`${API_BASE}/documentos/${documentoEnVista.id}/archivo`}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#A7C7D9',
                  color: '#0c354e',
                  border: '1px solid #84aabd',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
                title="Descargar archivo físico"
              >
                Descargar
              </a>
              <button
                onClick={() => setDocumentoEnVista(null)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#F3C7B6',
                  color: '#70220e',
                  border: '1px solid #e19d85',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Cerrar panel visor"
              >
                Cerrar ✕
              </button>
            </div>
          </div>

          {/* Contenedor del Visor */}
          <div style={{
            flex: 1,
            backgroundColor: '#1e293b',
            padding: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
          }}>
            {esPdf(documentoEnVista.nombre_archivo) ? (
              <iframe
                src={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`}
                title={`Visor PDF - ${documentoEnVista.nombre_archivo}`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff'
                }}
              />
            ) : esDocx(documentoEnVista.nombre_archivo) ? (
              <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                <DocxViewer url={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`} />
              </div>
            ) : esImagen(documentoEnVista.nombre_archivo) ? (
              <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
                <img
                  src={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`}
                  alt="Vista previa de documento"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                  }}
                />
              </div>
            ) : esTexto(documentoEnVista.nombre_archivo) ? (
              <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                <TextViewer url={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#f3f4f6', padding: '30px' }}>
                <p style={{ fontSize: '15px', marginBottom: '12px' }}>
                  Este tipo de archivo no admite previsualización directa en el navegador.
                </p>
                <a
                  href={`${API_BASE}/documentos/${documentoEnVista.id}/archivo`}
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    backgroundColor: '#A7C7D9',
                    color: '#0c354e',
                    border: '1px solid #84aabd',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '13px'
                  }}
                >
                  Descargar archivo
                </a>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  )
}