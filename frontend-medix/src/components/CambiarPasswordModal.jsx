import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function CambiarPasswordModal({ onCerrar, notificar }) {
  const { cambiarPassword, debeCambiarPassword, usuario } = useAuth()
  const { theme, temaOscuro } = useTheme()

  const [passwordActual, setPasswordActual] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [mostrarPasswords, setMostrarPasswords] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorLocal, setErrorLocal] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorLocal('')

    if (!nuevaPassword) {
      setErrorLocal('La nueva contraseña no puede estar vacía.')
      return
    }

    if (nuevaPassword.length < 6) {
      setErrorLocal('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (nuevaPassword !== confirmarPassword) {
      setErrorLocal('Las contraseñas ingresadas no coinciden.')
      return
    }

    if (!debeCambiarPassword && !passwordActual) {
      setErrorLocal('Debe ingresar su contraseña actual.')
      return
    }

    setCargando(true)
    try {
      const data = await cambiarPassword(passwordActual, nuevaPassword)
      if (notificar) {
        notificar({
          tipo: 'exito',
          titulo: '¡Contraseña Actualizada!',
          texto: data.mensaje || 'Sus credenciales han sido actualizadas con éxito.',
          actionLabel: 'Entendido'
        })
      }
      if (onCerrar) onCerrar()
    } catch (err) {
      setErrorLocal(err.message || 'Error al actualizar contraseña')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.75)',
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 150,
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: theme.bgCard,
        border: theme.border,
        borderRadius: '18px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: theme.shadowCard,
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Cabecera */}
        <div style={{
          padding: '20px 24px',
          borderBottom: theme.border,
          backgroundColor: theme.bgSubtle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: debeCambiarPassword
                ? (temaOscuro ? '#451a03' : '#fef3c7')
                : (temaOscuro ? '#082f49' : '#e0f2fe'),
              color: debeCambiarPassword
                ? (temaOscuro ? '#fbbf24' : '#d97706')
                : (temaOscuro ? '#38bdf8' : '#0284c7'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              {debeCambiarPassword ? '⚠️' : '🔒'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: theme.textMain }}>
                {debeCambiarPassword ? 'Cambio Obligatorio de Credenciales' : 'Cambiar Contraseña'}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: theme.textMuted }}>
                Usuario: <strong>{usuario?.username}</strong>
              </p>
            </div>
          </div>

          {!debeCambiarPassword && (
            <button
              onClick={onCerrar}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.textMuted,
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px 8px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px' }}>
          {debeCambiarPassword && (
            <div style={{
              backgroundColor: temaOscuro ? '#451a03' : '#fffbeb',
              border: `1px solid ${temaOscuro ? '#78350f' : '#fde68a'}`,
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '18px',
              fontSize: '12.5px',
              color: temaOscuro ? '#fde68a' : '#92400e',
              lineHeight: '1.45'
            }}>
              <strong>Aviso de Seguridad:</strong> Ha iniciado sesión con la clave por defecto de fábrica. Para proteger los expedientes médicos del hospital, es necesario configurar una nueva contraseña personal.
            </div>
          )}

          {errorLocal && (
            <div style={{
              backgroundColor: temaOscuro ? '#3b121e' : '#fef2f2',
              border: `1px solid ${temaOscuro ? '#881337' : '#fecaca'}`,
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '16px',
              fontSize: '12.5px',
              color: temaOscuro ? '#fca5a5' : '#b91c1c'
            }}>
              {errorLocal}
            </div>
          )}

          {!debeCambiarPassword && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: theme.textMain, marginBottom: '6px' }}>
                Contraseña Actual
              </label>
              <input
                type={mostrarPasswords ? 'text' : 'password'}
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderInput}`,
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  fontSize: '13px'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: theme.textMain, marginBottom: '6px' }}>
              Nueva Contraseña <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type={mostrarPasswords ? 'text' : 'password'}
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres seguros"
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${theme.borderInput}`,
                backgroundColor: theme.bgInput,
                color: theme.textMain,
                fontSize: '13px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: theme.textMain, marginBottom: '6px' }}>
              Confirmar Nueva Contraseña <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type={mostrarPasswords ? 'text' : 'password'}
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              placeholder="Repite la nueva contraseña"
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${theme.borderInput}`,
                backgroundColor: theme.bgInput,
                color: theme.textMain,
                fontSize: '13px'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
            <input
              type="checkbox"
              id="show-passwords-toggle"
              checked={mostrarPasswords}
              onChange={(e) => setMostrarPasswords(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="show-passwords-toggle" style={{ fontSize: '12px', color: theme.textSecondary, cursor: 'pointer' }}>
              Mostrar contraseñas
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            {!debeCambiarPassword && (
              <button
                type="button"
                onClick={onCerrar}
                disabled={cargando}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: theme.border,
                  backgroundColor: theme.bgSubtle,
                  color: theme.textMain,
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={cargando}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: theme.primaryBtnBg,
                color: theme.primaryBtnColor,
                fontSize: '13px',
                fontWeight: '700',
                cursor: cargando ? 'not-allowed' : 'pointer',
                opacity: cargando ? 0.7 : 1,
                boxShadow: theme.shadowCard
              }}
            >
              {cargando ? 'Guardando...' : 'Guardar Nueva Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
