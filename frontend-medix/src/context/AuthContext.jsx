import { createContext, useContext, useState, useEffect } from 'react'
import { API_BASE } from '../api/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('medix_token') || null
    } catch {
      return null
    }
  })

  const [usuario, setUsuario] = useState(() => {
    try {
      const u = localStorage.getItem('medix_usuario')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })

  const [debeCambiarPassword, setDebeCambiarPassword] = useState(() => {
    try {
      return localStorage.getItem('medix_cambiar_pwd') === 'true'
    } catch {
      return false
    }
  })

  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false)

  // Guardar token y usuario en localStorage ante cambios
  useEffect(() => {
    if (token) {
      localStorage.setItem('medix_token', token)
    } else {
      localStorage.removeItem('medix_token')
    }
  }, [token])

  useEffect(() => {
    if (usuario) {
      localStorage.setItem('medix_usuario', JSON.stringify(usuario))
    } else {
      localStorage.removeItem('medix_usuario')
    }
  }, [usuario])

  useEffect(() => {
    if (debeCambiarPassword) {
      localStorage.setItem('medix_cambiar_pwd', 'true')
      setModalPasswordAbierto(true)
    } else {
      localStorage.removeItem('medix_cambiar_pwd')
    }
  }, [debeCambiarPassword])

  // Normalización de roles
  const rolRaw = (usuario?.rol || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  const esAdmin = rolRaw.includes('admin')
  const esMedico = rolRaw.includes('medico')
  const esEnfermera = rolRaw.includes('enfermer')

  // Iniciar Sesión con respuesta directa del servidor
  const iniciarSesionConDatos = (data) => {
    if (!data) return
    const t = data.token
    const u = data.usuario
    const d = Boolean(data.debe_cambiar_password)

    if (t) {
      try { localStorage.setItem('medix_token', t) } catch (e) {}
      setToken(t)
    }
    if (u) {
      try { localStorage.setItem('medix_usuario', JSON.stringify(u)) } catch (e) {}
      setUsuario(u)
    }
    setDebeCambiarPassword(d)
    if (d) {
      try { localStorage.setItem('medix_cambiar_pwd', 'true') } catch (e) {}
      setModalPasswordAbierto(true)
    } else {
      try { localStorage.removeItem('medix_cambiar_pwd') } catch (e) {}
      setModalPasswordAbierto(false)
    }
  }

  // Iniciar Sesión
  const login = async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.mensaje || 'Error al iniciar sesión')
    }

    setToken(data.token)
    setUsuario(data.usuario)
    setDebeCambiarPassword(Boolean(data.debe_cambiar_password))
    return data
  }

  // Cerrar Sesión
  const logout = () => {
    setToken(null)
    setUsuario(null)
    setDebeCambiarPassword(false)
    setModalPasswordAbierto(false)
    localStorage.removeItem('medix_token')
    localStorage.removeItem('medix_usuario')
    localStorage.removeItem('medix_cambiar_pwd')
  }

  // Wrapper fetch con token de autorización automático
  const authFetch = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
    const headers = {
      ...(options.headers || {})
    }

    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('medix_token') : null)
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`
    }

    const res = await fetch(url, {
      ...options,
      headers
    })

    if (res.status === 401 && activeToken) {
      // Si el backend indica token expirado/invalido habiendo enviado token, forzar logout
      logout()
    }

    return res
  }

  // Cambiar Contraseña
  const cambiarPassword = async (passwordActual, nuevaPassword) => {
    const res = await authFetch('/auth/cambiar-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password_actual: passwordActual,
        nueva_password: nuevaPassword
      })
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.mensaje || 'Error al cambiar la contraseña')
    }

    if (data.token) {
      setToken(data.token)
    }
    if (data.usuario) {
      setUsuario(data.usuario)
    }
    setDebeCambiarPassword(false)
    setModalPasswordAbierto(false)
    return data
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        usuario,
        setUsuario,
        iniciarSesionConDatos,
        esAdmin,
        esMedico,
        esEnfermera,
        rol: usuario?.rol || '',
        debeCambiarPassword,
        setDebeCambiarPassword,
        modalPasswordAbierto,
        setModalPasswordAbierto,
        abrirModalPassword: () => setModalPasswordAbierto(true),
        cerrarModalPassword: () => setModalPasswordAbierto(false),
        login,
        logout,
        authFetch,
        cambiarPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider')
  }
  return context
}
