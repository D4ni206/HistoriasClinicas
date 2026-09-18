import { useState, useEffect } from 'react'

export default function TextViewer({ url }) {
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch(url)
      .then(r => r.text())
      .then(t => { setTexto(t); setCargando(false) })
      .catch(() => setCargando(false))
  }, [url])

  return (
    <div style={{ width: '100%', height: '75vh', overflow: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', padding: '20px' }}>
      {cargando ? <p style={{ color: '#4b5563' }}>Cargando texto...</p> : <pre style={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: '#111827', fontSize: '13px' }}>{texto}</pre>}
    </div>
  )
}
