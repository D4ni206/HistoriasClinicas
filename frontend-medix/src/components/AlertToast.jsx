import { useState, useEffect } from 'react'

export default function AlertToast({ alerta, onClose }) {
  // Estado local para alternar modo claro y oscuro directamente desde la alerta o sincronizado con el sistema
  const [temaOscuro, setTemaOscuro] = useState(() => {
    const saved = localStorage.getItem('medix_sidebar_theme')
    return saved !== null ? saved === 'dark' : false
  })

  // Sincronizar con cambios en localStorage si el sidebar cambia de tema
  useEffect(() => {
    const checkTheme = () => {
      const current = localStorage.getItem('medix_sidebar_theme') === 'dark'
      setTemaOscuro(current)
    }
    window.addEventListener('storage', checkTheme)
    return () => window.removeEventListener('storage', checkTheme)
  }, [])

  if (!alerta || !alerta.texto) return null

  // Normalizar tipo de alerta
  const tipo = (alerta.tipo || 'info').toLowerCase()

  // Mapeo de configuraciones visuales idénticas a la imagen de referencia (media_1790709317094.png)
  let config = {
    tituloPorDefecto: 'New Message',
    circuloBg: temaOscuro ? '#2b76e8' : '#1d68d8', // Blue
    contadorBg: temaOscuro ? '#1e5fbe' : '#1756b5',
    contadorTexto: alerta.contador || '2',
    accionTexto: alerta.actionLabel || 'View',
    accionColor: temaOscuro ? '#3b82f6' : '#1d68d8',
    secundarioTexto: alerta.secondaryLabel || 'Close',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    )
  }

  // 1. ÉXITO (Paciente creado exitosamente) -> Verde
  if (tipo === 'exito' || tipo === 'success') {
    config = {
      tituloPorDefecto: 'Success',
      circuloBg: temaOscuro ? '#26aa5e' : '#1e9e54', // Green
      contadorBg: temaOscuro ? '#1d874a' : '#178044',
      contadorTexto: alerta.contador || '1',
      accionTexto: alerta.actionLabel || 'Okay',
      accionColor: temaOscuro ? '#34d399' : '#1e9e54',
      secundarioTexto: alerta.secondaryLabel || 'Close',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )
    }
  }
  // 2. ADVERTENCIA / ALERGIAS / CONTENIDO SENSIBLE -> Ámbar / Dorado (Reminder en la imagen)
  else if (tipo === 'alergia' || tipo === 'advertencia' || tipo === 'warning' || tipo === 'reminder') {
    config = {
      tituloPorDefecto: 'Reminder',
      circuloBg: temaOscuro ? '#e5961d' : '#df8813', // Amber / Gold
      contadorBg: temaOscuro ? '#b87514' : '#ba6f0d',
      contadorTexto: alerta.contador || '2',
      accionTexto: alerta.actionLabel || 'Got it',
      accionColor: temaOscuro ? '#fbbf24' : '#df8813',
      secundarioTexto: alerta.secondaryLabel || 'Close',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      )
    }
  }
  // 3. ELIMINACIÓN DE HISTORIA CLÍNICA -> Morado / Violeta (Delete Item en la imagen)
  else if (tipo === 'eliminacion' || tipo === 'delete' || tipo === 'papelera') {
    config = {
      tituloPorDefecto: 'Delete Item',
      circuloBg: temaOscuro ? '#7d4ee6' : '#6c42be', // Purple
      contadorBg: temaOscuro ? '#653bbd' : '#57339d',
      contadorTexto: alerta.contador || '1',
      accionTexto: alerta.actionLabel || 'Delete',
      accionColor: temaOscuro ? '#a78bfa' : '#6c42be',
      secundarioTexto: alerta.secondaryLabel || 'Cancel',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      )
    }
  }
  // 4. ERROR -> Rojo octagonal con signo de exclamación
  else if (tipo === 'error' || tipo === 'danger') {
    config = {
      tituloPorDefecto: 'Error',
      circuloBg: temaOscuro ? '#e34444' : '#dc3545', // Red
      contadorBg: temaOscuro ? '#b92b2b' : '#b32231',
      contadorTexto: alerta.contador || '1',
      accionTexto: alerta.actionLabel || 'Retry',
      accionColor: temaOscuro ? '#f87171' : '#dc3545',
      secundarioTexto: alerta.secondaryLabel || 'Close',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      )
    }
  }
  // 5. DESCARGA -> Verde azulado / Teal
  else if (tipo === 'descarga' || tipo === 'download') {
    config = {
      tituloPorDefecto: 'Download',
      circuloBg: temaOscuro ? '#00b5ab' : '#00a299', // Teal
      contadorBg: temaOscuro ? '#008e86' : '#007f78',
      contadorTexto: alerta.contador || '1',
      accionTexto: alerta.actionLabel || 'Download',
      accionColor: temaOscuro ? '#2dd4bf' : '#00a299',
      secundarioTexto: alerta.secondaryLabel || 'Close',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      )
    }
  }

  const titulo = alerta.titulo || config.tituloPorDefecto

  // Paleta dinámica según Modo Claro o Modo Oscuro idéntica a la imagen
  const styles = temaOscuro ? {
    cardBg: '#131722',
    cardBorder: '1px solid #232838',
    cardShadow: '0 20px 44px -10px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    titleColor: '#ffffff',
    textColor: '#8f9cae',
    dividerColor: '#232838',
    closeBg: '#202534',
    closeColor: '#8f9cae',
    closeHoverBg: '#2a3144',
    btnSecColor: '#8f9cae',
    btnSecHoverBg: 'rgba(255, 255, 255, 0.04)',
    btnPrimaryHoverBg: 'rgba(255, 255, 255, 0.04)'
  } : {
    cardBg: '#ffffff',
    cardBorder: '1px solid #edf1f5',
    cardShadow: '0 16px 36px -6px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
    titleColor: '#19202e',
    textColor: '#6b778c',
    dividerColor: '#edf1f5',
    closeBg: '#f1f3f7',
    closeColor: '#6b778c',
    closeHoverBg: '#e2e7ee',
    btnSecColor: '#6b778c',
    btnSecHoverBg: 'rgba(0, 0, 0, 0.03)',
    btnPrimaryHoverBg: 'rgba(0, 0, 0, 0.03)'
  }

  const handleActionClick = () => {
    if (alerta.onAction) {
      alerta.onAction()
    }
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '28px',
        zIndex: 10000,
        width: '330px',
        maxWidth: 'calc(100vw - 40px)',
        backgroundColor: styles.cardBg,
        border: styles.cardBorder,
        borderRadius: '18px',
        boxShadow: styles.cardShadow,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(32px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>

      {/* ÁREA SUPERIOR: ICONO, TEXTOS Y BOTÓN DE CIERRE */}
      <div
        style={{
          padding: '18px 18px 16px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          position: 'relative'
        }}
      >
        {/* Insignia Circular con Icono y Badge de Conteo idéntico al diseño */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: config.circuloBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${config.circuloBg}40`
            }}
          >
            {config.icon}
          </div>

          {/* Pequeña píldora de conteo superior derecha (1, 2, etc.) */}
          {config.contadorTexto && (
            <div
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                minWidth: '17px',
                height: '17px',
                borderRadius: '9px',
                backgroundColor: config.contadorBg,
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
              {config.contadorTexto}
            </div>
          )}
        </div>

        {/* Textos: Título y Mensaje */}
        <div style={{ flex: 1, minWidth: 0, paddingRight: '24px' }}>
          <h4
            style={{
              margin: '0 0 4px 0',
              fontSize: '15px',
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
              fontSize: '12.5px',
              color: styles.textColor,
              lineHeight: 1.45,
              fontWeight: '500',
              wordBreak: 'break-word'
            }}
          >
            {alerta.texto}
          </p>
        </div>

        {/* Botón superior derecho: 'X' para cerrar + toggle de tema sutil */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          {/* Botón de alternar Tema Claro / Oscuro directamente en la alerta */}
          <button
            onClick={() => setTemaOscuro(!temaOscuro)}
            title={temaOscuro ? "Cambiar alerta a Modo Claro" : "Cambiar alerta a Modo Oscuro"}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              border: 'none',
              color: styles.closeColor,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              fontSize: '12px',
              opacity: 0.75,
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.75'}
          >
            {temaOscuro ? '☀' : '🌙'}
          </button>

          {/* Botón de Cierre 'X' circular */}
          <button
            onClick={onClose}
            title="Cerrar notificación"
            style={{
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
      </div>

      {/* LÍNEA DIVISORIA HORIZONTAL */}
      <div style={{ height: '1px', backgroundColor: styles.dividerColor }} />

      {/* ÁREA INFERIOR: BOTONES DE ACCIÓN (50% / 50% con divisor vertical) */}
      <div style={{ display: 'flex', height: '44px', alignItems: 'stretch' }}>
        {/* Botón Primario (Okay, Got it, Delete, Retry, View, Download) */}
        <button
          onClick={handleActionClick}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            color: config.accionColor,
            fontSize: '13.5px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.btnPrimaryHoverBg}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {config.accionTexto}
        </button>

        {/* Divisor Vertical */}
        <div style={{ width: '1px', backgroundColor: styles.dividerColor }} />

        {/* Botón Secundario (Close / Cancel) */}
        <button
          onClick={onClose}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            color: styles.btnSecColor,
            fontSize: '13.5px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.btnSecHoverBg}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {config.secundarioTexto}
        </button>
      </div>
    </div>
  )
}
