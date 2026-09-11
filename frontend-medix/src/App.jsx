import { useState, useEffect } from 'react'

const API_BASE = 'http://127.0.0.1:5000/api'

export default function App() {
  const [tab, setTab] = useState('documentos') // 'documentos' | 'pacientes'
  const [documentos, setDocumentos] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

  // Formulario nuevo documento
  const [dni, setDni] = useState('')
  const [file, setFile] = useState(null)
  const [subiendo, setSubiendo] = useState(false)

  // Modal / Edición de paciente
  const [editandoPaciente, setEditandoPaciente] = useState(null)
  const [nuevoDni, setNuevoDni] = useState('')

  // Panel / Visor de documento
  const [documentoEnVista, setDocumentoEnVista] = useState(null)
  const esPdf = (nombre = '') => nombre.toLowerCase().endsWith('.pdf')
  const esImagen = (nombre = '') => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(nombre)

  useEffect(() => {
    cargarDatos()
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDocumentoEnVista(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const notificar = (tipo, texto) => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000)
  }

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [resDocs, resPacs] = await Promise.all([
        fetch(`${API_BASE}/documentos`),
        fetch(`${API_BASE}/pacientes`)
      ])

      if (resDocs.ok) {
        const docs = await resDocs.json()
        setDocumentos(docs)
      }
      if (resPacs.ok) {
        const pacs = await resPacs.json()
        setPacientes(pacs)
      }
    } catch (error) {
      notificar('error', 'Error al conectar con el servidor backend.')
    } finally {
      setLoading(false)
    }
  }

  // C: Crear / Subir Documento
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!dni.trim() || !file) {
      notificar('error', 'Por favor ingresa el DNI y selecciona un archivo.')
      return
    }

    setSubiendo(true)
    const formData = new FormData()
    formData.append('dni', dni.trim())
    formData.append('archivo', file)

    try {
      const response = await fetch(`${API_BASE}/documentos`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (response.ok) {
        notificar('exito', data.mensaje || 'Documento registrado con éxito.')
        setDni('')
        setFile(null)
        // Reset file input value
        const fileInput = document.getElementById('archivo-input')
        if (fileInput) fileInput.value = ''
        cargarDatos()
      } else {
        notificar('error', data.mensaje || 'Error al subir el documento.')
      }
    } catch (error) {
      notificar('error', 'Error de conexión con el backend.')
    } finally {
      setSubiendo(false)
    }
  }

  // U: Actualizar DNI Paciente
  const handleGuardarDni = async (id) => {
    if (!nuevoDni.trim()) {
      notificar('error', 'El nuevo DNI no puede estar vacío.')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/pacientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: nuevoDni.trim() })
      })
      const data = await response.json()

      if (response.ok) {
        notificar('exito', 'Paciente actualizado exitosamente.')
        setEditandoPaciente(null)
        cargarDatos()
      } else {
        notificar('error', data.mensaje || 'Error al actualizar paciente.')
      }
    } catch (error) {
      notificar('error', 'Error al comunicarse con el servidor.')
    }
  }

  // D: Eliminar Documento
  const handleEliminarDocumento = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar el documento #${id} (${nombre})? Se borrará de SQL Server y MinIO.`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/documentos/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (response.ok) {
        notificar('exito', data.mensaje || 'Documento eliminado.')
        cargarDatos()
      } else {
        notificar('error', data.mensaje || 'Error al eliminar.')
      }
    } catch (error) {
      notificar('error', 'Error de red al intentar eliminar documento.')
    }
  }

  // D: Eliminar Paciente
  const handleEliminarPaciente = async (id, dniPac) => {
    if (!window.confirm(`¿Eliminar paciente DNI ${dniPac} (#${id})? Se eliminarán también todos sus documentos asociados.`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/pacientes/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (response.ok) {
        notificar('exito', data.mensaje || 'Paciente eliminado.')
        cargarDatos()
      } else {
        notificar('error', data.mensaje || 'Error al eliminar paciente.')
      }
    } catch (error) {
      notificar('error', 'Error de red al intentar eliminar paciente.')
    }
  }

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1f2937' }}>
      {/* Encabezado */}
      <header style={{ marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          🏥 Medix - Banco de Historias Clínicas
        </h1>
        <p style={{ margin: 0, color: '#4b5563', fontSize: '15px' }}>
          Sistema de Digitalización y Gestión Documental (CRUD con SQL Server y MinIO)
        </p>
      </header>

      {/* Alerta de Estado */}
      {mensaje.texto && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: mensaje.tipo === 'exito' ? '#def7ec' : '#fde8e8',
          color: mensaje.tipo === 'exito' ? '#03543f' : '#9b1c1c',
          border: `1px solid ${mensaje.tipo === 'exito' ? '#84e1bc' : '#f8b4b4'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{mensaje.texto}</span>
          <button onClick={() => setMensaje({ tipo: '', texto: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Tarjeta de Subida (CREATE) */}
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 14px 0', color: '#1f2937' }}>
          📤 Subir Nueva Historia Clínica / Documento
        </h2>
        <form onSubmit={handleUpload} style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="DNI del Paciente (Ej: 12345678)"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', flex: '1 1 200px' }}
            required
          />
          <input
            id="archivo-input"
            type="file"
            accept="application/pdf, image/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', flex: '2 1 300px' }}
            required
          />
          <button
            type="submit"
            disabled={subiendo}
            style={{
              padding: '10px 20px',
              backgroundColor: subiendo ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: subiendo ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {subiendo ? 'Subiendo a MinIO...' : 'Registrar y Subir'}
          </button>
        </form>
      </div>

      {/* Pestañas de Navegación */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setTab('documentos')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              border: '1px solid #d1d5db',
              backgroundColor: tab === 'documentos' ? '#1f2937' : '#ffffff',
              color: tab === 'documentos' ? '#ffffff' : '#374151'
            }}
          >
            📄 Documentos Escaneados ({documentos.length})
          </button>
          <button
            onClick={() => setTab('pacientes')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              border: '1px solid #d1d5db',
              backgroundColor: tab === 'pacientes' ? '#1f2937' : '#ffffff',
              color: tab === 'pacientes' ? '#ffffff' : '#374151'
            }}
          >
            👥 Pacientes Registrados ({pacientes.length})
          </button>
        </div>

        <button
          onClick={cargarDatos}
          style={{
            padding: '8px 14px',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#4b5563'
          }}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* VISTA 1: TABLA DOCUMENTOS (READ & DELETE) */}
      {tab === 'documentos' && (
        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>ID</th>
                <th style={{ padding: '12px 16px' }}>DNI Paciente</th>
                <th style={{ padding: '12px 16px' }}>Archivo en MinIO</th>
                <th style={{ padding: '12px 16px' }}>Fecha Subida</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documentos.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
                    {loading ? 'Cargando documentos...' : 'No hay documentos registrados aún. Usa el formulario de arriba para subir uno.'}
                  </td>
                </tr>
              ) : (
                documentos.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>#{doc.id}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontWeight: '600' }}>
                        {doc.paciente_dni || 'Sin DNI'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4b5563' }}>
                      {doc.nombre_archivo}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>
                      {doc.fecha_subida || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => setDocumentoEnVista(doc)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          title="Ver vista previa en panel"
                        >
                          👁️ Ver
                        </button>
                        <a
                          href={`${API_BASE}/documentos/${doc.id}/archivo`}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#6366f1',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          ⬇️ Descargar
                        </a>
                        <button
                          onClick={() => handleEliminarDocumento(doc.id, doc.nombre_archivo)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VISTA 2: TABLA PACIENTES (READ, UPDATE, DELETE) */}
      {tab === 'pacientes' && (
        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>ID</th>
                <th style={{ padding: '12px 16px' }}>DNI</th>
                <th style={{ padding: '12px 16px' }}>Total Documentos</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
                    {loading ? 'Cargando pacientes...' : 'No hay pacientes registrados.'}
                  </td>
                </tr>
              ) : (
                pacientes.map((pac) => (
                  <tr key={pac.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>#{pac.id}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {editandoPaciente === pac.id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={nuevoDni}
                            onChange={(e) => setNuevoDni(e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleGuardarDni(pac.id)}
                            style={{ padding: '4px 10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditandoPaciente(null)}
                            style={{ padding: '4px 10px', backgroundColor: '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontWeight: '600', color: '#111827' }}>{pac.dni}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontWeight: '600', fontSize: '12px' }}>
                        {pac.total_documentos} {pac.total_documentos === 1 ? 'documento' : 'documentos'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {editandoPaciente !== pac.id && (
                          <button
                            onClick={() => {
                              setEditandoPaciente(pac.id)
                              setNuevoDni(pac.dni)
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            ✏️ Editar DNI
                          </button>
                        )}
                        <button
                          onClick={() => handleEliminarPaciente(pac.id, pac.dni)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL / PANEL DE VISTA PREVIA */}
      {documentoEnVista && (
        <div
          onClick={() => setDocumentoEnVista(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px',
            backdropFilter: 'blur(2px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '960px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden'
            }}
          >
            {/* Cabecera del Panel */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f9fafb'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#111827', fontWeight: '700' }}>
                  📋 Visor de Documento: {documentoEnVista.nombre_archivo}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#4b5563' }}>
                  Paciente DNI: <strong style={{ color: '#0369a1' }}>{documentoEnVista.paciente_dni || 'Sin DNI'}</strong> | Subido el: {documentoEnVista.fecha_subida || '—'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={`${API_BASE}/documentos/${documentoEnVista.id}/archivo`}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  ⬇️ Descargar
                </a>
                <button
                  onClick={() => setDocumentoEnVista(null)}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#e5e7eb',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#374151'
                  }}
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>

            {/* Contenedor del Visor */}
            <div style={{
              flex: 1,
              backgroundColor: '#1f2937',
              padding: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '450px',
              maxHeight: 'calc(92vh - 80px)',
              overflow: 'auto'
            }}>
              {esPdf(documentoEnVista.nombre_archivo) ? (
                <iframe
                  src={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`}
                  title={`Visor PDF - ${documentoEnVista.nombre_archivo}`}
                  style={{
                    width: '100%',
                    height: '75vh',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff'
                  }}
                />
              ) : esImagen(documentoEnVista.nombre_archivo) ? (
                <div style={{ textAlign: 'center', width: '100%', maxHeight: '75vh', overflow: 'auto' }}>
                  <img
                    src={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`}
                    alt="Vista previa de documento"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '75vh',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                    }}
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#f3f4f6', padding: '40px' }}>
                  <p style={{ fontSize: '16px', marginBottom: '12px' }}>
                    📄 Este tipo de archivo no admite previsualización directa en el navegador.
                  </p>
                  <a
                    href={`${API_BASE}/documentos/${documentoEnVista.id}/archivo`}
                    style={{
                      display: 'inline-block',
                      padding: '10px 18px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: '600'
                    }}
                  >
                    ⬇️ Descargar archivo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}