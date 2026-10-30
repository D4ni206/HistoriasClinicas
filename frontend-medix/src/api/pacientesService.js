// Capa de servicios para comunicación con backend Medix

export async function listarPacientes(authFetch, { page, per_page, q } = {}) {
  const params = new URLSearchParams()
  if (page) params.append('page', page)
  if (per_page) params.append('per_page', per_page)
  if (q) params.append('q', q)

  const queryStr = params.toString() ? `?${params.toString()}` : ''
  const res = await authFetch(`/pacientes${queryStr}`)
  if (!res.ok) throw new Error('No se pudieron cargar los pacientes')
  return await res.json()
}

export async function crearPaciente(authFetch, { dni, nombre, alergias }) {
  const res = await authFetch('/pacientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dni, nombre, alergias })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.mensaje || 'Error al crear el paciente')
  return data
}

export async function actualizarPaciente(authFetch, id, { dni, nombre, alergias }) {
  const res = await authFetch(`/pacientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dni, nombre, alergias })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.mensaje || 'Error al actualizar el paciente')
  return data
}

export async function eliminarPaciente(authFetch, id) {
  const res = await authFetch(`/pacientes/${id}`, { method: 'DELETE' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.mensaje || 'Error al eliminar paciente')
  return data
}

export async function subirDocumento(authFetch, formData) {
  const res = await authFetch('/documentos', {
    method: 'POST',
    body: formData
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.mensaje || 'Error al subir el archivo')
  return data
}

export async function eliminarDocumento(authFetch, id) {
  const res = await authFetch(`/documentos/${id}`, { method: 'DELETE' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.mensaje || 'Error al eliminar el documento')
  return data
}

export async function listarNotas(authFetch, pacienteId) {
  const res = await authFetch(`/pacientes/${pacienteId}/notas`)
  if (!res.ok) throw new Error('Error al listar notas médicas')
  return await res.json()
}

export async function agregarNota(authFetch, pacienteId, notaData) {
  const res = await authFetch(`/pacientes/${pacienteId}/notas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notaData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.mensaje || 'Error al registrar nota')
  return data
}

export async function eliminarNota(authFetch, id) {
  const res = await authFetch(`/notas/${id}`, { method: 'DELETE' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.mensaje || 'Error al eliminar nota')
  return data
}

export async function listarSignos(authFetch, pacienteId) {
  const res = await authFetch(`/pacientes/${pacienteId}/signos-vitales`)
  if (!res.ok) throw new Error('Error al listar signos vitales')
  return await res.json()
}

export async function agregarSignos(authFetch, pacienteId, signosData) {
  const res = await authFetch(`/pacientes/${pacienteId}/signos-vitales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signosData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.mensaje || 'Error al registrar signos vitales')
  return data
}

export async function listarUsuarios(authFetch) {
  const res = await authFetch('/usuarios')
  if (!res.ok) throw new Error('Error al listar usuarios')
  return await res.json()
}

export async function crearUsuario(authFetch, usuarioData) {
  const res = await authFetch('/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuarioData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.mensaje || 'Error al registrar usuario')
  return data
}

export async function eliminarUsuario(authFetch, id) {
  const res = await authFetch(`/usuarios/${id}`, { method: 'DELETE' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.mensaje || 'Error al eliminar usuario')
  return data
}

export async function obtenerDiagnostico(authFetch) {
  const res = await authFetch('/sistema/estado')
  if (!res.ok) throw new Error('Error al comprobar diagnóstico')
  return await res.json()
}

export async function listarSolicitudes(authFetch, estado = '') {
  const query = estado ? `?estado=${estado}` : ''
  const res = await authFetch(`/solicitudes-eliminacion${query}`)
  if (!res.ok) throw new Error('Error al listar solicitudes')
  return await res.json()
}

export async function crearSolicitud(authFetch, solicitudData) {
  const res = await authFetch('/solicitudes-eliminacion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(solicitudData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.mensaje || 'Error al enviar solicitud')
  return data
}

export async function aprobarSolicitud(authFetch, id, respuestaAdmin) {
  const res = await authFetch(`/solicitudes-eliminacion/${id}/aprobar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ respuesta_admin: respuestaAdmin })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.mensaje || 'Error al aprobar solicitud')
  return data
}

export async function rechazarSolicitud(authFetch, id, respuestaAdmin) {
  const res = await authFetch(`/solicitudes-eliminacion/${id}/rechazar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ respuesta_admin: respuestaAdmin })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.mensaje || 'Error al rechazar solicitud')
  return data
}
