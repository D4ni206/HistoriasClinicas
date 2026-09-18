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
    bg = '#F3C7B6'
    color = '#70220e'
    border = '#e19d85'
  } else if (esDocx(nombre)) {
    tipo = 'DOCX'
    bg = '#A7C7D9'
    color = '#0c354e'
    border = '#84aabd'
  } else if (esImagen(nombre)) {
    tipo = 'IMG'
    bg = '#CFE7D6'
    color = '#134e2b'
    border = '#9ec6ac'
  } else if (esTexto(nombre)) {
    tipo = 'TXT'
    bg = '#FFF2B6'
    color = '#634706'
    border = '#F6E38F'
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
