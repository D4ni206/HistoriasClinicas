import { useState } from 'react'
import { API_BASE } from '../api/config'
import logoHospital from '../assets/logo-login.png'

export default function LoginView({ onLoginSuccess }) {
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
      backgroundColor: '#FFF6FB',
      display: 'flex',
      flexDirection: 'row',
      overflow: 'hidden',
      zIndex: 9999,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* PANEL IZQUIERDO: Tarjeta Institucional que llena la mitad izquierda */}
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
          backgroundColor: '#7FD6FF',
          borderRadius: '36px',
          padding: 'clamp(32px, 5vh, 60px) clamp(36px, 5vw, 68px)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 10px 35px rgba(127, 214, 255, 0.3)'
        }}>
          {/* Cabecera: Logo y Nombre del Hospital */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px'
          }}>
            <img
              src={logoHospital}
              alt="Hospital San Juan de Dios de Pisco"
              onError={(e) => {
                if (e.currentTarget.src !== '/logo_hospital.png') {
                  e.currentTarget.src = '/logo_hospital.png'
                }
              }}
              style={{
                height: '68px',
                width: 'auto',
                objectFit: 'contain',
                backgroundColor: '#ffffff',
                padding: '4px 8px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(43, 74, 102, 0.15)'
              }}
            />
            <span style={{
              fontSize: 'clamp(17px, 1.8vw, 22px)',
              fontWeight: '900',
              fontStyle: 'italic',
              letterSpacing: '-0.3px',
              color: '#2B4A66',
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
              color: '#2B4A66',
              margin: '0 0 22px 0',
              textTransform: 'uppercase',
              letterSpacing: '-1px'
            }}>
              BANCO DE<br />
              HISTORIAS
              CLINICAS
            </h1>

            <p style={{
              margin: 0,
              fontSize: 'clamp(13px, 1.2vw, 16px)',
              fontWeight: '600',
              lineHeight: '1.45',
              color: '#104060',
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
              color: '#2B4A66',
              fontWeight: '600'
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
        backgroundColor: '#FFF6FB',
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
            color: '#2B4A66',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            Iniciar sesion
          </h2>
          <p style={{
            margin: '0 0 32px 0',
            fontSize: '15px',
            color: '#64748b'
          }}>
            Bienvenido, ingrese sus credenciales
          </p>

          {/* Error banner si falla el login */}
          {error && (
            <div style={{
              padding: '10px 16px',
              borderRadius: '16px',
              backgroundColor: '#FFD6E8',
              color: '#802048',
              border: '1px solid #f4a7c7',
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
                color: '#2B4A66',
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
                  backgroundColor: '#ffffff',
                  border: '2px solid #7FD6FF',
                  borderRadius: '25px',
                  padding: '0 22px',
                  fontSize: '15px',
                  color: '#2B4A66',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, background-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2B4A66'}
                onBlur={(e) => e.target.style.borderColor = '#7FD6FF'}
              />
            </div>

            {/* Campo CONTRASEÑA */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: '#2B4A66',
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
                    backgroundColor: '#ffffff',
                    border: '2px solid #7FD6FF',
                    borderRadius: '25px',
                    padding: '0 54px 0 22px',
                    fontSize: '15px',
                    color: '#2B4A66',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, background-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2B4A66'}
                  onBlur={(e) => e.target.style.borderColor = '#7FD6FF'}
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
                    color: '#64748b',
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
                  color: '#802048',
                  textDecoration: 'none',
                  fontWeight: '600'
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
                backgroundColor: cargando ? '#bbf7d0' : '#6FE3B4',
                color: '#0a5438',
                border: '1.5px solid #4cc799',
                borderRadius: '26px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: cargando ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(111, 227, 180, 0.4)',
                transition: 'background-color 0.2s, transform 0.1s'
              }}
            >
              {cargando ? 'Accediendo...' : 'Acceder al sistema'}
            </button>
          </form>

          {/* Ayuda de acceso institucional */}
          <div style={{
            marginTop: '20px',
            padding: '10px 14px',
            backgroundColor: '#FFD6E8',
            borderRadius: '16px',
            fontSize: '12px',
            color: '#802048',
            textAlign: 'center',
            border: '1px solid #f4a7c7'
          }}>
            Acceso institucional: <strong>admin</strong> / <strong>admin123</strong>
          </div>
        </div>

        {/* Pie del Panel Derecho */}
        <div style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#64748b',
          marginTop: 'auto',
          paddingTop: '20px'
        }}>
          Acceso restringido al personal autorizado{' '}
          <span
            onClick={() => alert('Contacto Soporte TI:\nAnexo: 404\nEmail: soporte@hospitalsanjuandediospisco.gob.pe')}
            style={{
              color: '#2B4A66',
              fontWeight: '700',
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
