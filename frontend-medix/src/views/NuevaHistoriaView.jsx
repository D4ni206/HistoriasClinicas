import { useNavigate } from 'react-router-dom'

export default function NuevaHistoriaView({
  dni,
  setDni,
  file,
  setFile,
  fileInputRef,
  subiendo,
  pacientes,
  handleUpload
}) {
  const navigate = useNavigate()
  const pacienteDetectado = pacientes.find(p => p.dni.trim() === dni.trim())

  return (
    <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#2B4A66', margin: '0 0 6px 0' }}>
          Agregar Nueva Historia Clínica
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
          Registra un nuevo expediente clínico o anexa documentos a una carpeta existente por DNI.
        </p>
      </div>

      {/* Tarjeta del Formulario Principal */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '2px solid #7FD6FF',
        borderRadius: '12px',
        padding: '28px',
        boxShadow: '0 4px 16px rgba(127, 214, 255, 0.25)',
        marginBottom: '20px'
      }}>
        <form onSubmit={handleUpload}>
          {/* Campo DNI */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#2B4A66', marginBottom: '8px' }}>
              DNI DEL PACIENTE (8 dígitos)
            </label>
            <input
              type="text"
              placeholder="Ejemplo: 45892314"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1.5px solid #d1d5db',
                fontSize: '15px',
                fontWeight: '600',
                outline: 'none',
                backgroundColor: '#FFF6FB'
              }}
              onFocus={(e) => e.target.style.borderColor = '#7FD6FF'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Detección en tiempo real de carpeta por DNI */}
          {dni.trim().length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              {pacienteDetectado ? (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#6FE3B4',
                  border: '1.5px solid #4cc799',
                  color: '#0a5438',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  <strong>Carpeta Identificada:</strong> El DNI <strong>{pacienteDetectado.dni}</strong> ya cuenta con {pacienteDetectado.total_documentos} documento(s) registrado(s). El nuevo archivo se anexará dentro de su carpeta existente de manera ordenada.
                </div>
              ) : (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#FFD6E8',
                  border: '1.5px solid #f4a7c7',
                  color: '#802048',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  <strong>Nuevo Expediente:</strong> El DNI <strong>{dni.trim()}</strong> no está registrado. Al guardar se creará una carpeta digital exclusiva para este paciente.
                </div>
              )}
            </div>
          )}

          {/* Campo Selector de Archivo */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#2B4A66', marginBottom: '8px' }}>
              DOCUMENTO / ARCHIVO ADJUNTO
            </label>
            <div
              style={{
                border: '2px dashed #7FD6FF',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: '#FFF6FB',
                cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/*, text/plain"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'none' }}
                required
              />
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2B4A66" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px auto', display: 'block' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              {file ? (
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#2B4A66', display: 'block' }}>
                    Archivo seleccionado: {file.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Tamaño: {(file.size / 1024).toFixed(1)} KB · Clic para cambiar
                  </span>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#2B4A66', display: 'block' }}>
                    Haz clic aquí para seleccionar el archivo de historia clínica
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Formatos admitidos: PDF, Word (.docx), Imágenes (JPG, PNG) y Texto (.txt)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botón de Envío */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={subiendo}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: subiendo ? '#bbf7d0' : '#6FE3B4',
                color: '#0a5438',
                border: '1.5px solid #4cc799',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: subiendo ? 'not-allowed' : 'pointer',
                boxShadow: '0 3px 6px rgba(111, 227, 180, 0.4)',
                transition: 'all 0.15s ease'
              }}
            >
              {subiendo ? 'Guardando en MinIO S3 y registrando en SQL Server...' : 'Guardar en Carpeta del Paciente'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '12px 18px',
                backgroundColor: '#ffffff',
                color: '#2B4A66',
                border: '1.5px solid #d1d5db',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Ver Dashboard
            </button>
          </div>
        </form>
      </div>

      {/* Tarjeta de Información */}
      <div style={{
        backgroundColor: '#FFF6FB',
        border: '1px solid #7FD6FF',
        borderRadius: '10px',
        padding: '16px 20px',
        color: '#2B4A66',
        fontSize: '12px',
        lineHeight: '1.5'
      }}>
        <strong style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
          Gestión automatizada de carpetas:
        </strong>
        El sistema agrupa automáticamente los archivos bajo el mismo DNI. Si el paciente ya existe en el sistema, el nuevo documento se anexa a su carpeta clínica sin duplicar expedientes.
      </div>
    </div>
  )
}
