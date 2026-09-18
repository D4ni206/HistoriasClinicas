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
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      zIndex: 9999,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1140px',
        height: 'min(620px, 90vh)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: '40px'
      }}>
        {/* PANEL IZQUIERDO: Tarjeta Amarilla Institucional */}
        <div style={{
          flex: '1.2 1 0',
          minWidth: 0,
          height: '100%',
          backgroundColor: '#FEF7A7',
          borderRadius: '32px',
          padding: '36px 42px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 10px 30px rgba(220, 190, 80, 0.12)'
        }}>
          {/* Cabecera: Logo y Nombre del Hospital */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <img
              src="/logo_hospital.png"
              alt="Hospital San Juan de Dios de Pisco"
              style={{
                height: '60px',
                width: 'auto',
                objectFit: 'contain',
                mixBlendMode: 'multiply'
              }}
            />
            <span style={{
              fontSize: '18px',
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
          <div style={{ margin: 'auto 0', padding: '20px 0' }}>
            <h1 style={{
              fontSize: 'clamp(28px, 3.8vw, 54px)',
              fontWeight: '900',
              lineHeight: '1.05',
              color: '#D28A4A',
              margin: '0 0 18px 0',
              textTransform: 'uppercase',
              letterSpacing: '-1px'
            }}>
              BANCO DE<br />
              HISTORIAS<br />
              CLINICAS
            </h1>

            <p style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '1.45',
              color: '#8A8765',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              maxWidth: '440px'
            }}>
              SISTEMA QUE AYUDA A VER HISTORIAS CLINICAS, DE FORMA RAPIDA Y SEGURA
            </p>
          </div>

          {/* Pie del Panel Izquierdo */}
          <div>
            <span style={{
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '13px',
              color: '#262626'
            }}>
              Reduce tiempo de busqueda manual
            </span>
          </div>
        </div>

        {/* PANEL DERECHO: Formulario de Iniciar Sesión */}
        <div style={{
          flex: '1 1 0',
          minWidth: '320px',
          maxWidth: '420px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px 12px',
          boxSizing: 'border-box'
        }}>
          {/* Contenedor del Formulario centrado */}
          <div style={{
            maxWidth: '360px',
            width: '100%',
            margin: 'auto auto'
          }}>
            {/* Título y subtítulo */}
            <h2 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#000000',
              margin: '0 0 6px 0',
              letterSpacing: '-0.5px'
            }}>
              Iniciar sesion
            </h2>
            <p style={{
              margin: '0 0 28px 0',
              fontSize: '14px',
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
                    height: '48px',
                    backgroundColor: '#D9D9D9',
                    border: '2px solid #E5B458',
                    borderRadius: '24px',
                    padding: '0 20px',
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
                      height: '48px',
                      backgroundColor: '#D9D9D9',
                      border: '2px solid #E5B458',
                      borderRadius: '24px',
                      padding: '0 54px 0 20px',
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
                  height: '50px',
                  backgroundColor: cargando ? '#e3b874' : '#DDA757',
                  color: '#111111',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: cargando ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(221, 167, 87, 0.35)',
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
            fontSize: '12px',
            color: '#52525b',
            marginTop: '32px'
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
      <header style={{ marginBottom: '24px', borderBottom: '2px solid #A7C7D9', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src="/logo_hospital.png"
              alt="Hospital San Juan de Dios de Pisco"
              style={{
                height: '56px',
                width: 'auto',
                objectFit: 'contain',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '4px 8px',
                border: '1.5px solid #A7C7D9',
                boxShadow: '0 2px 6px rgba(167, 199, 217, 0.3)'
              }}
            />
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f2942', margin: '0 0 3px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Medix</span>
                <span style={{ fontSize: '16px', fontWeight: '500', color: '#4b5563' }}>| Expedientes Clínicos Digitales</span>
              </h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
                Hospital San Juan de Dios de Pisco · UE-404
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#A7C7D9', color: '#0c354e', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', border: '1px solid #84aabd' }}>
              Carpetas: {pacientes.length}
            </span>
            <span style={{ backgroundColor: '#CFE7D6', color: '#134e2b', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', border: '1px solid #9ec6ac' }}>
              Documentos: {totalArchivosSistema}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px', paddingLeft: '8px', borderLeft: '2px solid #A7C7D9' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#634706', backgroundColor: '#FFF2B6', padding: '6px 12px', borderRadius: '8px', border: '1px solid #F6E38F' }}>
                Usuario: {usuario.username} ({usuario.rol || 'Personal'})
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('medix_usuario')
                  setUsuario(null)
                }}
                style={{
                  backgroundColor: '#F3C7B6',
                  color: '#70220e',
                  border: '1px solid #e19d85',
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
          backgroundColor: mensaje.tipo === 'exito' ? '#CFE7D6' : '#F3C7B6',
          color: mensaje.tipo === 'exito' ? '#134e2b' : '#70220e',
          border: `1px solid ${mensaje.tipo === 'exito' ? '#9ec6ac' : '#e19d85'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontWeight: '600' }}>{mensaje.texto}</span>
          <button onClick={() => setMensaje({ tipo: '', texto: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'inherit' }}>X</button>
        </div>
      )}

      {/* Panel de Subida con Detección Automática de Carpeta */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #A7C7D9',
        borderRadius: '12px',
        padding: '22px',
        marginBottom: '28px',
        boxShadow: '0 4px 12px rgba(167, 199, 217, 0.2)'
      }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 14px 0', color: '#0f2942', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  border: '1.5px solid #d1d5db',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#A7C7D9'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
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
                  border: '1.5px solid #d1d5db',
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
                backgroundColor: subiendo ? '#d5e4ec' : '#A7C7D9',
                color: '#0c354e',
                border: '1px solid #84aabd',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: subiendo ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                boxShadow: '0 2px 6px rgba(167, 199, 217, 0.35)'
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
                  backgroundColor: '#CFE7D6',
                  border: '1px solid #9ec6ac',
                  color: '#134e2b',
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
                  backgroundColor: '#FFF2B6',
                  border: '1px solid #F6E38F',
                  color: '#634706',
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
              border: '1.5px solid #A7C7D9',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              outline: 'none'
            }}
          />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '11px' }}>
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
              backgroundColor: '#CFE7D6',
              border: '1px solid #9ec6ac',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              color: '#134e2b'
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
                  border: estaAbierta ? '2px solid #A7C7D9' : '1px solid #e5e7eb',
                  borderRadius: '10px',
                  boxShadow: estaAbierta ? '0 4px 14px rgba(167, 199, 217, 0.25)' : '0 1px 3px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Cabecera de la Carpeta */}
                <div
                  style={{
                    padding: '14px 18px',
                    backgroundColor: estaAbierta ? '#f2f7fa' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    borderBottom: estaAbierta ? '1.5px solid #A7C7D9' : 'none',
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
                      backgroundColor: estaAbierta ? '#A7C7D9' : '#e5e7eb',
                      color: estaAbierta ? '#0c354e' : '#4b5563',
                      border: estaAbierta ? '1px solid #84aabd' : '1px solid #d1d5db',
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '17px', fontWeight: '800', color: '#0f2942' }}>
                            DNI: {pac.dni}
                          </span>
                          <span style={{
                            backgroundColor: docs.length > 0 ? '#CFE7D6' : '#F3C7B6',
                            color: docs.length > 0 ? '#134e2b' : '#70220e',
                            border: docs.length > 0 ? '1px solid #9ec6ac' : '1px solid #e19d85',
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
                        padding: '6px 14px',
                        backgroundColor: '#A7C7D9',
                        color: '#0c354e',
                        border: '1px solid #84aabd',
                        borderRadius: '6px',
                        fontSize: '12px',
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
                          padding: '6px 10px',
                          backgroundColor: '#FFF2B6',
                          border: '1px solid #F6E38F',
                          borderRadius: '6px',
                          fontSize: '12px',
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
                        padding: '6px 10px',
                        backgroundColor: '#F3C7B6',
                        border: '1px solid #e19d85',
                        borderRadius: '6px',
                        fontSize: '12px',
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
                        backgroundColor: '#FFF2B6',
                        borderRadius: '8px',
                        border: '1px dashed #F6E38F',
                        color: '#634706'
                      }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600' }}>
                          Esta carpeta no contiene documentos actualmente.
                        </p>
                        <button
                          onClick={() => agregarArchivoACarpeta(pac.dni, pac.id)}
                          style={{
                            padding: '7px 16px',
                            backgroundColor: '#A7C7D9',
                            color: '#0c354e',
                            border: '1px solid #84aabd',
                            borderRadius: '6px',
                            fontSize: '13px',
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
                              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700' }}>Tipo</th>
                              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700' }}>Nombre del Archivo</th>
                              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700' }}>Fecha de Subida</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '700' }}>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {docs.map((doc) => (
                              <tr key={doc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '10px 14px' }}>
                                  {obtenerIconoArchivo(doc.nombre_archivo)}
                                </td>
                                <td style={{ padding: '10px 14px', fontWeight: '600', color: '#0f2942' }}>
                                  {doc.nombre_archivo}
                                </td>
                                <td style={{ padding: '10px 14px', color: '#475569' }}>
                                  {doc.fecha_subida || '—'}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', gap: '8px' }}>
                                  <button
                                    onClick={() => setDocumentoEnVista(doc)}
                                    style={{
                                      padding: '5px 12px',
                                      backgroundColor: '#CFE7D6',
                                      color: '#134e2b',
                                      border: '1px solid #9ec6ac',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      fontWeight: '700',
                                      cursor: 'pointer'
                                    }}
                                    title="Vista previa en panel"
                                  >
                                    Ver
                                  </button>

                                  <a
                                    href={`${API_BASE}/documentos/${doc.id}/archivo`}
                                    style={{
                                      padding: '5px 12px',
                                      backgroundColor: '#A7C7D9',
                                      color: '#0c354e',
                                      border: '1px solid #84aabd',
                                      borderRadius: '6px',
                                      textDecoration: 'none',
                                      fontSize: '12px',
                                      fontWeight: '700'
                                    }}
                                    title="Descargar copia física"
                                  >
                                    Descargar
                                  </a>

                                  <button
                                    onClick={() => handleEliminarDocumento(doc.id, doc.nombre_archivo, pac.id)}
                                    style={{
                                      padding: '5px 12px',
                                      backgroundColor: '#F3C7B6',
                                      color: '#70220e',
                                      border: '1px solid #e19d85',
                                      borderRadius: '6px',
                                      fontSize: '12px',
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
              border: '2px solid #A7C7D9',
              overflow: 'hidden'
            }}
          >
            {/* Cabecera del Panel */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '2px solid #A7C7D9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f2f7fa'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#0f2942', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{obtenerIconoArchivo(documentoEnVista.nombre_archivo)}</span>
                  <span>{documentoEnVista.nombre_archivo}</span>
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#475569' }}>
                  Carpeta DNI: <strong style={{ color: '#0c354e', backgroundColor: '#CFE7D6', padding: '2px 8px', borderRadius: '4px', border: '1px solid #9ec6ac' }}>{documentoEnVista.paciente_dni || 'Sin DNI'}</strong> | Subido el: {documentoEnVista.fecha_subida || '—'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={`${API_BASE}/documentos/${documentoEnVista.id}/archivo`}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#A7C7D9',
                    color: '#0c354e',
                    border: '1px solid #84aabd',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '700'
                  }}
                  title="Descargar archivo físico"
                >
                  Descargar
                </a>
                <button
                  onClick={() => setDocumentoEnVista(null)}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#F3C7B6',
                    color: '#70220e',
                    border: '1px solid #e19d85',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '700'
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
                      backgroundColor: '#A7C7D9',
                      color: '#0c354e',
                      border: '1px solid #84aabd',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: '700'
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