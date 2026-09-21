/**
 * symptomAnalyzer.js
 * Motor clínico de detección y extracción semántica de síntomas, 
 * signos vitales y afecciones corporales a partir de la historia clínica.
 * Diseñado en base a la infografía anatómica de referencia (silueta central + tarjetas A-B-C-D + telemetría).
 */

// Mapeo anatómico de coordenadas en la silueta (porcentajes x: 0-100, y: 0-100)
export const ZONAS_ANATOMICAS = {
  // FLANCO IZQUIERDO (AZUL CLÍNICO)
  cerebro: {
    id: 'cerebro',
    nombre: 'Cerebro / Sistema Nervioso',
    organo: 'Cerebro',
    letra: 'A',
    flanco: 'izq',
    x: 50,
    y: 11,
    color: '#0284c7', // Azul
    bgIcon: '#0284c7',
    iconType: 'cerebro',
    keywords: [
      'cefalea', 'dolor de cabeza', 'migraña', 'mareo', 'vertigo', 'vértigo', 
      'tec', 'traumatismo encefalo', 'traumatismo encéfalo', 'convulsion', 'convulsión', 
      'síncope', 'sincope', 'desmayo', 'insomnio', 'neurolog', 'neurológ', 'visión', 'ojo', 'cerebral'
    ],
    descNormal: 'Función neurológica conservada. Paciente lúcido, orientado en espacio, tiempo y persona.'
  },
  higado: {
    id: 'higado',
    nombre: 'Hígado / Sistema Hepático',
    organo: 'Hígado',
    letra: 'B',
    flanco: 'izq',
    x: 40,
    y: 39,
    color: '#0284c7',
    bgIcon: '#0284c7',
    iconType: 'higado',
    keywords: [
      'higado', 'hígado', 'hepatico', 'hepático', 'vesicula', 'vesícula', 
      'colico biliar', 'cólico biliar', 'ictericia', 'hipocondrio derecho', 'cirrosis', 'transaminasas', 'esteatosis'
    ],
    descNormal: 'Perfil hepático dentro de parámetros normales. Sin visceromegalias palpables ni ictericia.'
  },
  pulmones: {
    id: 'pulmones',
    nombre: 'Pulmones / Sistema Respiratorio',
    organo: 'Pulmones',
    letra: 'C',
    flanco: 'izq',
    x: 38,
    y: 28,
    color: '#0284c7',
    bgIcon: '#0284c7',
    iconType: 'pulmones',
    keywords: [
      'tos', 'disnea', 'dificultad respiratoria', 'falta de aire', 'sibilancia', 'sibilancias', 
      'pulmon', 'pulmón', 'pulmones', 'asma', 'bronquitis', 'neumonia', 'neumonía', 
      'saturacion baja', 'saturación baja', 'expectoracion', 'expectoración', 'gripe', 'faringitis', 'respirat'
    ],
    descNormal: 'Murmullo vesicular pasa bien en ambos campos pulmonares. Buena ventilación bilateral sin ruidos sobreagregados.'
  },
  estomago: {
    id: 'estomago',
    nombre: 'Estómago / Gastrointestinal Superior',
    organo: 'Estómago',
    letra: 'D',
    flanco: 'izq',
    x: 55,
    y: 39,
    color: '#0284c7',
    bgIcon: '#0284c7',
    iconType: 'estomago',
    keywords: [
      'estomago', 'estómago', 'epigastralgia', 'dolor de estomago', 'dolor de estómago', 
      'gastritis', 'nausea', 'náusea', 'nauseas', 'náuseas', 'vomito', 'vómito', 
      'vomitos', 'vómitos', 'reflujo', 'acidez', 'pirosis', 'ulcera', 'úlcera', 'ardor epigastrico'
    ],
    descNormal: 'Abdomen blando, depresible, no doloroso a la palpación en epigastrio ni signos de reflujo.'
  },

  // FLANCO DERECHO (MAGENTA / ROJO CLÍNICO)
  corazon: {
    id: 'corazon',
    nombre: 'Corazón / Sistema Cardiovascular',
    organo: 'Corazón',
    letra: 'A',
    flanco: 'der',
    x: 58,
    y: 28,
    color: '#e11d48', // Magenta
    bgIcon: '#e11d48',
    iconType: 'corazon',
    keywords: [
      'precordial', 'dolor de pecho', 'pecho', 'toracico', 'torácico', 'corazon', 'corazón', 
      'cardiaco', 'cardíaco', 'palpitacion', 'palpitaciones', 'taquicardia', 'bradicardia', 
      'hipertension', 'hipertensión', 'presion alta', 'presión alta', 'infarto', 'arritmia', 'angina', 'cardio'
    ],
    descNormal: 'Ruidos cardíacos rítmicos y normofonéticos. Sin soplos ni signos de insuficiencia cardíaca aguda.'
  },
  articulaciones: {
    id: 'articulaciones',
    nombre: 'Articulaciones / Rodillas y Columna',
    organo: 'Articulaciones',
    letra: 'B',
    flanco: 'der',
    x: 57,
    y: 64,
    color: '#e11d48',
    bgIcon: '#e11d48',
    iconType: 'articulaciones',
    keywords: [
      'rodilla', 'articular', 'articulacion', 'articulación', 'artritis', 'artrosis', 
      'lumbalgia', 'dolor de espalda', 'espalda', 'cervicalgia', 'columna', 'hombro', 
      'codo', 'tobillo', 'cadera', 'esguince', 'reuma'
    ],
    descNormal: 'Movilidad articular completa y conservada en extremidades. Sin flogosis ni limitación funcional.'
  },
  intestinos: {
    id: 'intestinos',
    nombre: 'Intestinos / Abdomen Inferior',
    organo: 'Intestinos',
    letra: 'C',
    flanco: 'der',
    x: 50,
    y: 47,
    color: '#e11d48',
    bgIcon: '#e11d48',
    iconType: 'intestinos',
    keywords: [
      'abdominal', 'dolor abdominal', 'colico', 'cólico', 'diarrea', 'estreñimiento', 
      'apendicitis', 'colon', 'fosa iliaca', 'fosa ilíaca', 'meteorismo', 'distensión', 'peritonitis', 'evacuacion'
    ],
    descNormal: 'Ruidos hidroaéreos presentes y normales. No se palpan masas ni signos de irritación peritoneal.'
  },
  huesos: {
    id: 'huesos',
    nombre: 'Sistema Óseo / Extremidades',
    organo: 'Huesos',
    letra: 'D',
    flanco: 'der',
    x: 62,
    y: 83,
    color: '#e11d48',
    bgIcon: '#e11d48',
    iconType: 'huesos',
    keywords: [
      'fractura', 'fisura', 'traumatismo', 'hueso', 'huesos', 'contusion', 'contusión', 
      'golpe', 'osteoporosis', 'osteopenia', 'tibia', 'perone', 'femur', 'pie'
    ],
    descNormal: 'Estructura ósea íntegra sin deformidades, puntos de dolor a la compresión ni antecedentes de fisura.'
  }
}

/**
 * Analiza el expediente del paciente y genera las tarjetas y puntos calientes correspondientes.
 * Retorna SIEMPRE las 8 tarjetas anatómicas de la infografía (4 en flanco izquierdo azul y 4 en derecho magenta).
 */
export function analizarPaciente(paciente, documentoActual = null) {
  const dni = paciente?.dni || documentoActual?.paciente_dni || 'Expediente'
  const id = paciente?.id || documentoActual?.paciente_id || null
  const notas = paciente?.notas_medicas || []
  const signos = paciente?.signos_vitales || []
  const ultimoSigno = signos.length > 0 ? signos[0] : null

  // Texto consolidado para análisis
  const textos = []
  if (documentoActual?.nombre_archivo) textos.push(documentoActual.nombre_archivo)
  notas.forEach(n => {
    if (n.contenido) textos.push(n.contenido)
    if (n.diagnostico) textos.push(n.diagnostico)
  })
  signos.forEach(s => {
    if (s.observaciones) textos.push(s.observaciones)
  })

  const textoCompleto = textos.join(' ').toLowerCase()

  const zonasActivas = []
  const tarjetasIzq = []
  const tarjetasDer = []

  let totalAfecciones = 0

  // Evaluar cada uno de los 8 órganos anatómicos
  Object.values(ZONAS_ANATOMICAS).forEach((zona) => {
    let coincidencia = null
    let esSevero = false

    // 1. Detección por palabras clave en notas y documentos
    for (const kw of zona.keywords) {
      if (textoCompleto.includes(kw)) {
        const matchNote = notas.find(n => (n.contenido || '').toLowerCase().includes(kw) || (n.diagnostico || '').toLowerCase().includes(kw))
        const matchObs = signos.find(s => (s.observaciones || '').toLowerCase().includes(kw))
        coincidencia = matchNote ? (matchNote.diagnostico ? `${matchNote.diagnostico}: ${matchNote.contenido}` : matchNote.contenido)
          : (matchObs ? matchObs.observaciones : `Hallazgo en expediente relacionado a: ${kw}`)
        break
      }
    }

    // 2. Detección por valores numéricos de signos vitales
    if (ultimoSigno) {
      if (zona.id === 'corazon') {
        const pa = ultimoSigno.presion_arterial || ''
        const fc = parseInt(ultimoSigno.frecuencia_cardiaca || '0', 10)
        if (pa) {
          const sistolica = parseInt(pa.split('/')[0] || '0', 10)
          if (sistolica >= 140) {
            coincidencia = `Hipertensión registrada: PA ${pa} mmHg`
            esSevero = true
          } else if (sistolica <= 90 && sistolica > 0) {
            coincidencia = `Hipotensión registrada: PA ${pa} mmHg`
            esSevero = true
          }
        }
        if (fc > 100) {
          coincidencia = `Taquicardia en reposo: ${fc} lpm`
          esSevero = true
        } else if (fc > 0 && fc < 60) {
          coincidencia = `Bradicardia detectada: ${fc} lpm`
        }
      } else if (zona.id === 'pulmones') {
        const spo2 = parseInt((ultimoSigno.saturacion_oxigeno || '100').replace('%', ''), 10)
        if (spo2 < 95 && spo2 > 0) {
          coincidencia = `Desaturación de oxígeno detectada: ${spo2}% SpO2`
          esSevero = true
        }
      } else if (zona.id === 'cerebro') {
        const temp = parseFloat((ultimoSigno.temperatura || '0').replace('°c', '').replace('°C', ''))
        if (temp >= 38.0) {
          coincidencia = `Síndrome febril activo: ${temp} °C registrado en triaje`
          esSevero = true
        }
      }
    }

    const tieneSintoma = Boolean(coincidencia)
    if (tieneSintoma) totalAfecciones++

    // Objeto de zona con coordenadas y animación
    const zonaObj = {
      ...zona,
      activo: tieneSintoma,
      alerta: tieneSintoma,
      hallazgo: coincidencia || zona.descNormal,
      severidad: esSevero ? 'Alta' : (tieneSintoma ? 'Moderada' : 'Normal')
    }
    zonasActivas.push(zonaObj)

    // Objeto tarjeta para infografía
    const tarjetaObj = {
      id: zona.id,
      letra: zona.letra,
      organo: zona.organo,
      color: zona.color,
      bgIcon: zona.bgIcon,
      iconType: zona.iconType,
      activo: tieneSintoma,
      severidad: zonaObj.severidad,
      descripcion: tieneSintoma ? (coincidencia.length > 85 ? coincidencia.substring(0, 82) + '...' : coincidencia) : zona.descNormal
    }

    if (zona.flanco === 'izq') {
      tarjetasIzq.push(tarjetaObj)
    } else {
      tarjetasDer.push(tarjetaObj)
    }
  })

  // Resumen textual para pie de infografía
  const resumen = totalAfecciones > 0
    ? `Evaluación activa: ${totalAfecciones} área(s) con sintomatología detectada en expediente.`
    : 'Evaluación clínica preventiva: parámetros fisiológicos estables sin afección aguda.'

  return {
    pacienteId: id,
    pacienteDni: dni,
    ultimoSigno,
    zonasActivas,
    tarjetasIzq,
    tarjetasDer,
    tarjetasOrganos: [...tarjetasIzq, ...tarjetasDer],
    totalAfecciones,
    resumenClinico: resumen
  }
}
