import { useState } from 'react'

function App() {
  const [dni, setDni] = useState('')
  const [file, setFile] = useState(null)
  const [mensaje, setMensaje] = useState('')

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !dni) {
      setMensaje('Por favor ingresa el DNI y selecciona un archivo.')
      return
    }

    const formData = new FormData()
    formData.append('dni', dni)
    formData.append('archivo', file)

    try {
      const response = await fetch('http://localhost:5000/api/documentos', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setMensaje(data.mensaje || 'Error al subir el archivo')
    } catch (error) {
      setMensaje('Error de conexión con el servidor.')
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Banco de Historias Clínicas - Digitalización</h1>
      <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input 
          type="text" 
          placeholder="DNI del Paciente" 
          value={dni} 
          onChange={(e) => setDni(e.target.value)} 
        />
        <input 
          type="file" 
          accept="application/pdf, image/*" 
          onChange={(e) => setFile(e.target.files[0])} 
        />
        <button type="submit">Subir Documento</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  )
}

export default App