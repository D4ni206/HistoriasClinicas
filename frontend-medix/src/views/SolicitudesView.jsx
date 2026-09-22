import { useState, useEffect } from 'react'
import { API_BASE } from '../api/config'

export default function SolicitudesView({ usuario, notificar, onActualizacion }) {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('todas') // 'todas', 'Pendiente', 'Aprobada', 'Rechazada'
  const [busqueda, setBusqueda] = useState('')
  const [procesandoId, setProcesandoId] = useState(null)

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

  const handleAprobar = async (solicitud) => {
    const confirmMsg = `¿Confirma la aprobación de la solicitud #${solicitud.id}?\n\nEsta acción ELIMINARÁ DEFINITIVAMENTE el expediente clínico DNI ${solicitud.paciente_dni} (#${solicitud.paciente_id}) y todos sus archivos asociados en MinIO.`
    if (!window.confirm(confirmMsg)) return

    setProcesandoId(solicitud.id)
    try {
      const res = await fetch(`${API_BASE}/solicitudes-eliminacion/${solicitud.id}/aprobar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuesta_admin: `Aprobado por el Administrador ${usuario?.username || 'admin'}` })
      })
      const data = await res.json()
      if (res.ok) {
        notificar('exito', data.mensaje || 'Solicitud aprobada y expediente eliminado.')
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

  const handleRechazar = async (solicitud) => {
    const motivoRechazo = window.prompt(
      `¿Desea rechazar la solicitud #${solicitud.id} del DNI ${solicitud.paciente_dni}?\nPuede ingresar un motivo de rechazo (opcional):`,
      'Solicitud no fundamentada conforme a los protocolos institucionales'
    )
    if (motivoRechazo === null) return

    setProcesandoId(solicitud.id)
    try {
      const res = await fetch(`${API_BASE}/solicitudes-eliminacion/${solicitud.id}/rechazar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuesta_admin: motivoRechazo.trim() || 'Desestimada por el Administrador' })
      })
      const data = await res.json()
      if (res.ok) {
        notificar('exito', data.mensaje || 'Solicitud rechazada.')
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
      {/* 1. Cabecera de la Vista */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#802048', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Módulo de Administración y Control
          </div>
          <h2 style={{ margin: '2px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#2B4A66', letterSpacing: '-0.3px' }}>
            Solicitudes de Eliminación de Historias Clínicas
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
            Bandeja centralizada de peticiones remitidas por médicos y personal de salud.
          </p>
        </div>

        <button
          onClick={cargarSolicitudes}
          disabled={cargando}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #7FD6FF',
            borderRadius: '8px',
            color: '#104060',
            fontWeight: '700',
            fontSize: '12.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 5px rgba(127, 214, 255, 0.25)'
          }}
          title="Actualizar bandeja de solicitudes"
        >
          <span>{cargando ? 'Cargando...' : 'Actualizar Bandeja'}</span>
        </button>
      </div>

      {/* 2. Tarjetas KPI de Estado */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '14px 16px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
            Total Solicitudes
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#2B4A66', marginTop: '4px' }}>
            {total}
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFF6FB',
          borderRadius: '12px',
          padding: '14px 16px',
          border: '1.5px solid #f4a7c7',
          boxShadow: '0 2px 8px rgba(255, 214, 232, 0.45)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#802048', textTransform: 'uppercase' }}>
            Pendientes de Autorización
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#802048', marginTop: '4px' }}>
            {pendientes}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '14px 16px',
          border: '1.5px solid #4cc799',
          boxShadow: '0 2px 6px rgba(111, 227, 180, 0.25)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#0a5438', textTransform: 'uppercase' }}>
            Aprobadas (Eliminadas)
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0a5438', marginTop: '4px' }}>
            {aprobadas}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '14px 16px',
          border: '1.5px solid #cbd5e1',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
            Rechazadas / Desestimadas
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#64748b', marginTop: '4px' }}>
            {rechazadas}
          </div>
        </div>
      </div>

      {/* 3. Filtros y Búsqueda */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '14px 16px',
        border: '1.5px solid #7FD6FF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(127, 214, 255, 0.15)'
      }}>
        {/* Selector de Pestañas por Estado */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'Pendiente', label: `Pendientes (${pendientes})` },
            { id: 'Aprobada', label: 'Aprobadas' },
            { id: 'Rechazada', label: 'Rechazadas' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroEstado(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: filtroEstado === tab.id ? '1.5px solid #7FD6FF' : '1px solid #e2e8f0',
                backgroundColor: filtroEstado === tab.id ? '#7FD6FF' : '#ffffff',
                color: filtroEstado === tab.id ? '#104060' : '#64748b',
                fontWeight: filtroEstado === tab.id ? '800' : '600',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Campo de Búsqueda */}
        <div style={{ minWidth: '260px', flex: '1 1 280px', maxWidth: '400px' }}>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por DNI, remitente o motivo..."
            style={{
              width: '100%',
              padding: '7px 12px',
              borderRadius: '6px',
              border: '1.5px solid #cbd5e1',
              fontSize: '12px',
              color: '#2B4A66',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#7FD6FF'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
          />
        </div>
      </div>

      {/* 4. TABLA CENTRAL DE SOLICITUDES */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1.5px solid #FFD6E8',
        boxShadow: '0 4px 12px rgba(43, 74, 102, 0.05)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '12.5px',
            color: '#2B4A66'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#FFF6FB',
                borderBottom: '2px solid #FFD6E8',
                color: '#802048',
                fontSize: '11.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}>
                <th style={{ padding: '12px 14px', fontWeight: '800' }}>Remitente (Quién lo envía)</th>
                <th style={{ padding: '12px 14px', fontWeight: '800' }}>Fecha y Hora</th>
                <th style={{ padding: '12px 14px', fontWeight: '800' }}>N° Historia</th>
                <th style={{ padding: '12px 14px', fontWeight: '800' }}>Paciente (DNI)</th>
                <th style={{ padding: '12px 14px', fontWeight: '800' }}>Motivo de la Solicitud</th>
                <th style={{ padding: '12px 14px', fontWeight: '800', textAlign: 'center' }}>Estado y Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Cargando listado de solicitudes...
                  </td>
                </tr>
              ) : solicitudesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No se encontraron solicitudes registradas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                solicitudesFiltradas.map((s) => {
                  const esPendiente = s.estado === 'Pendiente'
                  const esAprobada = s.estado === 'Aprobada'
                  const esRechazada = s.estado === 'Rechazada'
                  const estaProcesando = procesandoId === s.id

                  return (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: esPendiente ? '#ffffff' : '#f8fafc',
                        transition: 'background-color 0.1s ease'
                      }}
                    >
                      {/* 1. Nombre de quien lo envía */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: '800', color: '#2B4A66' }}>
                          {s.usuario_nombre}
                        </div>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '10.5px',
                          fontWeight: '700',
                          backgroundColor: '#7FD6FF',
                          color: '#104060',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          marginTop: '2px'
                        }}>
                          {s.usuario_rol || 'Médico'}
                        </span>
                      </td>

                      {/* 2. Hora y Fecha */}
                      <td style={{ padding: '12px 14px', color: '#475569', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b' }}>
                          {s.hora_solicitud || '—'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {s.fecha_solicitud ? s.fecha_solicitud.split(' ')[0] : '—'}
                        </div>
                      </td>

                      {/* 3. Número de Historia */}
                      <td style={{ padding: '12px 14px', fontWeight: '800', color: '#104060' }}>
                        #{s.paciente_id || '—'}
                      </td>

                      {/* 4. Paciente (DNI) */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          backgroundColor: '#6FE3B4',
                          color: '#0a5438',
                          border: '1px solid #4cc799',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: '800',
                          fontSize: '12px'
                        }}>
                          DNI {s.paciente_dni}
                        </span>
                      </td>

                      {/* 5. Motivo */}
                      <td style={{ padding: '12px 14px', maxWidth: '320px' }}>
                        <div style={{ fontWeight: '700', color: '#802048', fontSize: '12px' }}>
                          {s.motivo_categoria}
                        </div>
                        {s.motivo_detalle && (
                          <div style={{
                            fontSize: '11.5px',
                            color: '#475569',
                            marginTop: '3px',
                            lineHeight: '1.3'
                          }}>
                            {s.motivo_detalle}
                          </div>
                        )}
                        {s.respuesta_admin && (
                          <div style={{
                            fontSize: '10.5px',
                            color: '#0284c7',
                            marginTop: '4px',
                            fontStyle: 'italic',
                            borderTop: '1px dashed #cbd5e1',
                            paddingTop: '2px'
                          }}>
                            Resolución: {s.respuesta_admin}
                          </div>
                        )}
                      </td>

                      {/* 6. Estado y Acciones */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {esPendiente ? (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleAprobar(s)}
                              disabled={estaProcesando}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#FFD6E8',
                                color: '#802048',
                                border: '1.5px solid #f4a7c7',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: '800',
                                cursor: estaProcesando ? 'not-allowed' : 'pointer',
                                transition: 'all 0.12s ease'
                              }}
                              title="Aprobar y eliminar definitivamente la historia clínica y sus archivos"
                            >
                              {estaProcesando ? 'Procesando...' : 'Aprobar y Eliminar'}
                            </button>

                            <button
                              onClick={() => handleRechazar(s)}
                              disabled={estaProcesando}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: '700',
                                cursor: estaProcesando ? 'not-allowed' : 'pointer'
                              }}
                              title="Rechazar y desestimar solicitud"
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : esAprobada ? (
                          <span style={{
                            backgroundColor: '#6FE3B4',
                            color: '#0a5438',
                            border: '1px solid #4cc799',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            Aprobada (Eliminada)
                          </span>
                        ) : (
                          <span style={{
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                            border: '1px solid #cbd5e1',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700'
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
    </div>
  )
}
