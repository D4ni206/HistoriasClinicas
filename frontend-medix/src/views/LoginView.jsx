import { useState } from 'react'
import { API_BASE } from '../api/config'
import logoHospital from '../assets/logo-login.png'
import bgHospital from '../assets/img.png'

const ROLES_ESPECIALIDADES = [
  'Médico General',
  'Pediatra',
  'Cardiólogo',
  'Ginecólogo',
  'Cirujano',
  'Traumatólogo',
  'Neurólogo',
  'Anestesiólogo',
  'Enfermera',
  'Administrador',
  'Recepción / Admisión'
]

function generarSugerencias(correo, nombres) {
  let userSugerido = ''
  if (correo && correo.includes('@')) {
    userSugerido = correo.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
  } else if (nombres) {
    const partes = nombres.trim().toLowerCase().split(' ')
    userSugerido = partes[0].replace(/[^a-z0-9]/g, '')
    if (partes.length > 1) userSugerido += partes[1][0]
  }
  return userSugerido
}

export default function LoginView({ onLoginSuccess }) {
  const [modo, setModo] = useState('login') // 'login' | 'signup' | 'recuperar_sms'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')

  const [formRegistro, setFormRegistro] = useState({
    nombres_completos: '',
    correo: '',
    telefono: '',
    rol: 'Médico General',
    username: '',
    password: ''
  })
  const [registroExitoso, setRegistroExitoso] = useState(null)

  const [identificadorSms, setIdentificadorSms] = useState('')
  const [pasoSms, setPasoSms] = useState(1)
  const [smsEnviadoInfo, setSmsEnviadoInfo] = useState(null)
  const [codigoSmsIngresado, setCodigoSmsIngresado] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const u = username.trim()
    const p = password.trim()
    if (!u || !p) {
      setError('Por favor complete usuario y contraseña.')
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
        localStorage.setItem('medix_token', data.token)
        localStorage.setItem('medix_usuario', JSON.stringify(data.usuario))
        if (data.debe_cambiar_password) {
          localStorage.setItem('medix_cambiar_pwd', 'true')
        } else {
          localStorage.removeItem('medix_cambiar_pwd')
        }
        onLoginSuccess(data.usuario, data)
      } else {
        setError(data.mensaje || 'Usuario o contraseña incorrectos.')
      }
    } catch {
      setError('Error de conexión con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  const handleRegistroSubmit = async (e) => {
    e.preventDefault()
    if (!formRegistro.nombres_completos.trim() || !formRegistro.correo.trim() || !formRegistro.telefono.trim()) {
      setError('Nombres completos, correo y teléfono son obligatorios.')
      return
    }

    const finalUsername = formRegistro.username.trim() || generarSugerencias(formRegistro.correo, formRegistro.nombres_completos)
    const finalPassword = formRegistro.password.trim() || `Medix${Math.floor(100 + Math.random() * 900)}*`

    setCargando(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formRegistro,
          username: finalUsername,
          password: finalPassword
        })
      })
      const data = await res.json()
      if (res.ok) {
        setRegistroExitoso({
          nombres: formRegistro.nombres_completos,
          username: data.credenciales?.username || finalUsername,
          password: data.credenciales?.password || finalPassword
        })
      } else {
        setError(data.mensaje || 'Error al crear la cuenta.')
      }
    } catch {
      setError('Error de conexión con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  const handleSolicitarSms = async (e) => {
    e.preventDefault()
    const id = identificadorSms.trim()
    if (!id) {
      setError('Ingrese su usuario, teléfono o correo.')
      return
    }

    setCargando(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/auth/recuperar-sms/solicitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identificador: id })
      })
      const data = await res.json()
      if (res.ok) {
        setSmsEnviadoInfo(data)
        setPasoSms(2)
        if (data.codigo_simulado) {
          setCodigoSmsIngresado(data.codigo_simulado)
        }
      } else {
        setError(data.mensaje || 'No se pudo enviar el código de verificación.')
      }
    } catch {
      setError('Error de conexión con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  const handleConfirmarSms = async (e) => {
    e.preventDefault()
    if (!codigoSmsIngresado.trim() || !nuevaPassword.trim()) {
      setError('Ingrese el código de verificación y la nueva contraseña.')
      return
    }

    setCargando(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/auth/recuperar-sms/confirmar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: smsEnviadoInfo?.usuario_id,
          username: smsEnviadoInfo?.username,
          codigo: codigoSmsIngresado.trim(),
          nueva_password: nuevaPassword.trim()
        })
      })
      const data = await res.json()
      if (res.ok) {
        setMensajeExito(data.mensaje || 'Contraseña restablecida correctamente.')
        setUsername(smsEnviadoInfo?.username || '')
        setPassword(nuevaPassword.trim())
        setModo('login')
        setPasoSms(1)
        setSmsEnviadoInfo(null)
      } else {
        setError(data.mensaje || 'Código inválido o expirado.')
      }
    } catch {
      setError('Error de conexión con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  const inputStyle = {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid #D9DEE5',
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#1F2937',
    marginBottom: '6px'
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: `url(${bgHospital})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}
    >
      {/* Capa azul oscura al 80% sobre la foto del hospital */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 37, 69, 0.80)',
          pointerEvents: 'none'
        }}
      />

      {/* Tarjeta blanca centrada */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D9DEE5',
          borderRadius: '10px',
          padding: '28px 26px',
          boxShadow: '0 4px 16px rgba(11, 37, 69, 0.25)',
          boxSizing: 'border-box'
        }}
      >
        {/* Encabezado institucional con logo */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <img
            src={logoHospital}
            alt="Logo Hospital San Juan de Dios de Pisco"
            style={{ width: '56px', height: '56px', objectFit: 'contain', marginBottom: '10px' }}
          />
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0B2545', margin: 0 }}>
            Medix
          </h1>
          <p style={{ fontSize: '14px', color: '#5B6675', marginTop: '4px' }}>
            Hospital San Juan de Dios de Pisco
          </p>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: '#FEF3F2',
              color: '#B42318',
              border: '1px solid #FECDCA',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '16px'
            }}
          >
            {error}
          </div>
        )}

        {mensajeExito && (
          <div
            style={{
              backgroundColor: '#ECFDF3',
              color: '#067647',
              border: '1px solid #ABEFC6',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '16px'
            }}
          >
            {mensajeExito}
          </div>
        )}

        {/* MODO 1: INICIO DE SESIÓN */}
        {modo === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="login-username" style={labelStyle}>
                Usuario o correo electrónico
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su usuario"
                autoComplete="username"
                style={inputStyle}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="login-password" style={{ ...labelStyle, marginBottom: 0 }}>
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setMostrarPassword(prev => !prev)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1D5C96',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {mostrarPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                id="login-password"
                type={mostrarPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              style={{
                width: '100%',
                height: '42px',
                backgroundColor: '#1D5C96',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: cargando ? 'not-allowed' : 'pointer',
                marginTop: '4px'
              }}
            >
              {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #D9DEE5' }}>
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setMensajeExito('')
                  setModo('recuperar_sms')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#5B6675',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('')
                  setMensajeExito('')
                  setRegistroExitoso(null)
                  setModo('signup')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1D5C96',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Solicitar cuenta
              </button>
            </div>
          </form>
        )}

        {/* MODO 2: REGISTRO DE PERSONAL */}
        {modo === 'signup' && (
          <div>
            {registroExitoso ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#ECFDF3', border: '1px solid #ABEFC6', fontSize: '12px', color: '#067647' }}>
                  <strong>Cuenta creada para {registroExitoso.nombres}</strong>
                  <div style={{ marginTop: '6px' }}>Usuario: <strong>{registroExitoso.username}</strong></div>
                  <div>Contraseña: <strong>{registroExitoso.password}</strong></div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUsername(registroExitoso.username)
                    setPassword(registroExitoso.password)
                    setModo('login')
                  }}
                  style={{
                    width: '100%',
                    height: '40px',
                    backgroundColor: '#1D5C96',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Ir a iniciar sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegistroSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label htmlFor="reg-nombres" style={labelStyle}>Nombres completos</label>
                  <input
                    id="reg-nombres"
                    type="text"
                    value={formRegistro.nombres_completos}
                    onChange={(e) => setFormRegistro({ ...formRegistro, nombres_completos: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="reg-correo" style={labelStyle}>Correo electrónico</label>
                  <input
                    id="reg-correo"
                    type="email"
                    value={formRegistro.correo}
                    onChange={(e) => setFormRegistro({ ...formRegistro, correo: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label htmlFor="reg-telefono" style={labelStyle}>Teléfono</label>
                    <input
                      id="reg-telefono"
                      type="text"
                      value={formRegistro.telefono}
                      onChange={(e) => setFormRegistro({ ...formRegistro, telefono: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-rol" style={labelStyle}>Especialidad / Rol</label>
                    <select
                      id="reg-rol"
                      value={formRegistro.rol}
                      onChange={(e) => setFormRegistro({ ...formRegistro, rol: e.target.value })}
                      style={inputStyle}
                    >
                      {ROLES_ESPECIALIDADES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={cargando}
                  style={{
                    width: '100%',
                    height: '40px',
                    backgroundColor: '#1D5C96',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  {cargando ? 'Registrando...' : 'Registrar usuario'}
                </button>
                <button
                  type="button"
                  onClick={() => setModo('login')}
                  style={{
                    width: '100%',
                    height: '36px',
                    backgroundColor: '#F4F6F9',
                    color: '#1F2937',
                    border: '1px solid #D9DEE5',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Volver al inicio de sesión
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODO 3: RECUPERACIÓN DE CONTRASEÑA */}
        {modo === 'recuperar_sms' && (
          <div>
            {pasoSms === 1 ? (
              <form onSubmit={handleSolicitarSms} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label htmlFor="sms-identificador" style={labelStyle}>
                    Usuario, correo o teléfono registrado
                  </label>
                  <input
                    id="sms-identificador"
                    type="text"
                    value={identificadorSms}
                    onChange={(e) => setIdentificadorSms(e.target.value)}
                    placeholder="Ej. admin o correo institucional"
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  disabled={cargando}
                  style={{
                    width: '100%',
                    height: '40px',
                    backgroundColor: '#1D5C96',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {cargando ? 'Enviando...' : 'Enviar código de verificación'}
                </button>
                <button
                  type="button"
                  onClick={() => setModo('login')}
                  style={{
                    width: '100%',
                    height: '36px',
                    backgroundColor: '#F4F6F9',
                    color: '#1F2937',
                    border: '1px solid #D9DEE5',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmarSms} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {smsEnviadoInfo?.codigo_simulado && (
                  <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: '#F4F6F9', border: '1px solid #D9DEE5', fontSize: '12px', color: '#1F2937' }}>
                    Código generado: <strong>{smsEnviadoInfo.codigo_simulado}</strong>
                  </div>
                )}
                <div>
                  <label htmlFor="sms-codigo" style={labelStyle}>Código de verificación</label>
                  <input
                    id="sms-codigo"
                    type="text"
                    value={codigoSmsIngresado}
                    onChange={(e) => setCodigoSmsIngresado(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="sms-nueva-clave" style={labelStyle}>Nueva contraseña</label>
                  <input
                    id="sms-nueva-clave"
                    type="password"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  disabled={cargando}
                  style={{
                    width: '100%',
                    height: '40px',
                    backgroundColor: '#1D5C96',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {cargando ? 'Actualizando...' : 'Confirmar nueva contraseña'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
