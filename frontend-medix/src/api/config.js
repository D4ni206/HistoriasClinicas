// Detección dinámica del host para permitir acceso local y desde otra PC en la misma red LAN
const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1'

export const API_BASE = `http://${host}:5000/api`
