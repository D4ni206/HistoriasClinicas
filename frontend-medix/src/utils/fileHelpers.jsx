export const esPdf = (nombre = '') => nombre.toLowerCase().endsWith('.pdf')
export const esDocx = (nombre = '') => /\.(docx|doc)$/i.test(nombre)
export const esImagen = (nombre = '') => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(nombre)
export const esTexto = (nombre = '') => /\.(txt|csv|log|json|xml)$/i.test(nombre)

export const obtenerIconoArchivo = (nombre = '') => {
  let tipo = 'DOC'
  let bg = '#f3f4f6'
  let color = '#374151'
  let border = '#d1d5db'

  if (esPdf(nombre)) {
    tipo = 'PDF'
    bg = '#FFD6E8'
    color = '#802048'
    border = '#f4a7c7'
  } else if (esDocx(nombre)) {
    tipo = 'DOCX'
    bg = '#7FD6FF'
    color = '#104060'
    border = '#54bde8'
  } else if (esImagen(nombre)) {
    tipo = 'IMG'
    bg = '#6FE3B4'
    color = '#0a5438'
    border = '#4cc799'
  } else if (esTexto(nombre)) {
    tipo = 'TXT'
    bg = '#FFF6FB'
    color = '#2B4A66'
    border = '#e2c5d5'
  }

  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 6px',
      fontSize: '11px',
      fontWeight: '700',
      borderRadius: '4px',
      backgroundColor: bg,
      color: color,
      border: `1px solid ${border}`,
      letterSpacing: '0.5px'
    }}>
      {tipo}
    </span>
  )
}
