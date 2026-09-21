import { useState, useMemo } from 'react'
import { analizarPaciente } from '../utils/symptomAnalyzer'

export default function ManiquiAnatomico({
  paciente,
  documentoActual = null,
  modoCompacto = false,
  onSeleccionarZona = null
}) {
  const [zonaHover, setZonaHover] = useState(null)

  // Análisis clínico del paciente
  const analisis = useMemo(() => {
    return analizarPaciente(paciente, documentoActual)
  }, [paciente, documentoActual])

  const { zonasActivas, tarjetasIzq, tarjetasDer, ultimoSigno, totalAfecciones } = analisis

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1.5px solid #7FD6FF',
      boxShadow: '0 8px 24px rgba(43, 74, 102, 0.08)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxSizing: 'border-box',
      overflowY: 'auto',
      color: '#2B4A66',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Estilos CSS para los anillos concéntricos de radar */}
      <style>{`
        @keyframes radar-pulse-blue {
          0% { transform: scale(0.6); opacity: 0.9; }
          50% { transform: scale(1.5); opacity: 0.4; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes radar-pulse-pink {
          0% { transform: scale(0.6); opacity: 0.9; }
          50% { transform: scale(1.5); opacity: 0.4; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .radar-pulse-anim-blue {
          animation: radar-pulse-blue 2.3s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }
        .radar-pulse-anim-pink {
          animation: radar-pulse-pink 2.3s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 0.7s;
        }
      `}</style>

      {/* 1. CABECERA: HEALTH AND PREVENTION / INFOGRAFÍA CLÍNICA */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1.5px solid #eef2f6',
        paddingBottom: '10px',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div>
          <div style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#0284c7',
            letterSpacing: '0.6px',
            textTransform: 'uppercase'
          }}>
            Evaluación Gráfica del Paciente
          </div>
          <h2 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: '900', color: '#2B4A66', letterSpacing: '-0.3px' }}>
            Maniquí Anatómico de Síntomas
          </h2>
          <p style={{ margin: '3px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
            Expediente Clínico · DNI: <strong style={{ color: '#0a5438', backgroundColor: '#6FE3B4', padding: '1px 6px', borderRadius: '4px' }}>{analisis.pacienteDni}</strong>
          </p>
        </div>

        {/* Badge de Alerta o Normalidad */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            backgroundColor: totalAfecciones > 0 ? '#FFD6E8' : '#6FE3B4',
            color: totalAfecciones > 0 ? '#802048' : '#0a5438',
            padding: '5px 12px',
            borderRadius: '12px',
            border: totalAfecciones > 0 ? '1px solid #f4a7c7' : '1px solid #4cc799'
          }}>
            {totalAfecciones > 0 ? `${totalAfecciones} Hallazgo(s) Clínico(s)` : 'Chequeo Clínico Estable'}
          </span>
        </div>
      </div>

      {/* 2. ÁREA PRINCIPAL: INFOGRAFÍA CENTRAL (3 COLUMNAS: TARJETAS AZULES - SILUETA MANIQUÍ - TARJETAS MAGENTA) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(140px, 1.15fr) minmax(180px, 1.35fr) minmax(140px, 1.15fr)',
        gap: '12px',
        alignItems: 'center',
        flex: '1 0 auto'
      }}>

        {/* COLUMNA IZQUIERDA: 4 TARJETAS AZULES (A: Cerebro, B: Hígado, C: Pulmones, D: Estómago) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tarjetasIzq.map((t) => (
            <TarjetaOrgano key={t.id} tarjeta={t} enHover={zonaHover === t.id} />
          ))}
        </div>

        {/* COLUMNA CENTRAL: SILUETA ANATÓMICA VECTORIAL CON RADARES CONCÉNTRICOS */}
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4px 0',
          minHeight: '390px'
        }}>
          {/* 4 Líneas guía horizontales punteadas como en la infografía original */}
          <div style={{ position: 'absolute', top: '16%', left: '2%', right: '2%', borderTop: '1.5px dashed #cbd5e1', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '38%', left: '2%', right: '2%', borderTop: '1.5px dashed #cbd5e1', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '56%', left: '2%', right: '2%', borderTop: '1.5px dashed #cbd5e1', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '78%', left: '2%', right: '2%', borderTop: '1.5px dashed #cbd5e1', pointerEvents: 'none' }} />

          {/* Silueta Humana Vectorial Médica */}
          <svg
            viewBox="0 0 200 420"
            style={{
              width: '100%',
              maxWidth: '220px',
              height: '390px',
              filter: 'drop-shadow(0 4px 12px rgba(43, 74, 102, 0.12))'
            }}
          >
            {/* Contorno anatómico neutral */}
            <path
              d="
                M 100 20
                C 112 20, 118 28, 118 42
                C 118 56, 112 65, 106 68
                L 108 76
                C 126 80, 142 90, 144 115
                L 142 165
                C 142 178, 137 195, 134 205
                L 128 205
                L 132 165
                L 128 135
                C 126 150, 126 175, 128 210
                C 128 230, 125 245, 120 255
                L 124 330
                C 124 350, 122 375, 120 395
                C 120 405, 115 408, 108 408
                C 103 408, 101 404, 102 395
                L 104 330
                L 103 260
                L 100 260
                L 97 260
                L 96 330
                L 98 395
                C 99 404, 97 408, 92 408
                C 85 408, 80 405, 80 395
                C 78 375, 76 350, 76 330
                L 80 255
                C 75 245, 72 230, 72 210
                C 74 175, 74 150, 72 135
                L 68 165
                L 72 205
                L 66 205
                C 63 195, 58 178, 58 165
                L 56 115
                C 58 90, 74 80, 92 76
                L 94 68
                C 88 65, 82 56, 82 42
                C 82 28, 88 20, 100 20
                Z
              "
              fill="#e2e8f0"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>

          {/* PUNTOS CALIENTES CON RADARES CONCÉNTRICOS PULSANTES */}
          {zonasActivas.map((z) => {
            const esRosa = z.color === '#e11d48'
            const colorPrincipal = esRosa ? '#e11d48' : '#0284c7'
            const colorAnillo = esRosa ? 'rgba(225, 29, 72, 0.35)' : 'rgba(2, 132, 199, 0.35)'
            const claseAnim = esRosa ? 'radar-pulse-anim-pink' : 'radar-pulse-anim-blue'

            return (
              <div
                key={z.id}
                style={{
                  position: 'absolute',
                  left: `${z.x}%`,
                  top: `${z.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: 10
                }}
                onMouseEnter={() => setZonaHover(z.id)}
                onMouseLeave={() => setZonaHover(null)}
                onClick={() => onSeleccionarZona && onSeleccionarZona(z)}
                title={`${z.organo}: ${z.hallazgo}`}
              >
                {/* Anillo de radar exterior 1 */}
                <div
                  className={claseAnim}
                  style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '-18px',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: colorAnillo,
                    pointerEvents: 'none'
                  }}
                />

                {/* Anillo de radar medio 2 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '-10px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: `1.5px solid ${colorPrincipal}`,
                    opacity: 0.65,
                    pointerEvents: 'none'
                  }}
                />

                {/* Núcleo central pulsante */}
                <div
                  style={{
                    width: '13px',
                    height: '13px',
                    borderRadius: '50%',
                    backgroundColor: colorPrincipal,
                    boxShadow: `0 0 10px ${colorPrincipal}`,
                    border: '2px solid #ffffff'
                  }}
                />

                {/* Tooltip flotante */}
                {zonaHover === z.id && (
                  <div style={{
                    position: 'absolute',
                    bottom: '26px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#2B4A66',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                    zIndex: 30,
                    pointerEvents: 'none'
                  }}>
                    <div style={{ fontWeight: '800', color: esRosa ? '#FFD6E8' : '#7FD6FF' }}>
                      {z.organo} · Letra {z.letra}
                    </div>
                    <div style={{ fontSize: '10.5px' }}>{z.hallazgo}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* COLUMNA DERECHA: 4 TARJETAS MAGENTA (A: Corazón, B: Articulaciones, C: Intestinos, D: Huesos) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tarjetasDer.map((t) => (
            <TarjetaOrgano key={t.id} tarjeta={t} enHover={zonaHover === t.id} />
          ))}
        </div>

      </div>

      {/* 3. PANEL INFERIOR DE TELEMETRÍA CLÍNICA (IDÉNTICO AL PANEL DERECHO DE LA INFOGRAFÍA) */}
      <div style={{
        marginTop: '12px',
        padding: '12px 14px',
        backgroundColor: '#FFF6FB',
        border: '1.5px solid #7FD6FF',
        borderRadius: '12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        alignItems: 'center'
      }}>
        {/* Signos Vitales con Barra de Progreso */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#2B4A66', textTransform: 'uppercase' }}>
            Telemetría de Signos Vitales
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: '#64748b' }}>Presión Arterial:</span>
            <strong style={{ color: '#e11d48' }}>{ultimoSigno?.presion_arterial || '120/80 mmHg'}</strong>
          </div>
          <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '75%', height: '100%', backgroundColor: '#e11d48', borderRadius: '3px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
            <span style={{ color: '#64748b' }}>Frecuencia Cardíaca:</span>
            <strong style={{ color: '#0284c7' }}>{ultimoSigno?.frecuencia_cardiaca ? `${ultimoSigno.frecuencia_cardiaca} lpm` : '72 lpm'}</strong>
          </div>
          <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '68%', height: '100%', backgroundColor: '#0284c7', borderRadius: '3px' }} />
          </div>
        </div>

        {/* Matriz de Puntos de Estado (Estilo Infografía de Referencia) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#2B4A66', textTransform: 'uppercase' }}>
            Nivel de Estabilidad Corporal
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
            <span style={{ width: '30px', fontWeight: '700', color: '#e11d48' }}>85%</span>
            <MatrizPuntos porcentaje={85} color="#e11d48" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
            <span style={{ width: '30px', fontWeight: '700', color: '#0284c7' }}>96%</span>
            <MatrizPuntos porcentaje={96} color="#0284c7" />
          </div>
        </div>

        {/* Onda Gráfica de Pulso Clínico */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#2B4A66', textTransform: 'uppercase' }}>
            Curva de Pulso y Saturación
          </div>
          <svg viewBox="0 0 160 40" style={{ width: '100%', height: '36px' }}>
            <path
              d="M 0 35 Q 20 5, 40 25 T 80 15 T 120 30 T 160 10 L 160 40 L 0 40 Z"
              fill="rgba(225, 29, 72, 0.25)"
            />
            <path
              d="M 0 38 Q 20 20, 40 32 T 80 8 T 120 20 T 160 25 L 160 40 L 0 40 Z"
              fill="rgba(2, 132, 199, 0.4)"
            />
            <path
              d="M 0 35 Q 20 5, 40 25 T 80 15 T 120 30 T 160 10"
              fill="none"
              stroke="#e11d48"
              strokeWidth="2"
            />
            <path
              d="M 0 38 Q 20 20, 40 32 T 80 8 T 120 20 T 160 25"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* 4. RESUMEN CLÍNICO AL PIE */}
      <div style={{
        marginTop: '8px',
        padding: '6px 12px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '11px',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>{analisis.resumenClinico}</span>
        <span style={{ color: '#2B4A66', fontWeight: '700' }}>
          DNI {analisis.pacienteDni}
        </span>
      </div>
    </div>
  )
}

/**
 * Subcomponente de Tarjeta de Órgano (A, B, C, D)
 */
function TarjetaOrgano({ tarjeta, enHover }) {
  const tieneAlerta = tarjeta.activo

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      padding: '8px 10px',
      borderRadius: '12px',
      backgroundColor: enHover ? '#f1f5f9' : (tieneAlerta ? '#FFF6FB' : '#ffffff'),
      border: enHover
        ? `1.5px solid ${tarjeta.color}`
        : (tieneAlerta ? `1.5px solid ${tarjeta.color}` : '1px solid #e2e8f0'),
      boxShadow: enHover || tieneAlerta ? '0 4px 10px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.02)',
      transition: 'all 0.15s ease'
    }}>
      {/* Icono de Órgano en Cuadrado de Color con bordes redondeados */}
      <div style={{
        width: '38px',
        height: '38px',
        minWidth: '38px',
        borderRadius: '10px',
        backgroundColor: tarjeta.bgIcon,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        boxShadow: `0 2px 6px ${tarjeta.bgIcon}40`
      }}>
        <IconoOrgano tipo={tarjeta.iconType} />
      </div>

      {/* Letra A-B-C-D y Nombre del Órgano */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{
            fontSize: '9.5px',
            fontWeight: '900',
            color: '#ffffff',
            backgroundColor: '#2B4A66',
            padding: '1px 5px',
            borderRadius: '4px'
          }}>
            {tarjeta.letra}
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#2B4A66',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {tarjeta.organo}
          </span>
        </div>

        {/* Descripción del síntoma o estado normal */}
        <p style={{
          margin: '2px 0 0 0',
          fontSize: '10.5px',
          color: tieneAlerta ? '#802048' : '#64748b',
          fontWeight: tieneAlerta ? '600' : '400',
          lineHeight: '1.25',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }} title={tarjeta.descripcion}>
          {tarjeta.descripcion}
        </p>
      </div>
    </div>
  )
}

/**
 * Matriz de 10 puntos para porcentaje de telemetría (como en la infografía)
 */
function MatrizPuntos({ porcentaje, color }) {
  const puntosPintados = Math.round(porcentaje / 10)
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: i < puntosPintados ? color : '#cbd5e1'
          }}
        />
      ))}
    </div>
  )
}

/**
 * Iconos vectoriales de órganos clínicos en SVG
 */
function IconoOrgano({ tipo }) {
  switch (tipo) {
    case 'cerebro':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c-1.8 0-3.3 1-4 2.5C7.3 5.2 6.7 5 6 5c-2.2 0-4 1.8-4 4 0 .9.3 1.7.8 2.3C2.3 12 2 13 2 14c0 2.2 1.8 4 4 4 .4 0 .7 0 1-.1.7 1.8 2.4 3.1 4.5 3.1h1V3h-.5zM12.5 3v18h.5c2.1 0 3.8-1.3 4.5-3.1.3.1.6.1 1 .1 2.2 0 4-1.8 4-4 0-1-.3-2-.8-2.7.5-.6.8-1.4.8-2.3 0-2.2-1.8-4-4-4-.7 0-1.3.2-2 .5-.7-1.5-2.2-2.5-4-2.5z" />
        </svg>
      )
    case 'corazon':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )
    case 'pulmones':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 3v6.5C11 11 9.5 12 7.5 12S4 11 4 9.5V8c0-2.8 2.2-5 5-5h2zm2 0h2c2.8 0 5 2.2 5 5v1.5c0 1.5-1.5 2.5-3.5 2.5S13 11 13 9.5V3zm-2 8.5V21H9c-2.8 0-5-2.2-5-5v-1.5c0-1.5 1.5-2.5 3.5-2.5h3.5zm2 0h3.5c2 0 3.5 1 3.5 2.5V16c0 2.8-2.2 5-5 5h-2v-9.5z" />
        </svg>
      )
    case 'estomago':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 3c-1.5 0-3 1-3 3v2c0 4 3 8 7 8 2 0 4-1 5-3v4c0 2-2 3-4 3H9v2h4c3.3 0 6-2.7 6-6V6c0-1.7-1.3-3-3-3-2 0-3.5 1.2-4 2.5C11.5 4.2 10 3 8 3z" />
        </svg>
      )
    case 'higado':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 6c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v4c0 5.5-4.5 10-10 10S4 15.5 4 10V6z" />
        </svg>
      )
    case 'intestinos':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 3h10v2H7V3zm-2 4h14v2H5V7zm2 4h10v2H7v-2zm-2 4h14v2H5v-2zm2 4h10v2H7v-2z" />
        </svg>
      )
    case 'articulaciones':
    case 'huesos':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2c0 .3.1.6.2.8L9 11.2c-.2-.1-.5-.2-.8-.2-1.1 0-2 .9-2 2s.9 2 2 2c.3 0 .6-.1.8-.2l8.2 4.4c-.1.2-.2.5-.2.8 0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2c-.3 0-.6.1-.8.2L10 13.8c.1-.2.2-.5.2-.8 0-.3-.1-.6-.2-.8l8.2-4.4c.2.1.5.2.8.2z" />
        </svg>
      )
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
  }
}
