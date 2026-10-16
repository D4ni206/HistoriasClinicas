import { useState, useEffect } from 'react'
import { API_BASE } from '../api/config'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import { useTheme } from '../context/ThemeContext'

export default function SolicitudesView({ usuario, notificar, onActualizacion }) {
  const { theme, temaOscuro } = useTheme()
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('todas') // 'todas', 'Pendiente', 'Aprobada', 'Rechazada'
  const [busqueda, setBusqueda] = useState('')
  const [procesandoId, setProcesandoId] = useState(null)
  const [solicitudParaAprobar, setSolicitudParaAprobar] = useState(null)

  const cargarSolicitudes = async () => {
    setCargando(true)
    try {
      const res = await fetch(`${API_BASE}/solicitudes-eliminacion`)
      if (res.ok) {
        const data = await res.json()
        setSolicitudes(data)
      } else {
        notificar('error', 'Error al cargar las solicitudes de eliminación.')
      }
    } catch (err) {
      notificar('error', 'Error de red al conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarSolicitudes()
  }, [])

  const handleAprobar = (solicitud) => {
    setSolicitudParaAprobar(solicitud)
  }

  const ejecutarAprobar = async (solicitud) => {
    setSolicitudParaAprobar(null)
    setProcesandoId(solicitud.id)
    try {
      const res = await fetch(`${API_BASE}/solicitudes-eliminacion/${solicitud.id}/aprobar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuesta_admin: `Aprobado por el Administrador ${usuario?.username || 'admin'}` })
      })
      const data = await res.json()
      if (res.ok) {
        notificar({
          tipo: 'eliminacion',
          titulo: 'Historia Eliminada',
          texto: data.mensaje || 'Solicitud aprobada y expediente clínico eliminado permanentemente.',
          contador: '1',
          actionLabel: 'Delete',
          secondaryLabel: 'Cancel'
        })
        cargarSolicitudes()
        if (onActualizacion) onActualizacion()
      } else {
        notificar('error', data.mensaje || 'No se pudo aprobar la solicitud.')
      }
    } catch (err) {
      notificar('error', 'Error de red al procesar la aprobación.')
    } finally {
      setProcesandoId(null)
    }
  }

  const [solicitudParaRechazar, setSolicitudParaRechazar] = useState(null)

  const handleRechazar = (solicitud) => {
    setSolicitudParaRechazar(solicitud)
  }

  const ejecutarRechazar = async (solicitud) => {
    setSolicitudParaRechazar(null)
    setProcesandoId(solicitud.id)
    try {
      const res = await fetch(`${API_BASE}/solicitudes-eliminacion/${solicitud.id}/rechazar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuesta_admin: 'Desestimada formalmente por el Administrador conforme a protocolos' })
      })
      const data = await res.json()
      if (res.ok) {
        notificar({
          tipo: 'exito',
          titulo: 'Solicitud Rechazada',
          texto: data.mensaje || 'La solicitud ha sido rechazada y archivada.',
          contador: '1',
          actionLabel: 'Okay'
        })
        cargarSolicitudes()
      } else {
        notificar('error', data.mensaje || 'No se pudo rechazar la solicitud.')
      }
    } catch (err) {
      notificar('error', 'Error de red al procesar el rechazo.')
    } finally {
      setProcesandoId(null)
    }
  }

  // Filtrado de solicitudes
  const solicitudesFiltradas = solicitudes.filter((s) => {
    const coincideEstado = filtroEstado === 'todas' || s.estado === filtroEstado
    const q = busqueda.trim().toLowerCase()
    const coincideBusqueda = !q ||
      (s.paciente_dni && s.paciente_dni.toLowerCase().includes(q)) ||
      (s.usuario_nombre && s.usuario_nombre.toLowerCase().includes(q)) ||
      (s.motivo_categoria && s.motivo_categoria.toLowerCase().includes(q)) ||
      (s.motivo_detalle && s.motivo_detalle.toLowerCase().includes(q)) ||
      (s.paciente_id && String(s.paciente_id).includes(q))

    return coincideEstado && coincideBusqueda
  })

  // Estadísticas para KPIs
  const total = solicitudes.length
  const pendientes = solicitudes.filter(s => s.estado === 'Pendiente').length
  const aprobadas = solicitudes.filter(s => s.estado === 'Aprobada').length
  const rechazadas = solicitudes.filter(s => s.estado === 'Rechazada').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1160px', margin: '0 auto' }}>
      {/* 1. Cabecera de la Vista */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Módulo de Auditoría y Control
          </div>
          <h2 style={{ margin: '3px 0 0 0', fontSize: '22px', fontWeight: '800', color: theme.textMain, letterSpacing: '-0.02em' }}>
            Solicitudes de Eliminación de Historias Clínicas
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: theme.textMuted }}>
            Bandeja centralizada de peticiones remitidas por médicos y personal de salud para eliminación reglamentaria.
          </p>
        </div>

        <button
          onClick={cargarSolicitudes}
          disabled={cargando}
          style={{
            padding: '8px 16px',
            backgroundColor: theme.secondaryBtnBg,
            border: theme.secondaryBtnBorder,
            borderRadius: '8px',
            color: theme.secondaryBtnColor,
            fontWeight: '600',
            fontSize: '12.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = temaOscuro ? '#334155' : '#f8fafc'
            e.currentTarget.style.color = theme.textMain
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.secondaryBtnBg
            e.currentTarget.style.color = theme.secondaryBtnColor
          }}
          title="Actualizar bandeja de solicitudes"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>{cargando ? 'Cargando...' : 'Actualizar Bandeja'}</span>
        </button>
      </div>

      {/* 2. Tarjetas KPI de Estado (Tonos Fríos y Minimalistas) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        {/* Total Solicitudes */}
        <div style={{
          backgroundColor: theme.bgCard,
          borderRadius: '14px',
          padding: '16px 20px',
          border: theme.border,
          boxShadow: theme.shadowCard
        }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Solicitudes
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: theme.textMain, marginTop: '6px' }}>
            {total}
          </div>
        </div>

        {/* Pendientes de Autorización */}
        <div style={{
          backgroundColor: temaOscuro ? 'rgba(244, 63, 94, 0.1)' : '#fff1f2',
          borderRadius: '14px',
          padding: '16px 20px',
          border: temaOscuro ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid #fecdd3',
          boxShadow: theme.shadowCard
        }}>
          <div style={{ fontSize: '11.5px', fontWeight: '800', color: temaOscuro ? '#fda4af' : '#be123c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pendientes de Autorización
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: temaOscuro ? '#fda4af' : '#9f1239', marginTop: '6px' }}>
            {pendientes}
          </div>
        </div>

        {/* Aprobadas */}
        <div style={{
          backgroundColor: temaOscuro ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4',
          borderRadius: '14px',
          padding: '16px 20px',
          border: temaOscuro ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0',
          boxShadow: theme.shadowCard
        }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: temaOscuro ? '#6ee7b7' : '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Aprobadas (Eliminadas)
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: temaOscuro ? '#6ee7b7' : '#15803d', marginTop: '6px' }}>
            {aprobadas}
          </div>
        </div>

        {/* Rechazadas */}
        <div style={{
          backgroundColor: theme.bgCard,
          borderRadius: '14px',
          padding: '16px 20px',
          border: theme.border,
          boxShadow: theme.shadowCard
        }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Rechazadas / Desestimadas
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: theme.textSecondary, marginTop: '6px' }}>
            {rechazadas}
          </div>
        </div>
      </div>

      {/* 3. Filtros y Búsqueda */}
      <div style={{
        backgroundColor: theme.bgCard,
        borderRadius: '14px',
        padding: '14px 18px',
        border: theme.border,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: theme.shadowCard
      }}>
        {/* Selector de Pestañas por Estado */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'Pendiente', label: `Pendientes (${pendientes})` },
            { id: 'Aprobada', label: 'Aprobadas' },
            { id: 'Rechazada', label: 'Rechazadas' }
          ].map((tab) => {
            const activo = filtroEstado === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setFiltroEstado(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: activo ? '1px solid transparent' : theme.border,
                  backgroundColor: activo ? (temaOscuro ? '#38bdf8' : '#0f172a') : theme.bgSubtle,
                  color: activo ? (temaOscuro ? '#080c14' : '#ffffff') : theme.textSecondary,
                  fontWeight: activo ? '700' : '500',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Campo de Búsqueda */}
        <div style={{ minWidth: '260px', flex: '1 1 280px', maxWidth: '380px' }}>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por DNI, remitente o motivo..."
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: '8px',
              border: `1px solid ${theme.borderInput}`,
              backgroundColor: theme.bgInput,
              fontSize: '12.5px',
              color: theme.textMain,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
            onBlur={(e) => e.target.style.borderColor = theme.borderInput}
          />
        </div>
      </div>

      {/* 4. TABLA CENTRAL DE SOLICITUDES */}
      <div style={{
        backgroundColor: theme.bgCard,
        borderRadius: '16px',
        border: theme.border,
        boxShadow: theme.shadowCard,
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '12.5px',
            color: theme.textMain
          }}>
            <thead>
              <tr style={{
                backgroundColor: theme.tableHeaderBg,
                borderBottom: theme.border,
                color: theme.textMuted,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <th style={{ padding: '12px 16px', fontWeight: '700' }}>Remitente</th>
                <th style={{ padding: '12px 16px', fontWeight: '700' }}>Fecha y Hora</th>
                <th style={{ padding: '12px 16px', fontWeight: '700' }}>N° Historia</th>
                <th style={{ padding: '12px 16px', fontWeight: '700' }}>Paciente (DNI)</th>
                <th style={{ padding: '12px 16px', fontWeight: '700' }}>Motivo de la Solicitud</th>
                <th style={{ padding: '12px 16px', fontWeight: '700', textAlign: 'center' }}>Estado y Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: theme.textMuted }}>
                    Cargando listado de solicitudes...
                  </td>
                </tr>
              ) : solicitudesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: theme.textMuted }}>
                    No se encontraron solicitudes registradas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                solicitudesFiltradas.map((s) => {
                  const esPendiente = s.estado === 'Pendiente'
                  const esAprobada = s.estado === 'Aprobada'
                  const estaProcesando = procesandoId === s.id

                  return (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: theme.borderSubtle,
                        transition: 'background-color 0.12s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.tableRowHover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* 1. Nombre de quien lo envía */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ fontWeight: '700', color: theme.textMain }}>
                          {s.usuario_nombre}
                        </div>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '10.5px',
                          fontWeight: '600',
                          backgroundColor: temaOscuro ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
                          color: temaOscuro ? '#7dd3fc' : '#0369a1',
                          border: temaOscuro ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid #bae6fd',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          marginTop: '3px'
                        }}>
                          {s.usuario_rol || 'Médico'}
                        </span>
                      </td>

                      {/* 2. Hora y Fecha */}
                      <td style={{ padding: '13px 16px', color: theme.textMuted, whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '600', color: theme.textSecondary }}>
                          {s.hora_solicitud || '—'}
                        </div>
                        <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '1px' }}>
                          {s.fecha_solicitud ? s.fecha_solicitud.split(' ')[0] : '—'}
                        </div>
                      </td>

                      {/* 3. Número de Historia */}
                      <td style={{ padding: '13px 16px', fontWeight: '700', color: theme.textMain, fontFamily: 'monospace' }}>
                        #{s.paciente_id || '—'}
                      </td>

                      {/* 4. Paciente (DNI) */}
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{
                          backgroundColor: temaOscuro ? 'rgba(56, 189, 248, 0.12)' : '#f0f9ff',
                          color: temaOscuro ? '#38bdf8' : '#0284c7',
                          border: temaOscuro ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid #bae6fd',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontSize: '11.5px'
                        }}>
                          DNI {s.paciente_dni}
                        </span>
                      </td>

                      {/* 5. Motivo */}
                      <td style={{ padding: '13px 16px', maxWidth: '320px' }}>
                        <div style={{ fontWeight: '700', color: temaOscuro ? '#fda4af' : '#b91c1c', fontSize: '12px' }}>
                          {s.motivo_categoria}
                        </div>
                        {s.motivo_detalle && (
                          <div style={{
                            fontSize: '11.5px',
                            color: theme.textSecondary,
                            marginTop: '3px',
                            lineHeight: '1.35'
                          }}>
                            {s.motivo_detalle}
                          </div>
                        )}
                        {s.respuesta_admin && (
                          <div style={{
                            fontSize: '10.5px',
                            color: '#38bdf8',
                            marginTop: '4px',
                            fontStyle: 'italic',
                            borderTop: theme.borderSubtle,
                            paddingTop: '3px'
                          }}>
                            Resolución: {s.respuesta_admin}
                          </div>
                        )}
                      </td>

                      {/* 6. Estado y Acciones */}
                      <td style={{ padding: '13px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {esPendiente ? (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleAprobar(s)}
                              disabled={estaProcesando}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: temaOscuro ? 'rgba(244, 63, 94, 0.18)' : '#ffe4e6',
                                color: temaOscuro ? '#fda4af' : '#e11d48',
                                border: temaOscuro ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid #fecdd3',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: '700',
                                cursor: estaProcesando ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (!estaProcesando) e.currentTarget.style.backgroundColor = temaOscuro ? 'rgba(244, 63, 94, 0.3)' : '#fecdd3'
                              }}
                              onMouseLeave={(e) => {
                                if (!estaProcesando) e.currentTarget.style.backgroundColor = temaOscuro ? 'rgba(244, 63, 94, 0.18)' : '#ffe4e6'
                              }}
                              title="Aprobar y eliminar definitivamente la historia clínica y sus archivos"
                            >
                              {estaProcesando ? 'Procesando...' : 'Aprobar y Eliminar'}
                            </button>

                            <button
                              onClick={() => handleRechazar(s)}
                              disabled={estaProcesando}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: theme.secondaryBtnBg,
                                color: theme.secondaryBtnColor,
                                border: theme.secondaryBtnBorder,
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: '600',
                                cursor: estaProcesando ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (!estaProcesando) e.currentTarget.style.backgroundColor = temaOscuro ? '#334155' : '#f1f5f9'
                              }}
                              onMouseLeave={(e) => {
                                if (!estaProcesando) e.currentTarget.style.backgroundColor = theme.secondaryBtnBg
                              }}
                              title="Rechazar y desestimar solicitud"
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : esAprobada ? (
                          <span style={{
                            backgroundColor: temaOscuro ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4',
                            color: temaOscuro ? '#6ee7b7' : '#166534',
                            border: temaOscuro ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>
                            Aprobada (Eliminada)
                          </span>
                        ) : (
                          <span style={{
                            backgroundColor: theme.bgSubtle,
                            color: theme.textMuted,
                            border: theme.border,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            Rechazada
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {solicitudParaAprobar && (
        <ConfirmDeleteModal
          paciente={{ dni: solicitudParaAprobar.paciente_dni }}
          titulo="Advertencia"
          pregunta={`¿Desea aprobar la eliminación de la historia clínica DNI ${solicitudParaAprobar.paciente_dni}? Se borrará permanentemente de la base de datos y de MinIO.`}
          onConfirmar={() => ejecutarAprobar(solicitudParaAprobar)}
          onCancelar={() => setSolicitudParaAprobar(null)}
        />
      )}

      {solicitudParaRechazar && (
        <ConfirmDeleteModal
          paciente={{ dni: solicitudParaRechazar.paciente_dni }}
          titulo="Advertencia"
          pregunta={`¿Desea rechazar la solicitud de eliminación del expediente DNI ${solicitudParaRechazar.paciente_dni}?`}
          onConfirmar={() => ejecutarRechazar(solicitudParaRechazar)}
          onCancelar={() => setSolicitudParaRechazar(null)}
        />
      )}
    </div>
  )
}
