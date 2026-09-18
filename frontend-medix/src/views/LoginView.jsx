import { useState } from 'react'
import { API_BASE } from '../api/config'

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
