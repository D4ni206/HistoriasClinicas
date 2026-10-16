import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

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
  const { theme, temaOscuro } = useTheme()
  const [isDragging, setIsDragging] = useState(false)

  const dniLimpio = (dni || '').trim()
  const pacienteDetectado = pacientes.find(p => p.dni && p.dni.trim() === dniLimpio)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const obtenerExtBadge = (nombre = '') => {
    const ext = nombre.split('.').pop().toUpperCase()
    return ext || 'FILE'
  }

  return (
    <div style={{ maxWidth: '820px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. ENCABEZADO MINIMALISTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: theme.textMain, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Agregar Nueva Historia Clínica
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: theme.textMuted }}>
            Registra un nuevo expediente clínico o anexa documentos a una carpeta existente por DNI.
          </p>
        </div>

        {/* Botón de retorno rápido */}
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            backgroundColor: theme.secondaryBtnBg,
            border: theme.secondaryBtnBorder,
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: theme.secondaryBtnColor,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = temaOscuro ? '#334155' : '#f8fafc'
            e.currentTarget.style.color = theme.textMain
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.secondaryBtnBg
            e.currentTarget.style.color = theme.secondaryBtnColor
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Volver al Dashboard</span>
        </button>
      </div>

      {/* 2. TARJETA PRINCIPAL DEL FORMULARIO (MINIMALISTA Y FORMAL CON TONOS FRÍOS) */}
      <div style={{
        backgroundColor: theme.bgCard,
        border: theme.border,
        borderRadius: '16px',
        padding: '28px 30px',
        boxShadow: theme.shadowCard
      }}>
        <form onSubmit={handleUpload}>
          
          {/* Campo DNI */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: theme.textMain, marginBottom: '6px' }}>
              DNI del Paciente <span style={{ color: '#ef4444' }}>*</span>
            </label>
            
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Ejemplo: 45892314"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                maxLength={12}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 14px 11px 38px',
                  borderRadius: '9px',
                  border: `1px solid ${theme.borderInput}`,
                  fontSize: '14.5px',
                  fontWeight: '600',
                  color: theme.textMain,
                  backgroundColor: theme.bgInput,
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#38bdf8'
                  e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.15)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.borderInput
                  e.target.style.boxShadow = 'none'
                }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: theme.textMuted }}>
                🪪
              </span>
            </div>

            {/* Detección en tiempo real de carpeta por DNI (Minimalista) */}
            {dniLimpio.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                {pacienteDetectado ? (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: temaOscuro ? 'rgba(16, 185, 129, 0.12)' : '#f0fdf4',
                    border: temaOscuro ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0',
                    color: temaOscuro ? '#6ee7b7' : '#166534',
                    fontSize: '12.5px',
                    lineHeight: '1.45',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <div>
                      <strong>Carpeta Existente:</strong> El DNI <strong>{pacienteDetectado.dni}</strong> cuenta con {pacienteDetectado.total_documentos || (pacienteDetectado.documentos ? pacienteDetectado.documentos.length : 0)} documento(s). El archivo se anexará ordenadamente a su expediente.
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: temaOscuro ? 'rgba(56, 189, 248, 0.12)' : '#f0f9ff',
                    border: temaOscuro ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #bae6fd',
                    color: temaOscuro ? '#7dd3fc' : '#0369a1',
                    fontSize: '12.5px',
                    lineHeight: '1.45',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                      <line x1="12" y1="11" x2="12" y2="17"></line>
                      <line x1="9" y1="14" x2="15" y2="14"></line>
                    </svg>
                    <div>
                      <strong>Nuevo Expediente:</strong> El DNI <strong>{dniLimpio}</strong> no está registrado. Se creará automáticamente una carpeta digital exclusiva.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campo Selector de Archivo (Dropzone Minimalista) */}
          <div style={{ marginBottom: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: theme.textMain }}>
                Documento o Archivo Adjunto <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span style={{ fontSize: '11.5px', color: theme.textMuted }}>
                Formatos: PDF, Word, JPG, PNG, TXT
              </span>
            </div>

            <div
              style={{
                border: isDragging ? '2px dashed #38bdf8' : (file ? `1.5px solid ${theme.borderInput}` : `1.5px dashed ${theme.borderInput}`),
                borderRadius: '12px',
                padding: '28px 20px',
                textAlign: 'center',
                backgroundColor: isDragging ? (temaOscuro ? 'rgba(56, 189, 248, 0.1)' : '#eff6ff') : (temaOscuro ? theme.bgSubtle : '#f8fafc'),
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/*, text/plain"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'none' }}
                required
              />

              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: temaOscuro ? '#1e293b' : '#e2e8f0',
                    color: theme.textMain,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '11px',
                    letterSpacing: '0.5px'
                  }}>
                    {obtenerExtBadge(file.name)}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: theme.textMain, wordBreak: 'break-all' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px' }}>
                      {(file.size / 1024).toFixed(1)} KB · <span style={{ color: '#38bdf8', fontWeight: '600' }}>Clic para cambiar archivo</span>
                    </div>
                  </div>
                  <div style={{
                    marginLeft: 'auto',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: temaOscuro ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4',
                    border: temaOscuro ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0',
                    color: temaOscuro ? '#34d399' : '#166534',
                    fontSize: '11.5px',
                    fontWeight: '700'
                  }}>
                    ✓ Listo
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: theme.bgCard,
                    border: theme.border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px auto',
                    color: theme.textMuted,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: theme.textMain, marginBottom: '3px' }}>
                    Haz clic aquí o arrastra un archivo
                  </div>
                  <div style={{ fontSize: '12px', color: theme.textMuted }}>
                    Formatos admitidos: PDF, Word (.docx), Imágenes (.jpg, .png) y Texto (.txt)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botones de Envío Minimalistas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '10px' }}>
            <button
              type="submit"
              disabled={subiendo}
              style={{
                flex: 1,
                padding: '11px 20px',
                backgroundColor: subiendo ? (temaOscuro ? '#334155' : '#94a3b8') : theme.primaryBtnBg,
                color: theme.primaryBtnColor,
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: subiendo ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease, transform 0.1s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!subiendo) e.currentTarget.style.backgroundColor = theme.primaryBtnHover
              }}
              onMouseLeave={(e) => {
                if (!subiendo) e.currentTarget.style.backgroundColor = theme.primaryBtnBg
              }}
            >
              {subiendo ? (
                <>
                  <span>Guardando en MinIO S3 y SQL Server...</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Guardar en Carpeta del Paciente</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '11px 18px',
                backgroundColor: theme.secondaryBtnBg,
                color: theme.secondaryBtnColor,
                border: theme.secondaryBtnBorder,
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
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
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* 3. TARJETA DE INFORMACIÓN Y PROTOCOLO CLÍNICO (MINIMALISTA) */}
      <div style={{
        backgroundColor: theme.bgSubtle,
        border: theme.border,
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        color: theme.textMuted,
        fontSize: '12.5px',
        lineHeight: '1.5'
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          backgroundColor: theme.bgCard,
          border: theme.border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.textMuted,
          flexShrink: 0,
          marginTop: '2px'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div>
          <strong style={{ display: 'block', fontSize: '13px', color: theme.textMain, marginBottom: '2px' }}>
            Gestión Automatizada de Expedientes:
          </strong>
          El sistema agrupa automáticamente los archivos bajo el mismo DNI. Si el paciente ya existe en el sistema, el nuevo documento se anexa a su carpeta clínica sin duplicar expedientes.
        </div>
      </div>

    </div>
  )
}
