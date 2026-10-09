import { useState, useEffect } from 'react'
import { API_BASE } from '../api/config'
import logoHospital from '../assets/logo-login.png'
import loginDoctorImg from '../assets/login-doctor-clean.png'
import bgHospital from '../assets/img.png'

export default function LoginView({ onLoginSuccess }) {
  // Modalidad de la vista: 'login' | 'signup' | 'recuperar_sms'
  const [modo, setModo] = useState('login')

  // Estado para LOGIN (credenciales privadas, vacías por defecto)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')

  // Estado para SIGN UP / REGISTRO
  const [formRegistro, setFormRegistro] = useState({
    nombres_completos: '',
    correo: '',
    telefono: '',
    rol: 'Médico General',
    username: '',
    password: ''
  })
  const [registroExitoso, setRegistroExitoso] = useState(null)

  // Estado para RECUPERAR CONTRASEÑA POR SMS
  const [identificadorSms, setIdentificadorSms] = useState('')
  const [pasoSms, setPasoSms] = useState(1) // 1: Pedir código, 2: Ingresar código y nueva clave
  const [smsEnviadoInfo, setSmsEnviadoInfo] = useState(null)
  const [codigoSmsIngresado, setCodigoSmsIngresado] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false)

  // Responsividad: Detección de pantallas móviles / pequeñas
  const [esMovil, setEsMovil] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 840 : false)

  useEffect(() => {
    const handleResize = () => setEsMovil(window.innerWidth < 840)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Lista de especialidades médicas predeterminadas
  const rolesEspecialidades = [
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

  // Generador dinámico de sugerencia de usuario y contraseña para Sign Up
  const generarSugerencias = (correo, nombres) => {
    let userSugerido = ''
    if (correo && correo.includes('@')) {
      userSugerido = correo.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
    } else if (nombres) {
      const partes = nombres.trim().toLowerCase().split(' ')
      userSugerido = partes[0].replace(/[^a-z0-9]/g, '')
      if (partes.length > 1) {
        userSugerido += partes[1][0]
      }
    }
    return userSugerido
  }

  // 1. Manejador de INICIO DE SESIÓN
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const u = username.trim()
    const p = password.trim()
    if (!u || !p) {
      setError('Por favor complete todos los campos')
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
        setError(data.mensaje || 'The username or password is incorrect')
      }
    } catch (err) {
      setError('Error de conexión con el backend de Medix.')
    } finally {
      setCargando(false)
    }
  }

  // 2. Manejador de SIGN UP (Registro con creación automática de usuario y clave)
  const handleRegistroSubmit = async (e) => {
    e.preventDefault()
    if (!formRegistro.nombres_completos.trim() || !formRegistro.correo.trim() || !formRegistro.telefono.trim()) {
      setError('Nombres completos, correo y teléfono son obligatorios')
      return
    }

    // Auto-generar username y contraseña si el usuario no los personalizó
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
          password: data.credenciales?.password || finalPassword,
          telefono: formRegistro.telefono
        })
      } else {
        setError(data.mensaje || 'Error al crear la cuenta.')
      }
    } catch (err) {
      setError('Error de conexión con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  // 3. Manejador de SOLICITAR SMS DE RECUPERACIÓN
  const handleSolicitarSms = async (e) => {
    e.preventDefault()
    const id = identificadorSms.trim()
    if (!id) {
      setError('Por favor ingrese su usuario, teléfono o correo')
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
        // Autocompletar código simulado en campo si se desea o mostrar notificación
        if (data.codigo_simulado) {
          setCodigoSmsIngresado(data.codigo_simulado)
        }
      } else {
        setError(data.mensaje || 'No se pudo enviar el código SMS.')
      }
    } catch (err) {
      setError('Error de conexión con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  // 4. Manejador de CONFIRMAR SMS Y NUEVA CONTRASEÑA
  const handleConfirmarSms = async (e) => {
    e.preventDefault()
    if (!codigoSmsIngresado.trim() || !nuevaPassword.trim()) {
      setError('Ingrese el código SMS y su nueva contraseña')
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
        setMensajeExito(data.mensaje || '¡Contraseña restablecida con éxito!')
        setUsername(smsEnviadoInfo?.username || '')
        setPassword(nuevaPassword.trim())
        // Volver al login
        setModo('login')
        setPasoSms(1)
        setSmsEnviadoInfo(null)
      } else {
        setError(data.mensaje || 'Código SMS inválido o expirado.')
      }
    } catch (err) {
      setError('Error de conexión con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        zIndex: 9999
      }}
    >
      {/* 1. FOTOGRAFÍA INSTITUCIONAL DEL HOSPITAL SAN JUAN DE DIOS CON EFECTO BLUR */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          left: '-30px',
          right: '-30px',
          bottom: '-30px',
          backgroundImage: `url(${bgHospital})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(10px) brightness(0.85)',
          transform: 'scale(1.05)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      {/* 2. CAPA TRANSLÚCIDA CON CONTRASTE SUAVE Y REFRACCIÓN */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.35)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      {/* TARJETA PRINCIPAL DEL LOGIN (En primer plano encima del fondo) */}
      <div
        style={{
          width: esMovil ? '92vw' : '1020px',
          maxWidth: esMovil ? '480px' : '95vw',
          maxHeight: esMovil ? '92vh' : undefined,
          minHeight: esMovil ? 'auto' : '560px',
          backgroundColor: '#ffffff',
          borderRadius: esMovil ? '24px' : '34px',
          boxShadow: '0 30px 80px -10px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: esMovil ? 'column' : 'row',
          overflow: esMovil ? 'auto' : 'hidden',
          position: 'relative',
          zIndex: 10,
          pointerEvents: 'auto',
          margin: '0 auto'
        }}
      >
        {/* ============================================================== */}
        {/* PANEL IZQUIERDO: Ilustración 3D del Doctor y Saludo HELLO !   */}
        {/* ============================================================== */}
        <div
          style={{
            flex: esMovil ? 'none' : '1 1 48%',
            height: esMovil ? '140px' : undefined,
            minHeight: esMovil ? '140px' : '560px',
            position: 'relative',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            overflow: 'hidden'
          }}
        >
          {/* Ilustración de fondo con doctor 3D */}
          <img
            src={loginDoctorImg}
            alt="Doctor 3D Ilustración"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: esMovil ? '100%' : '113%',
              height: '100%',
              objectFit: esMovil ? 'cover' : 'fill',
              zIndex: 5,
              pointerEvents: 'none'
            }}
          />

          {/* Textos sobre la ilustración: HELLO ! y Subtítulo dinámico */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              padding: esMovil ? '16px 20px' : 'clamp(36px, 5vh, 52px) clamp(30px, 4vw, 48px)',
              maxWidth: '300px'
            }}
          >
            <h1
              style={{
                fontSize: esMovil ? '24px' : 'clamp(36px, 4vw, 46px)',
                fontWeight: '900',
                color: '#1e293b',
                margin: esMovil ? '0 0 2px 0' : '0 0 14px 0',
                letterSpacing: '-0.5px',
                lineHeight: 1.1
              }}
            >
              HELLO <span style={{ color: '#10b981' }}>!</span>
            </h1>

            <p
              style={{
                fontSize: esMovil ? '12px' : '15px',
                color: '#64748b',
                lineHeight: '1.35',
                margin: '0 0 4px 0',
                fontWeight: '500'
              }}
            >
              {modo === 'signup'
                ? 'Create your account to start'
                : modo === 'recuperar_sms'
                ? 'SMS password recovery'
                : 'Please enter your details to continue'}
            </p>

            {!esMovil && (
              <p
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  lineHeight: '1.4',
                  margin: 0,
                  fontWeight: '600'
                }}
              >
                Hospital San Juan de Dios · Pisco
              </p>
            )}
          </div>
        </div>

        {/* LÍNEA DIVISORIA SUTIL */}
        {!esMovil && (
          <div
            style={{
              width: '1px',
              backgroundColor: '#edf2f7',
              zIndex: 4
            }}
          />
        )}

        {/* ============================================================== */}
        {/* PANEL DERECHO: Formulario según el modo (Login, Sign Up, SMS) */}
        {/* ============================================================== */}
        <div
          style={{
            flex: esMovil ? 'none' : '1 1 52%',
            width: '100%',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: esMovil ? '24px 18px' : 'clamp(24px, 3vh, 40px) clamp(22px, 3.5vw, 48px)',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 6,
            overflowY: 'auto',
            maxHeight: esMovil ? 'none' : '90vh'
          }}
        >
          {/* Anillos decorativos en esquina superior derecha */}
          <div
            style={{
              position: 'absolute',
              top: '18px',
              right: '22px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '6px solid #bbf7d0',
              opacity: 0.65,
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '44px',
              right: '50px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              border: '4px solid #fed7aa',
              opacity: 0.65,
              pointerEvents: 'none'
            }}
          />

          {/* Contenedor del Formulario Activo */}
          <div style={{ width: '100%', maxWidth: '360px' }}>
            {/* Cabecera institucional: LOGO Hospital */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '22px'
              }}
            >
              <img
                src={logoHospital}
                alt="Logo Hospital"
                onError={(e) => {
                  if (e.currentTarget.src !== '/logo_hospital.png') {
                    e.currentTarget.src = '/logo_hospital.png'
                  }
                }}
                style={{
                  height: '36px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
              <div style={{ fontSize: '23px', letterSpacing: '-0.3px', userSelect: 'none' }}>
                <strong style={{ color: '#10b981', fontWeight: '800' }}>LOGO</strong>{' '}
                <span style={{ color: '#334155', fontWeight: '600' }}>Hospital</span>
              </div>
            </div>

            {/* Mensaje de Éxito Global */}
            {mensajeExito && (
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}
              >
                {mensajeExito}
              </div>
            )}

            {/* Mensaje de Error Global */}
            {error && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  marginBottom: '14px',
                  textAlign: 'center'
                }}
              >
                {error}
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* VISTA 1: FORMULARIO DE INICIO DE SESIÓN (LOGIN)              */}
            {/* ------------------------------------------------------------ */}
            {modo === 'login' && (
              <form onSubmit={handleLoginSubmit}>
                {/* CAMPO: Username or E-mail */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '6px'
                    }}
                  >
                    Username or E-mail
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      if (error) setError('')
                    }}
                    placeholder="Aya_99@gmail.com"
                    required
                    style={{
                      width: '100%',
                      height: '42px',
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '9px',
                      padding: '0 14px',
                      fontSize: '14px',
                      color: '#1e293b',
                      outline: 'none',
                      boxSizing: 'border-box',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6'
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.12)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0'
                      e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)'
                    }}
                  />
                </div>

                {/* CAMPO: Password con ver/ocultar */}
                <div style={{ marginBottom: '6px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '6px'
                    }}
                  >
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={mostrarPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (error) setError('')
                      }}
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%',
                        height: '42px',
                        backgroundColor: '#ffffff',
                        border: error ? '1.5px solid #f87171' : '1.5px solid #e2e8f0',
                        borderRadius: '9px',
                        padding: '0 42px 0 14px',
                        fontSize: '14px',
                        color: '#1e293b',
                        outline: 'none',
                        boxSizing: 'border-box',
                        boxShadow: error ? '0 0 0 3px rgba(248, 113, 113, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.04)'
                      }}
                      onFocus={(e) => {
                        if (!error) {
                          e.target.style.borderColor = '#3b82f6'
                          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.12)'
                        }
                      }}
                      onBlur={(e) => {
                        if (!error) {
                          e.target.style.borderColor = '#e2e8f0'
                          e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    />

                    {/* Botón Ver/Ocultar contraseña */}
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      title={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {mostrarPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* BOTÓN: Log in (Píldora azul como en la imagen) */}
                <div style={{ textAlign: 'center', marginTop: '22px', marginBottom: '20px' }}>
                  <button
                    type="submit"
                    disabled={cargando}
                    style={{
                      minWidth: '170px',
                      height: '42px',
                      padding: '0 28px',
                      background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '9999px',
                      fontSize: '14.5px',
                      fontWeight: '700',
                      cursor: cargando ? 'not-allowed' : 'pointer',
                      boxShadow: '0 6px 18px rgba(59, 130, 246, 0.38)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      opacity: cargando ? 0.75 : 1
                    }}
                  >
                    {cargando ? 'Logging in...' : 'Log in'}
                  </button>
                </div>

                {/* ENLACES: Forget Password? y Do Not Have Account? Sign Up */}
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a
                    href="#recuperar"
                    onClick={(e) => {
                      e.preventDefault()
                      setError('')
                      setMensajeExito('')
                      setModo('recuperar_sms')
                    }}
                    style={{
                      fontSize: '12.5px',
                      color: '#10b981',
                      textDecoration: 'none',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Forget Password?
                  </a>

                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                    Do Not Have Account?{' '}
                    <span
                      onClick={() => {
                        setError('')
                        setMensajeExito('')
                        setRegistroExitoso(null)
                        setModo('signup')
                      }}
                      style={{
                        color: '#10b981',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Sign Up
                    </span>
                  </div>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------ */}
            {/* VISTA 2: FORMULARIO DE SIGN UP (CREAR CUENTA AUTOMÁTICA)      */}
            {/* ------------------------------------------------------------ */}
            {modo === 'signup' && (
              <div>
                {registroExitoso ? (
                  /* Tarjeta de Confirmación de Cuenta Creada */
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #a7f3d0',
                      borderRadius: '14px',
                      padding: '18px',
                      textAlign: 'center',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15)'
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#065f46', margin: '0 0 6px 0' }}>
                      ¡Cuenta Creada Exitosamente!
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#4b5563', margin: '0 0 14px 0' }}>
                      Hola <strong>{registroExitoso.nombres}</strong>, su usuario y contraseña han sido generados:
                    </p>

                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', marginBottom: '14px', textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', color: '#047857', marginBottom: '4px' }}>
                        Usuario: <strong style={{ color: '#0f172a', fontSize: '13px' }}>{registroExitoso.username}</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#047857', marginBottom: '4px' }}>
                        Contraseña: <strong style={{ color: '#0f172a', fontSize: '13px' }}>{registroExitoso.password}</strong>
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        📱 Teléfono para SMS: <strong>{registroExitoso.telefono}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setUsername(registroExitoso.username)
                        setPassword(registroExitoso.password)
                        setRegistroExitoso(null)
                        setModo('login')
                      }}
                      style={{
                        width: '100%',
                        height: '40px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '9999px',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                      }}
                    >
                      Iniciar Sesión Ahora
                    </button>
                  </div>
                ) : (
                  /* Formulario de Registro de Datos */
                  <form onSubmit={handleRegistroSubmit}>
                    <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>
                        Registro de Personal Clínico
                      </span>
                    </div>

                    {/* Nombres Completos */}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                        Nombres Completos *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Dra. María Fernanda Morales"
                        value={formRegistro.nombres_completos}
                        onChange={(e) => setFormRegistro({ ...formRegistro, nombres_completos: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          height: '38px',
                          backgroundColor: '#ffffff',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0 12px',
                          fontSize: '13px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Correo Electrónico */}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        placeholder="Ej: maria.morales@hospitalpisco.gob.pe"
                        value={formRegistro.correo}
                        onChange={(e) => setFormRegistro({ ...formRegistro, correo: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          height: '38px',
                          backgroundColor: '#ffffff',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0 12px',
                          fontSize: '13px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Teléfono */}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#0369a1', marginBottom: '4px' }}>
                        Número de Teléfono (Para SMS) *
                      </label>
                      <input
                        type="tel"
                        placeholder="Ej: 956123456"
                        value={formRegistro.telefono}
                        onChange={(e) => setFormRegistro({ ...formRegistro, telefono: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          height: '38px',
                          backgroundColor: '#f0f9ff',
                          border: '1.5px solid #7FD6FF',
                          borderRadius: '8px',
                          padding: '0 12px',
                          fontSize: '13px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Rol / Especialidad con opciones predeterminadas */}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                        Rol / Especialidad *
                      </label>
                      <select
                        value={formRegistro.rol}
                        onChange={(e) => setFormRegistro({ ...formRegistro, rol: e.target.value })}
                        style={{
                          width: '100%',
                          height: '38px',
                          backgroundColor: '#ffffff',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0 10px',
                          fontSize: '13px',
                          outline: 'none',
                          fontWeight: '600',
                          color: '#1e293b'
                        }}
                      >
                        {rolesEspecialidades.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    {/* Previsualización del Usuario y Clave que se le generarán */}
                    <div
                      style={{
                        backgroundColor: '#f1f5f9',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        marginBottom: '16px',
                        fontSize: '11px',
                        color: '#475569'
                      }}
                    >
                      <span>💡 <strong>Autogeneración:</strong> Con su correo o número se le creará automáticamente su usuario y contraseña segura al pulsar Registrarse.</span>
                    </div>

                    {/* Botón de Enviar Registro */}
                    <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                      <button
                        type="submit"
                        disabled={cargando}
                        style={{
                          width: '100%',
                          height: '42px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '9999px',
                          fontSize: '14px',
                          fontWeight: '700',
                          cursor: cargando ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                        }}
                      >
                        {cargando ? 'Creando cuenta...' : 'Sign Up / Registrarme'}
                      </button>
                    </div>

                    {/* Volver a Login */}
                    <div style={{ textAlign: 'center' }}>
                      <span
                        onClick={() => {
                          setError('')
                          setModo('login')
                        }}
                        style={{
                          fontSize: '12.5px',
                          color: '#3b82f6',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ← Volver a Iniciar Sesión (Log in)
                      </span>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* VISTA 3: RECUPERACIÓN DE CONTRASEÑA POR SMS                 */}
            {/* ------------------------------------------------------------ */}
            {modo === 'recuperar_sms' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                  <div style={{ fontSize: '26px', marginBottom: '4px' }}>📱</div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>
                    Recuperación por SMS
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    {pasoSms === 1
                      ? 'Ingrese su usuario, teléfono o correo para enviarle un código SMS.'
                      : `Código enviado al teléfono ${smsEnviadoInfo?.telefono_ofuscado}. Ingrese el código y su nueva clave.`}
                  </p>
                </div>

                {/* Notificación Simulada de SMS Entrante */}
                {smsEnviadoInfo && (
                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      border: '1.5px solid #bfdbfe',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      marginBottom: '14px',
                      fontSize: '12px',
                      color: '#1e40af'
                    }}
                  >
                    <strong>📱 [SMS Hospital Pisco]:</strong> Tu código de verificación Medix es{' '}
                    <strong style={{ fontSize: '14px', color: '#1d4ed8' }}>{smsEnviadoInfo.codigo_simulado}</strong>
                  </div>
                )}

                {/* PASO 1: Solicitar código */}
                {pasoSms === 1 && (
                  <form onSubmit={handleSolicitarSms}>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                        Usuario, Teléfono o Correo
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: admin o 956123456"
                        value={identificadorSms}
                        onChange={(e) => {
                          setIdentificadorSms(e.target.value)
                          if (error) setError('')
                        }}
                        required
                        style={{
                          width: '100%',
                          height: '42px',
                          backgroundColor: '#ffffff',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0 12px',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                      <button
                        type="submit"
                        disabled={cargando}
                        style={{
                          width: '100%',
                          height: '42px',
                          background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '9999px',
                          fontSize: '14px',
                          fontWeight: '700',
                          cursor: cargando ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
                        }}
                      >
                        {cargando ? 'Enviando SMS...' : 'Enviar Código SMS'}
                      </button>
                    </div>
                  </form>
                )}

                {/* PASO 2: Ingresar código y nueva contraseña */}
                {pasoSms === 2 && (
                  <form onSubmit={handleConfirmarSms}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                        Código de Verificación SMS (6 dígitos) *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: 742918"
                        value={codigoSmsIngresado}
                        onChange={(e) => setCodigoSmsIngresado(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          height: '40px',
                          backgroundColor: '#ffffff',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0 12px',
                          fontSize: '14px',
                          fontWeight: '700',
                          letterSpacing: '2px',
                          textAlign: 'center',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                        Nueva Contraseña *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={mostrarNuevaPassword ? 'text' : 'password'}
                          placeholder="Ingrese su nueva clave"
                          value={nuevaPassword}
                          onChange={(e) => setNuevaPassword(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            height: '40px',
                            backgroundColor: '#ffffff',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '0 38px 0 12px',
                            fontSize: '13.5px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarNuevaPassword(!mostrarNuevaPassword)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer'
                          }}
                        >
                          {mostrarNuevaPassword ? '👁' : '🔒'}
                        </button>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                      <button
                        type="submit"
                        disabled={cargando}
                        style={{
                          width: '100%',
                          height: '42px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '9999px',
                          fontSize: '14px',
                          fontWeight: '700',
                          cursor: cargando ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                        }}
                      >
                        {cargando ? 'Actualizando...' : 'Restablecer Contraseña'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Enlace para volver al Login */}
                <div style={{ textAlign: 'center' }}>
                  <span
                    onClick={() => {
                      setError('')
                      setPasoSms(1)
                      setSmsEnviadoInfo(null)
                      setModo('login')
                    }}
                    style={{
                      fontSize: '12.5px',
                      color: '#3b82f6',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ← Volver a Iniciar Sesión (Log in)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
