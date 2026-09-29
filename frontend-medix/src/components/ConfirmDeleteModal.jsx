import { useState, useEffect } from 'react'

export default function ConfirmDeleteModal({
  paciente,
  titulo = 'Advertencia',
  pregunta,
  onConfirmar,
  onCancelar
}) {
  // Sincronizar tema con el sistema o permitir alternar
  const [temaOscuro, setTemaOscuro] = useState(() => {
    const saved = localStorage.getItem('medix_sidebar_theme')
    return saved !== null ? saved === 'dark' : false
  })

  useEffect(() => {
    const checkTheme = () => {
      const current = localStorage.getItem('medix_sidebar_theme') === 'dark'
      setTemaOscuro(current)
    }
    window.addEventListener('storage', checkTheme)
    return () => window.removeEventListener('storage', checkTheme)
  }, [])

  if (!paciente) return null

  const dni = paciente.dni || 'Sin DNI'
  const preguntaTexto = pregunta || `¿Desea eliminar la historia clínica del paciente DNI ${dni}?`

  // Paleta de estilos idéntica a las tarjetas de media_1790709317094.png
  const styles = temaOscuro ? {
    overlayBg: 'rgba(5, 8, 15, 0.72)',
    cardBg: '#131722',
    cardBorder: '1px solid #232838',
    cardShadow: '0 24px 50px -10px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    titleColor: '#ffffff',
    textColor: '#94a3b8',
    subtextColor: '#64748b',
    dividerColor: '#232838',
    closeBg: '#202534',
    closeColor: '#8f9cae',
    closeHoverBg: '#2a3144',
    circuloBg: '#7d4ee6', // Purple de la tarjeta Delete Item
    contadorBg: '#653bbd',
    btnEliminarColor: '#a78bfa',
    btnEliminarHoverBg: 'rgba(125, 78, 230, 0.1)',
    btnCancelarColor: '#8f9cae',
    btnCancelarHoverBg: 'rgba(255, 255, 255, 0.04)'
  } : {
    overlayBg: 'rgba(15, 23, 42, 0.55)',
    cardBg: '#ffffff',
    cardBorder: '1px solid #edf1f5',
    cardShadow: '0 20px 40px -8px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)',
    titleColor: '#19202e',
    textColor: '#64748b',
    subtextColor: '#94a3b8',
    dividerColor: '#edf1f5',
    closeBg: '#f1f3f7',
    closeColor: '#6b778c',
    closeHoverBg: '#e2e7ee',
    circuloBg: '#6c42be', // Purple de la tarjeta Delete Item
    contadorBg: '#57339d',
    btnEliminarColor: '#6c42be',
    btnEliminarHoverBg: 'rgba(108, 66, 190, 0.06)',
    btnCancelarColor: '#6b778c',
    btnCancelarHoverBg: 'rgba(0, 0, 0, 0.03)'
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: styles.overlayBg,
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        animation: 'fadeInOverlay 0.18s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancelar()
      }}
    >
      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popInCard {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      {/* Tarjeta de Confirmación con el diseño de media_1790709317094.png */}
      <div
        style={{
          width: '360px',
          maxWidth: 'calc(100vw - 40px)',
          backgroundColor: styles.cardBg,
          border: styles.cardBorder,
          borderRadius: '18px',
          boxShadow: styles.cardShadow,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'popInCard 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* PARTE SUPERIOR: ICONO, TÍTULO, SUBTÍTULO Y BOTÓN DE CIERRE */}
        <div
          style={{
            padding: '20px 20px 16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            position: 'relative'
          }}
        >
          {/* Insignia Circular (Icono papelera con contador 1 idéntica a Delete Item) */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: styles.circuloBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${styles.circuloBg}40`
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>

            {/* Píldora de contador "!" */}
            <div
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                minWidth: '17px',
                height: '17px',
                borderRadius: '9px',
                backgroundColor: styles.contadorBg,
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                border: `2px solid ${styles.cardBg}`,
                boxSizing: 'border-box'
              }}
            >
              !
            </div>
          </div>

          {/* Textos: Título "Advertencia" y Pregunta "¿Desea eliminar?" */}
          <div style={{ flex: 1, minWidth: 0, paddingRight: '22px' }}>
            <h4
              style={{
                margin: '0 0 4px 0',
                fontSize: '16px',
                fontWeight: '700',
                color: styles.titleColor,
                letterSpacing: '-0.2px',
                lineHeight: 1.2
              }}
            >
              {titulo}
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: styles.textColor,
                lineHeight: 1.45,
                fontWeight: '600',
                wordBreak: 'break-word'
              }}
            >
              {preguntaTexto}
            </p>
            <p
              style={{
                margin: '6px 0 0 0',
                fontSize: '11px',
                color: styles.subtextColor,
                lineHeight: 1.35
              }}
            >
              Al continuar, será obligatorio justificar el motivo para la bandeja del Administrador.
            </p>
          </div>

          {/* Botón de Cierre 'X' superior */}
          <button
            onClick={onCancelar}
            title="Cancelar y cerrar"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: styles.closeBg,
              border: 'none',
              color: styles.closeColor,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.closeHoverBg}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = styles.closeBg}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* LÍNEA DIVISORIA HORIZONTAL */}
        <div style={{ height: '1px', backgroundColor: styles.dividerColor }} />

        {/* PARTE INFERIOR: BOTONES DIVIDIDOS 50% / 50% ("Eliminar" y "Cancelar") */}
        <div style={{ display: 'flex', height: '46px', alignItems: 'stretch' }}>
          {/* Botón Eliminar */}
          <button
            onClick={onConfirmar}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              color: styles.btnEliminarColor,
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '0.2px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.btnEliminarHoverBg}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Eliminar
          </button>

          {/* Divisor Vertical */}
          <div style={{ width: '1px', backgroundColor: styles.dividerColor }} />

          {/* Botón Cancelar */}
          <button
            onClick={onCancelar}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              color: styles.btnCancelarColor,
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.btnCancelarHoverBg}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
