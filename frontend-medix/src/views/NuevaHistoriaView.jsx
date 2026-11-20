import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import * as api from '../api/pacientesService'

function obtenerFechaActualPeru() {
  const hoy = new Date()
  const dd = String(hoy.getDate()).padStart(2, '0')
  const mm = String(hoy.getMonth() + 1).padStart(2, '0')
  const yyyy = hoy.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function obtenerHoraActual() {
  const ahora = new Date()
  const hh = String(ahora.getHours()).padStart(2, '0')
  const min = String(ahora.getMinutes()).padStart(2, '0')
  return `${hh}:${min}`
}

function crearEstadoInicialEmergencia(dniInicial = '', nombreInicial = '', alergiasInicial = '', usuario = null) {
  return {
    codigo_atencion: `2026-${Math.floor(10000 + Math.random() * 89999)}`,
    dni: dniInicial || '',
    nro_historia: dniInicial ? `${dniInicial} - Manual` : '',
    nro_cuenta: '',
    apellidos_nombres: nombreInicial || '',
    edad: '',
    fecha_ingreso: obtenerFechaActualPeru(),
    fecha_nacimiento: '',
    hora_ingreso: obtenerHoraActual(),
    sexo: '',
    consultorio: 'Emergencia Medicina General',
    medico: (usuario?.nombres_completos || usuario?.username || '').toUpperCase(),
    gravedad: '',
    prioridad: null,
    telefono: '',
    direccion: '',
    provincia: '',
    departamento: '',
    distrito: '',
    centro_poblado: '',
    acompanante: '',
    usuario_registro: (usuario?.username || '').toUpperCase(),
    alergias: alergiasInicial || '',
    // Funciones vitales
    peso: '',
    talla: '',
    presion_arterial: '',
    frec_respiratoria: '',
    pulso: '',
    temperatura: '',
    frec_cardiaca: '',
    // Cuerpo clínico
    anamnesis: '',
    antecedentes: '',
    examen_fisico: '',
    examenes_auxiliares: '',
    plan_trabajo: '',
    terapeutica: '',
    // Pie de formato
    diagnosticos: [
      { descripcion: '', tipo: 'D', cie10: '' },
      { descripcion: '', tipo: 'P', cie10: '' }
    ],
    fecha_hora_alta: '',
    destino_alta: ''
  }
}

function generarHtmlHistoriaEmergencia(f) {
  const diagFilas = (f.diagnosticos || [])
    .filter(d => d.descripcion && d.descripcion.trim())
    .map((d, idx) => `
      <tr>
        <td style="border:1px solid #000;padding:5px 8px;">${idx + 1}. ${d.descripcion}</td>
        <td style="border:1px solid #000;padding:5px;text-align:center;width:32px;">${d.tipo === 'P' ? 'X' : ''}</td>
        <td style="border:1px solid #000;padding:5px;text-align:center;width:32px;">${d.tipo === 'D' ? 'X' : ''}</td>
        <td style="border:1px solid #000;padding:5px 8px;width:90px;">${d.cie10 || ''}</td>
      </tr>
    `).join('') || `
      <tr>
        <td style="border:1px solid #000;padding:10px 8px;">1...</td>
        <td style="border:1px solid #000;padding:5px;text-align:center;width:32px;">P</td>
        <td style="border:1px solid #000;padding:5px;text-align:center;width:32px;">D</td>
        <td style="border:1px solid #000;padding:5px 8px;width:90px;"></td>
      </tr>
    `

  const destinos = ['HOSPITALIZACION', 'DOMICILIO', 'TRANSFERENCIA', 'C. EXT', 'MORGUE']
  const destinosHtml = destinos
    .map(dest => `[ ${f.destino_alta === dest ? 'X' : ' '} ] ${dest}`)
    .join('&nbsp;&nbsp;&nbsp;&nbsp;')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Historia Clínica de Emergencia - DNI ${f.dni}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #111; margin: 24px; line-height: 1.4; }
  .header-top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1.5px solid #000; padding-bottom: 8px; margin-bottom: 10px; }
  .header-center { text-align: center; flex: 1; }
  .header-center h1 { font-size: 15px; margin: 6px 0 2px 0; letter-spacing: 0.3px; }
  .header-center p { margin: 1px 0; font-size: 10.5px; }
  .filiacion-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 6px 20px; margin-bottom: 12px; font-size: 11.5px; }
  .fila-dato { display: flex; gap: 6px; }
  .fila-dato strong { min-width: 120px; display: inline-block; }
  table.vitales { width: 100%; border-collapse: collapse; margin: 6px 0 14px 0; font-size: 11.5px; }
  table.vitales th, table.vitales td { border: 1px solid #000; padding: 6px 8px; text-align: center; }
  table.vitales th { background: #f3f4f6; font-weight: bold; }
  .seccion-clinica { display: grid; grid-template-columns: 135px 1fr; gap: 10px; margin-bottom: 14px; min-height: 44px; border-bottom: 1px dotted #ccc; padding-bottom: 8px; }
  .seccion-titulo { font-weight: bold; font-size: 11.5px; }
  .seccion-texto { white-space: pre-wrap; font-size: 12px; }
  .footer-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
  .footer-table td, .footer-table th { border: 1px solid #000; padding: 6px 8px; }
</style>
</head>
<body>
  <div class="header-top">
    <div style="font-size:10px;line-height:1.3;">
      <strong>Ministerio de Salud</strong><br/>
      SISGALENPLUS
    </div>
    <div class="header-center">
      <p><strong>HOSP. SAN JUAN DE DIOS DE PISCO</strong></p>
      <p>MZA B LOTE 5 FND. ALTO LA LUNA (AV. FERMIN TANGUIS)</p>
      <p>TELEFONO: 056-535718</p>
      <h1>HISTORIA CLÍNICA DE EMERGENCIA &nbsp;&nbsp; ${f.codigo_atencion}</h1>
    </div>
    <div style="font-size:10px;text-align:right;">
      ${f.fecha_ingreso}<br/>
      ${f.hora_ingreso}<br/>
      Página 1 de 1
    </div>
  </div>

  <div class="filiacion-grid">
    <div class="fila-dato"><strong>Nro Historia</strong> <span>${f.nro_historia || ''}</span></div>
    <div class="fila-dato"><strong>Nro Cuenta</strong> <span>${f.nro_cuenta || ''}</span></div>

    <div class="fila-dato"><strong>Apellidos Y Nombres</strong> <span><strong>${f.apellidos_nombres}</strong></span></div>
    <div class="fila-dato"><strong>Edad</strong> <span>${f.edad}</span></div>

    <div class="fila-dato"><strong>Fecha ingreso</strong> <span>${f.fecha_ingreso}</span></div>
    <div class="fila-dato"><strong>Fecha nacimiento</strong> <span>${f.fecha_nacimiento}</span></div>

    <div class="fila-dato"><strong>Hora ingreso</strong> <span>${f.hora_ingreso}</span></div>
    <div class="fila-dato"><strong>Sexo</strong> <span>${f.sexo}</span></div>

    <div class="fila-dato"><strong>Consultorio médico</strong> <span>${f.consultorio}</span></div>
    <div class="fila-dato"><strong>DNI:</strong> <span><strong>${f.dni}</strong></span></div>

    <div class="fila-dato"><strong>Médico</strong> <span>${f.medico}</span></div>
    <div class="fila-dato"><strong>GRAVEDAD:</strong> <span>${f.gravedad || ''}${f.prioridad ? ` (Prioridad ${f.prioridad})` : ''}</span></div>

    <div class="fila-dato"><strong>Teléfono</strong> <span>${f.telefono || '—'}</span></div>
    <div class="fila-dato"><strong>Provincia</strong> <span>${f.provincia}</span></div>

    <div class="fila-dato"><strong>Dirección</strong> <span>${f.direccion}</span></div>
    <div class="fila-dato"><strong>Centro Poblado</strong> <span>${f.centro_poblado}</span></div>

    <div class="fila-dato"><strong>Departamento</strong> <span>${f.departamento}</span></div>
    <div class="fila-dato"><strong>USUARIO:</strong> <span>${f.usuario_registro}</span></div>

    <div class="fila-dato"><strong>Distrito</strong> <span>${f.distrito}</span></div>
    <div class="fila-dato"><strong>Acompañante</strong> <span>${f.acompanante || '—'}</span></div>
  </div>

  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
    <strong>FUNCIONES VITALES :</strong>
    <span style="font-size:11.5px;"><strong>Peso:</strong> ${f.peso || '—'} kg &nbsp;&nbsp;&nbsp; <strong>Talla:</strong> ${f.talla || '—'} m</span>
  </div>
  <table class="vitales">
    <thead>
      <tr>
        <th>Presion Arterial</th>
        <th>Frec. Respiratoria</th>
        <th>Pulso</th>
        <th>Temperatura</th>
        <th>Frec. Cardiaca</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${f.presion_arterial || '—'}</td>
        <td>${f.frec_respiratoria || '—'}</td>
        <td>${f.pulso || '—'}</td>
        <td>${f.temperatura || '—'}</td>
        <td>${f.frec_cardiaca || '—'}</td>
      </tr>
    </tbody>
  </table>

  <div class="seccion-clinica"><div class="seccion-titulo">Anamnesis</div><div class="seccion-texto">${f.anamnesis || ''}</div></div>
  <div class="seccion-clinica"><div class="seccion-titulo">Antecedentes</div><div class="seccion-texto">${f.antecedentes || ''}${f.alergias ? `\nAlergias: ${f.alergias}` : ''}</div></div>
  <div class="seccion-clinica"><div class="seccion-titulo">Examen Físico</div><div class="seccion-texto">${f.examen_fisico || ''}</div></div>
  <div class="seccion-clinica"><div class="seccion-titulo">Examenes Auxiliares</div><div class="seccion-texto">${f.examenes_auxiliares || ''}</div></div>
  <div class="seccion-clinica"><div class="seccion-titulo">Plan de Trabajo</div><div class="seccion-texto">${f.plan_trabajo || ''}</div></div>
  <div class="seccion-clinica"><div class="seccion-titulo">Terapeutica a seguir</div><div class="seccion-texto">${f.terapeutica || ''}</div></div>

  <table class="footer-table">
    <tbody>
      ${diagFilas}
      <tr>
        <td colspan="2"><strong>Médico:</strong> ${f.medico}</td>
        <td colspan="2"><strong>Fecha y Hora de Alta:</strong> ${f.fecha_hora_alta || '—'} &nbsp;|&nbsp; <strong>Sello y Firma</strong></td>
      </tr>
      <tr>
        <td colspan="4" style="text-align:center;font-weight:bold;">
          ${destinosHtml}
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`
}

export default function NuevaHistoriaView({
  dni,
  setDni,
  nombre = '',
  setNombre = () => {},
  alergias = '',
  setAlergias = () => {},
  file,
  setFile,
  fileInputRef,
  subiendo,
  pacientes = [],
  handleUpload
}) {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { usuario, authFetch } = useAuth()

  const [modoRegistro, setModoRegistro] = useState('formato_emergencia')
  const [consultandoReniec, setConsultandoReniec] = useState(false)
  const [estadoReniec, setEstadoReniec] = useState({ tipo: '', texto: '' })
  const [guardandoFormato, setGuardandoFormato] = useState(false)
  const [alertaLocal, setAlertaLocal] = useState({ tipo: '', texto: '' })
  const ultimoDniConsultadoRef = useRef('')

  const [formEmergencia, setFormEmergencia] = useState(() =>
    crearEstadoInicialEmergencia(dni, nombre, alergias, usuario)
  )

  const calcularEdadExacta = (fechaStr) => {
    if (!fechaStr) return ''
    let dia = 0
    let mes = 0
    let anio = 0
    const limpio = String(fechaStr).trim()
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(limpio)) {
      const partes = limpio.split('/')
      dia = parseInt(partes[0], 10)
      mes = parseInt(partes[1], 10)
      anio = parseInt(partes[2], 10)
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(limpio)) {
      const partes = limpio.split('-')
      anio = parseInt(partes[0], 10)
      mes = parseInt(partes[1], 10)
      dia = parseInt(partes[2], 10)
    }
    if (anio < 1900 || anio > new Date().getFullYear()) return ''
    const hoy = new Date()
    let edadCalc = hoy.getFullYear() - anio
    const mesActual = hoy.getMonth() + 1
    const diaActual = hoy.getDate()
    if (mesActual < mes || (mesActual === mes && diaActual < dia)) {
      edadCalc -= 1
    }
    return `${Math.max(0, edadCalc)} Años`
  }

  const actualizarCampo = (campo, valor) => {
    setFormEmergencia(prev => {
      const next = { ...prev, [campo]: valor }
      if (campo === 'dni') {
        next.nro_historia = valor ? `${valor} - Manual` : ''
        if (setDni) setDni(valor)
      }
      if (campo === 'fecha_nacimiento') {
        const edadAuto = calcularEdadExacta(valor)
        if (edadAuto) next.edad = edadAuto
      }
      if (campo === 'apellidos_nombres' && setNombre) {
        setNombre(valor)
      }
      if (campo === 'alergias' && setAlergias) {
        setAlergias(valor)
      }
      if (campo === 'prioridad') {
        const mapaGravedad = {
          1: 'Prioridad I - Emerg. crítica',
          2: 'Prioridad II - Emerg. mayor',
          3: 'Prioridad III - Emerg. moderada',
          4: 'Emerg. leve (sem=4)'
        }
        next.gravedad = mapaGravedad[valor] || next.gravedad
      }
      return next
    })
  }

  const limpiarFormularioEmergencia = () => {
    ultimoDniConsultadoRef.current = ''
    setEstadoReniec({ tipo: '', texto: '' })
    setAlertaLocal({ tipo: '', texto: '' })
    if (setDni) setDni('')
    if (setNombre) setNombre('')
    if (setAlergias) setAlergias('')
    setFormEmergencia(crearEstadoInicialEmergencia('', '', '', usuario))
  }

  // Búsqueda mejorada de DNI (verifica primero expediente local y luego consulta API RENIEC)
  const buscarDatosReniec = async (dniBuscar, forzar = false) => {
    const limpio = String(dniBuscar || '').replace(/\D/g, '')
    if (limpio.length !== 8) {
      setEstadoReniec({ tipo: 'error', texto: 'Ingrese los 8 dígitos del DNI para realizar la búsqueda.' })
      return
    }
    if (!forzar && ultimoDniConsultadoRef.current === limpio) {
      return
    }
    ultimoDniConsultadoRef.current = limpio
    setConsultandoReniec(true)
    setEstadoReniec({ tipo: 'info', texto: 'Consultando datos del DNI en RENIEC...' })

    const pacLocal = pacientes.find(p => p.dni && String(p.dni).trim() === limpio)

    try {
      const data = await api.consultarReniec(authFetch, limpio)
      const nombreResuelto = (pacLocal?.nombre || data.apellidos_nombres || '').trim()
      const alergiasResueltas = (pacLocal?.alergias || data.alergias || '').trim()

      setFormEmergencia(prev => ({
        ...prev,
        dni: limpio,
        nro_historia: `${limpio} - Manual`,
        apellidos_nombres: nombreResuelto || prev.apellidos_nombres,
        fecha_nacimiento: data.fecha_nacimiento_Per || data.fecha_nacimiento || prev.fecha_nacimiento,
        edad: data.edad || prev.edad,
        sexo: data.sexo || prev.sexo,
        direccion: data.direccion || prev.direccion,
        departamento: data.departamento || prev.departamento,
        provincia: data.provincia || prev.provincia,
        distrito: data.distrito || prev.distrito,
        centro_poblado: data.centro_poblado || data.distrito || prev.centro_poblado,
        alergias: alergiasResueltas || prev.alergias
      }))
      if (setDni) setDni(limpio)
      if (setNombre && nombreResuelto) setNombre(nombreResuelto)
      if (setAlergias && alergiasResueltas) setAlergias(alergiasResueltas)

      setEstadoReniec({
        tipo: 'exito',
        texto: pacLocal
          ? `Expediente existente encontrado y datos RENIEC completados (DNI ${limpio}).`
          : `Datos filiatorios cargados desde RENIEC para el DNI ${limpio}.`
      })
    } catch (err) {
      setEstadoReniec({ tipo: 'error', texto: err.message || 'No se pudo consultar el DNI.' })
    } finally {
      setConsultandoReniec(false)
    }
  }

  useEffect(() => {
    const limpio = String(formEmergencia.dni || '').replace(/\D/g, '')
    if (limpio.length === 8 && ultimoDniConsultadoRef.current !== limpio) {
      buscarDatosReniec(limpio, false)
    } else if (limpio.length < 8) {
      ultimoDniConsultadoRef.current = ''
      setEstadoReniec({ tipo: '', texto: '' })
    }
  }, [formEmergencia.dni])

  const actualizarDiagnostico = (index, campo, valor) => {
    setFormEmergencia(prev => {
      const copia = [...prev.diagnosticos]
      copia[index] = { ...copia[index], [campo]: valor }
      return { ...prev, diagnosticos: copia }
    })
  }

  const handleImprimirFormato = () => {
    const html = generarHtmlHistoriaEmergencia(formEmergencia)
    const ventana = window.open('', '_blank', 'width=920,height=800')
    if (ventana) {
      ventana.document.open()
      ventana.document.write(html)
      ventana.document.close()
      ventana.focus()
      setTimeout(() => ventana.print(), 250)
    }
  }

  const handleGuardarFormatoEmergencia = async (e) => {
    e.preventDefault()
    const dniLimpio = String(formEmergencia.dni || '').replace(/\D/g, '')
    if (!dniLimpio || dniLimpio.length < 8) {
      setAlertaLocal({ tipo: 'error', texto: 'El DNI del paciente (8 dígitos) es obligatorio.' })
      return
    }
    if (!formEmergencia.apellidos_nombres.trim()) {
      setAlertaLocal({ tipo: 'error', texto: 'El nombre completo del paciente es obligatorio.' })
      return
    }

    setGuardandoFormato(true)
    setAlertaLocal({ tipo: '', texto: '' })
    try {
      const htmlString = generarHtmlHistoriaEmergencia(formEmergencia)
      const blob = new Blob([htmlString], { type: 'text/html' })
      const nombreArchivo = `HC_Emergencia_${dniLimpio}_${formEmergencia.codigo_atencion}.html`
      const archivoHtml = new File([blob], nombreArchivo, { type: 'text/html' })

      const formData = new FormData()
      formData.append('dni', dniLimpio)
      formData.append('nombre', formEmergencia.apellidos_nombres.trim())
      if (formEmergencia.alergias.trim()) {
        formData.append('alergias', formEmergencia.alergias.trim())
      }
      formData.append('archivo', archivoHtml)

      const resDoc = await api.subirDocumento(authFetch, formData)
      const pacienteId = resDoc?.documento?.paciente_id

      if (
        pacienteId &&
        (formEmergencia.presion_arterial || formEmergencia.temperatura || formEmergencia.frec_cardiaca || formEmergencia.peso || formEmergencia.talla)
      ) {
        try {
          await api.agregarSignos(authFetch, pacienteId, {
            enfermera_nombre: formEmergencia.medico,
            presion_arterial: formEmergencia.presion_arterial,
            frecuencia_cardiaca: formEmergencia.frec_cardiaca || formEmergencia.pulso,
            temperatura: formEmergencia.temperatura,
            peso: formEmergencia.peso,
            talla: formEmergencia.talla,
            observaciones: `Triaje Emergencia (${formEmergencia.consultorio}) - FR: ${formEmergencia.frec_respiratoria || '—'}`
          })
        } catch {
          // Continuar si falla el registro secundario de signos
        }
      }

      if (pacienteId && (formEmergencia.anamnesis || formEmergencia.examen_fisico || formEmergencia.plan_trabajo || formEmergencia.terapeutica)) {
        const partesNota = [
          `[HISTORIA CLÍNICA DE EMERGENCIA ${formEmergencia.codigo_atencion}]`,
          `Consultorio: ${formEmergencia.consultorio} | Edad: ${formEmergencia.edad || 'N/R'}${formEmergencia.prioridad ? ` | Prioridad: ${formEmergencia.prioridad}` : ''}`,
          formEmergencia.anamnesis ? `Anamnesis: ${formEmergencia.anamnesis}` : '',
          formEmergencia.antecedentes ? `Antecedentes: ${formEmergencia.antecedentes}` : '',
          formEmergencia.examen_fisico ? `Examen Físico: ${formEmergencia.examen_fisico}` : '',
          formEmergencia.plan_trabajo ? `Plan de Trabajo: ${formEmergencia.plan_trabajo}` : '',
          formEmergencia.terapeutica ? `Terapéutica: ${formEmergencia.terapeutica}` : ''
        ].filter(Boolean).join('\n')

        try {
          await api.agregarNota(authFetch, pacienteId, {
            medico_nombre: formEmergencia.medico,
            contenido: partesNota
          })
        } catch {
          // Continuar si falla la nota secundaria
        }
      }

      setAlertaLocal({
        tipo: 'exito',
        texto: `Historia Clínica de Emergencia (${formEmergencia.codigo_atencion}) guardada exitosamente.`
      })
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 900)
    } catch (err) {
      setAlertaLocal({ tipo: 'error', texto: err.message || 'Error al guardar la Historia Clínica de Emergencia.' })
    } finally {
      setGuardandoFormato(false)
    }
  }

  const dniLimpio = (dni || '').trim()
  const pacienteDetectado = pacientes.find(p => p.dni && p.dni.trim() === dniLimpio)

  return (
    <div style={{ maxWidth: '1040px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="medix-page-title">Historia Clínica de Emergencia</h1>
          <p className="medix-page-subtitle">
            Formato oficial SISGALENPLUS — Hospital San Juan de Dios de Pisco
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div className="medix-card" style={{ display: 'inline-flex', padding: '3px', gap: '4px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setModoRegistro('formato_emergencia')}
              className="medix-btn medix-btn-sm"
              style={{
                backgroundColor: modoRegistro === 'formato_emergencia' ? 'var(--color-navy)' : 'transparent',
                color: modoRegistro === 'formato_emergencia' ? '#FFFFFF' : theme.textSecondary
              }}
            >
              Formato Emergencia
            </button>
            <button
              type="button"
              onClick={() => setModoRegistro('subir_archivo')}
              className="medix-btn medix-btn-sm"
              style={{
                backgroundColor: modoRegistro === 'subir_archivo' ? 'var(--color-navy)' : 'transparent',
                color: modoRegistro === 'subir_archivo' ? '#FFFFFF' : theme.textSecondary
              }}
            >
              Adjuntar Archivo Escaneado
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="medix-btn medix-btn-secondary"
          >
            Volver a la tabla
          </button>
        </div>
      </div>

      {alertaLocal.texto && (
        <div
          role="alert"
          className={alertaLocal.tipo === 'error' ? 'medix-badge-alert' : 'medix-badge-status'}
          style={{ padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
        >
          {alertaLocal.texto}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODO 1: FORMATO OFICIAL HISTORIA CLÍNICA DE EMERGENCIA (SISGALENPLUS) */}
      {/* =================================================================== */}
      {modoRegistro === 'formato_emergencia' && (
        <form onSubmit={handleGuardarFormatoEmergencia} className="medix-card" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* ENCABEZADO OFICIAL DE LA HOJA DE EMERGENCIA */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid var(--color-navy)',
              paddingBottom: '14px',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '12px', color: theme.textSecondary, lineHeight: 1.35 }}>
              <strong style={{ color: theme.textHeading, display: 'block', fontSize: '13px' }}>Ministerio de Salud</strong>
              <span>SISGALENPLUS</span>
            </div>

            <div style={{ textAlign: 'center', flex: '1 1 360px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: theme.textHeading }}>
                HOSP. SAN JUAN DE DIOS DE PISCO
              </div>
              <div style={{ fontSize: '11.5px', color: theme.textSecondary }}>
                MZA B LOTE 5 FND. ALTO LA LUNA (AV. FERMIN TANGUIS) · TELEFONO: 056-535718
              </div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: theme.textHeading, marginTop: '6px', letterSpacing: '0.2px' }}>
                HISTORIA CLÍNICA DE EMERGENCIA &nbsp; {formEmergencia.codigo_atencion}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: theme.textSecondary, textAlign: 'right', lineHeight: 1.4 }}>
              <div>{formEmergencia.fecha_ingreso}</div>
              <div>{formEmergencia.hora_ingreso}</div>
              <div>Página 1 de 1</div>
            </div>
          </div>

          {/* BUSCADOR DE DNI CON CONSULTA AUTOMÁTICA A RENIEC */}
          <div
            style={{
              backgroundColor: theme.bgSubtle,
              border: theme.border,
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: '1 1 460px' }}>
              <label htmlFor="hc-dni-reniec" style={{ fontSize: '12px', fontWeight: 700, color: theme.textHeading }}>
                Buscar por DNI (RENIEC):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  id="hc-dni-reniec"
                  type="text"
                  inputMode="numeric"
                  className="medix-input"
                  maxLength={8}
                  placeholder="Ingrese 8 dígitos"
                  value={formEmergencia.dni}
                  onChange={(e) => actualizarCampo('dni', e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      buscarDatosReniec(formEmergencia.dni, true)
                    }
                  }}
                  style={{ width: '160px', fontWeight: 700 }}
                />
                <span style={{ fontSize: '11px', color: theme.textSecondary, minWidth: '34px' }}>
                  {formEmergencia.dni.length}/8
                </span>
              </div>

              <button
                type="button"
                onClick={() => buscarDatosReniec(formEmergencia.dni, true)}
                disabled={consultandoReniec || formEmergencia.dni.length !== 8}
                className="medix-btn medix-btn-primary medix-btn-sm"
              >
                {consultandoReniec ? 'Buscando...' : 'Buscar en RENIEC'}
              </button>

              {formEmergencia.dni && (
                <button
                  type="button"
                  onClick={limpiarFormularioEmergencia}
                  className="medix-btn medix-btn-secondary medix-btn-sm"
                >
                  Limpiar datos
                </button>
              )}
            </div>

            {estadoReniec.texto && (
              <span
                className={
                  estadoReniec.tipo === 'error'
                    ? 'medix-badge medix-badge-alert'
                    : estadoReniec.tipo === 'exito'
                    ? 'medix-badge medix-badge-status'
                    : 'medix-badge medix-badge-neutral'
                }
              >
                {estadoReniec.texto}
              </span>
            )}
          </div>

          {/* BLOQUE 1: FILIACIÓN Y DATOS DE INGRESO (2 COLUMNAS COMO EL FORMATO IMPRESO) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '12px 24px' }}>
            {/* Columna Izquierda */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-nro-historia" className="medix-label" style={{ marginBottom: 0 }}>Nro Historia</label>
                <input
                  id="hc-nro-historia"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.nro_historia}
                  onChange={(e) => actualizarCampo('nro_historia', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-apellidos-nombres" className="medix-label" style={{ marginBottom: 0 }}>Apellidos Y Nombres</label>
                <input
                  id="hc-apellidos-nombres"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.apellidos_nombres}
                  onChange={(e) => actualizarCampo('apellidos_nombres', e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-fecha-ingreso" className="medix-label" style={{ marginBottom: 0 }}>Fecha ingreso</label>
                <input
                  id="hc-fecha-ingreso"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.fecha_ingreso}
                  onChange={(e) => actualizarCampo('fecha_ingreso', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-hora-ingreso" className="medix-label" style={{ marginBottom: 0 }}>Hora ingreso</label>
                <input
                  id="hc-hora-ingreso"
                  type="time"
                  className="medix-input"
                  value={formEmergencia.hora_ingreso}
                  onChange={(e) => actualizarCampo('hora_ingreso', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-consultorio" className="medix-label" style={{ marginBottom: 0 }}>Consultorio médico</label>
                <select
                  id="hc-consultorio"
                  className="medix-input"
                  value={formEmergencia.consultorio}
                  onChange={(e) => actualizarCampo('consultorio', e.target.value)}
                >
                  <option value="Emergencia Gineco Obstetricia">Emergencia Gineco Obstetricia</option>
                  <option value="Emergencia Medicina General">Emergencia Medicina General</option>
                  <option value="Emergencia Pediatría">Emergencia Pediatría</option>
                  <option value="Emergencia Cirugía">Emergencia Cirugía</option>
                  <option value="Tópico / Trauma Shock">Tópico / Trauma Shock</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-medico" className="medix-label" style={{ marginBottom: 0 }}>Médico</label>
                <input
                  id="hc-medico"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.medico}
                  onChange={(e) => actualizarCampo('medico', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-telefono" className="medix-label" style={{ marginBottom: 0 }}>Teléfono</label>
                <input
                  id="hc-telefono"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.telefono}
                  onChange={(e) => actualizarCampo('telefono', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-direccion" className="medix-label" style={{ marginBottom: 0 }}>Dirección (RENIEC)</label>
                <input
                  id="hc-direccion"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.direccion}
                  onChange={(e) => actualizarCampo('direccion', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-departamento" className="medix-label" style={{ marginBottom: 0 }}>Departamento (RENIEC)</label>
                <input
                  id="hc-departamento"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.departamento}
                  onChange={(e) => actualizarCampo('departamento', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-distrito" className="medix-label" style={{ marginBottom: 0 }}>Distrito (RENIEC)</label>
                <input
                  id="hc-distrito"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.distrito}
                  onChange={(e) => actualizarCampo('distrito', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-acompanante" className="medix-label" style={{ marginBottom: 0 }}>Acompañante</label>
                <input
                  id="hc-acompanante"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.acompanante}
                  onChange={(e) => actualizarCampo('acompanante', e.target.value)}
                />
              </div>
            </div>

            {/* Columna Derecha */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-nro-cuenta" className="medix-label" style={{ marginBottom: 0 }}>Nro Cuenta</label>
                <input
                  id="hc-nro-cuenta"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.nro_cuenta}
                  onChange={(e) => actualizarCampo('nro_cuenta', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-edad" className="medix-label" style={{ marginBottom: 0 }}>Edad</label>
                <input
                  id="hc-edad"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.edad}
                  onChange={(e) => actualizarCampo('edad', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-fecha-nac" className="medix-label" style={{ marginBottom: 0 }}>Fecha nac. (RENIEC)</label>
                <input
                  id="hc-fecha-nac"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.fecha_nacimiento}
                  onChange={(e) => actualizarCampo('fecha_nacimiento', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-sexo" className="medix-label" style={{ marginBottom: 0 }}>Sexo</label>
                <select
                  id="hc-sexo"
                  className="medix-input"
                  value={formEmergencia.sexo}
                  onChange={(e) => actualizarCampo('sexo', e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-dni-col" className="medix-label" style={{ marginBottom: 0 }}>DNI</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    id="hc-dni-col"
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    className="medix-input"
                    style={{ fontWeight: 700 }}
                    value={formEmergencia.dni}
                    onChange={(e) => actualizarCampo('dni', e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        buscarDatosReniec(formEmergencia.dni, true)
                      }
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => buscarDatosReniec(formEmergencia.dni, true)}
                    disabled={consultandoReniec || formEmergencia.dni.length !== 8}
                    className="medix-btn medix-btn-secondary medix-btn-sm"
                    style={{ height: '38px', flexShrink: 0 }}
                  >
                    RENIEC
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-gravedad" className="medix-label" style={{ marginBottom: 0 }}>GRAVEDAD</label>
                <input
                  id="hc-gravedad"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.gravedad}
                  onChange={(e) => actualizarCampo('gravedad', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <span className="medix-label" style={{ marginBottom: 0 }}>Prioridad</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {[1, 2, 3, 4].map((num) => {
                    const activo = formEmergencia.prioridad === num
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => actualizarCampo('prioridad', num)}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          border: activo ? '2px solid var(--color-navy)' : '1px solid var(--border-color)',
                          backgroundColor: activo ? 'var(--color-navy)' : theme.bgInput,
                          color: activo ? '#FFFFFF' : theme.textMain,
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        {num}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-provincia" className="medix-label" style={{ marginBottom: 0 }}>Provincia (RENIEC)</label>
                <input
                  id="hc-provincia"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.provincia}
                  onChange={(e) => actualizarCampo('provincia', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-centro-poblado" className="medix-label" style={{ marginBottom: 0 }}>Centro Poblado</label>
                <input
                  id="hc-centro-poblado"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.centro_poblado}
                  onChange={(e) => actualizarCampo('centro_poblado', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-usuario-reg" className="medix-label" style={{ marginBottom: 0 }}>USUARIO</label>
                <input
                  id="hc-usuario-reg"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.usuario_registro}
                  onChange={(e) => actualizarCampo('usuario_registro', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="hc-alergias" className="medix-label" style={{ marginBottom: 0, color: 'var(--alert-red)' }}>
                  Alergias (Alerta)
                </label>
                <input
                  id="hc-alergias"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.alergias}
                  onChange={(e) => actualizarCampo('alergias', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* BLOQUE 2: TABLA DE FUNCIONES VITALES */}
          <div style={{ borderTop: theme.border, paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
              <strong style={{ fontSize: '13px', color: theme.textHeading, letterSpacing: '0.3px' }}>
                FUNCIONES VITALES :
              </strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label htmlFor="hc-peso" style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary }}>Peso (kg):</label>
                  <input
                    id="hc-peso"
                    type="text"
                    className="medix-input"
                    style={{ width: '80px', height: '32px' }}
                    value={formEmergencia.peso}
                    onChange={(e) => actualizarCampo('peso', e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label htmlFor="hc-talla" style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary }}>Talla (m):</label>
                  <input
                    id="hc-talla"
                    type="text"
                    className="medix-input"
                    style={{ width: '80px', height: '32px' }}
                    value={formEmergencia.talla}
                    onChange={(e) => actualizarCampo('talla', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="medix-table" style={{ border: '1px solid var(--border-color)' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>Presion Arterial</th>
                    <th style={{ textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>Frec. Respiratoria</th>
                    <th style={{ textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>Pulso</th>
                    <th style={{ textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>Temperatura</th>
                    <th style={{ textAlign: 'center' }}>Frec. Cardiaca</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px', borderRight: '1px solid var(--border-color)' }}>
                      <input
                        type="text"
                        aria-label="Presión arterial"
                        className="medix-input"
                        style={{ textAlign: 'center', height: '34px' }}
                        value={formEmergencia.presion_arterial}
                        onChange={(e) => actualizarCampo('presion_arterial', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '6px', borderRight: '1px solid var(--border-color)' }}>
                      <input
                        type="text"
                        aria-label="Frecuencia respiratoria"
                        className="medix-input"
                        style={{ textAlign: 'center', height: '34px' }}
                        value={formEmergencia.frec_respiratoria}
                        onChange={(e) => actualizarCampo('frec_respiratoria', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '6px', borderRight: '1px solid var(--border-color)' }}>
                      <input
                        type="text"
                        aria-label="Pulso"
                        className="medix-input"
                        style={{ textAlign: 'center', height: '34px' }}
                        value={formEmergencia.pulso}
                        onChange={(e) => actualizarCampo('pulso', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '6px', borderRight: '1px solid var(--border-color)' }}>
                      <input
                        type="text"
                        aria-label="Temperatura"
                        className="medix-input"
                        style={{ textAlign: 'center', height: '34px' }}
                        value={formEmergencia.temperatura}
                        onChange={(e) => actualizarCampo('temperatura', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '6px' }}>
                      <input
                        type="text"
                        aria-label="Frecuencia cardíaca"
                        className="medix-input"
                        style={{ textAlign: 'center', height: '34px' }}
                        value={formEmergencia.frec_cardiaca}
                        onChange={(e) => actualizarCampo('frec_cardiaca', e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* BLOQUE 3: SECCIONES CLÍNICAS DEL FORMATO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: theme.border, paddingTop: '14px' }}>
            {[
              { id: 'anamnesis', label: 'Anamnesis' },
              { id: 'antecedentes', label: 'Antecedentes' },
              { id: 'examen_fisico', label: 'Examen Físico' },
              { id: 'examenes_auxiliares', label: 'Examenes Auxiliares' },
              { id: 'plan_trabajo', label: 'Plan de Trabajo' },
              { id: 'terapeutica', label: 'Terapeutica a seguir' }
            ].map((sec) => (
              <div key={sec.id} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'flex-start', gap: '12px' }}>
                <label htmlFor={`hc-${sec.id}`} style={{ fontSize: '13px', fontWeight: 700, color: theme.textHeading, paddingTop: '8px' }}>
                  {sec.label}
                </label>
                <textarea
                  id={`hc-${sec.id}`}
                  rows={2}
                  className="medix-input"
                  style={{ height: 'auto', padding: '8px 12px', resize: 'vertical' }}
                  value={formEmergencia[sec.id]}
                  onChange={(e) => actualizarCampo(sec.id, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* BLOQUE 4: DIAGNÓSTICOS (P / D), ALTA, FIRMA Y DESTINO */}
          <div style={{ borderTop: theme.border, paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: theme.textHeading }}>
                  Impresión Diagnóstica (P: Presuntivo / D: Definitivo)
                </span>
                {formEmergencia.diagnosticos.map((diag, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="medix-input"
                      placeholder={`${idx + 1}...`}
                      value={diag.descripcion}
                      onChange={(e) => actualizarDiagnostico(idx, 'descripcion', e.target.value)}
                    />
                    <select
                      aria-label={`Tipo de diagnóstico ${idx + 1}`}
                      className="medix-input"
                      value={diag.tipo}
                      onChange={(e) => actualizarDiagnostico(idx, 'tipo', e.target.value)}
                    >
                      <option value="P">P</option>
                      <option value="D">D</option>
                    </select>
                    <input
                      type="text"
                      className="medix-input"
                      placeholder="CIE-10"
                      value={diag.cie10}
                      onChange={(e) => actualizarDiagnostico(idx, 'cie10', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="hc-alta" className="medix-label">Fecha y Hora de Alta</label>
                <input
                  id="hc-alta"
                  type="text"
                  className="medix-input"
                  value={formEmergencia.fecha_hora_alta}
                  onChange={(e) => actualizarCampo('fecha_hora_alta', e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                backgroundColor: theme.bgSubtle,
                border: theme.border,
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: theme.textHeading }}>
                Destino de Egreso:
              </span>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {['HOSPITALIZACION', 'DOMICILIO', 'TRANSFERENCIA', 'C. EXT', 'MORGUE'].map((dest) => (
                  <label key={dest} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="destino_alta"
                      checked={formEmergencia.destino_alta === dest}
                      onChange={() => actualizarCampo('destino_alta', dest)}
                    />
                    <span>{dest}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN DEL FORMATO */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: theme.border }}>
            <button
              type="button"
              onClick={handleImprimirFormato}
              className="medix-btn medix-btn-secondary"
            >
              Imprimir formato oficial
            </button>
            <button
              type="submit"
              disabled={guardandoFormato}
              className="medix-btn medix-btn-primary"
            >
              {guardandoFormato ? 'Guardando historia...' : 'Guardar Historia Clínica de Emergencia'}
            </button>
          </div>
        </form>
      )}

      {/* =================================================================== */}
      {/* MODO 2: ADJUNTAR ARCHIVO ESCANEADO EXTERNO */}
      {/* =================================================================== */}
      {modoRegistro === 'subir_archivo' && (
        <div className="medix-card" style={{ padding: '24px 28px' }}>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="upload-dni" className="medix-label">DNI del Paciente *</label>
              <input
                id="upload-dni"
                type="text"
                inputMode="numeric"
                className="medix-input"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                maxLength={8}
                required
              />
              {dniLimpio.length > 0 && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: theme.textSecondary }}>
                  {pacienteDetectado
                    ? `Carpeta existente: ${pacienteDetectado.nombre || pacienteDetectado.dni} (${(pacienteDetectado.documentos || []).length} documentos)`
                    : `Se creará un nuevo expediente para el DNI ${dniLimpio}.`}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="upload-nombre" className="medix-label">Apellidos y Nombres del Paciente</label>
              <input
                id="upload-nombre"
                type="text"
                className="medix-input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="upload-alergias" className="medix-label">Alergias conocidas</label>
              <input
                id="upload-alergias"
                type="text"
                className="medix-input"
                value={alergias}
                onChange={(e) => setAlergias(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="upload-file" className="medix-label">Archivo digitalizado (PDF, Word, Imagen, Texto) *</label>
              <input
                id="upload-file"
                ref={fileInputRef}
                type="file"
                className="medix-input"
                style={{ padding: '6px 10px', height: 'auto' }}
                accept="application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/*, text/plain"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
              {file && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: theme.textSecondary }}>
                  Archivo seleccionado: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
              <button type="button" onClick={() => navigate('/dashboard')} className="medix-btn medix-btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={subiendo} className="medix-btn medix-btn-primary">
                {subiendo ? 'Subiendo archivo...' : 'Subir al expediente'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
