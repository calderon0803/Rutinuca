// Persistencia en localStorage: las rutinas importadas y el registro de cada serie.

const CLAVE_RUTINAS = 'rutinuca:rutinas'
const CLAVE_REGISTROS = 'rutinuca:registros'
const CLAVE_HISTORIAL = 'rutinuca:historial'
const CLAVE_SEPARADAS = 'rutinuca:separadas'

// Sesiones que se conservan por rutina; las mas viejas se descartan.
const MAX_SESIONES = 20

// Subela cuando cambie la forma de una rutina normalizada: lo guardado se descarta.
const VERSION_DATOS = 1

function leer(clave, porDefecto) {
  try {
    const crudo = localStorage.getItem(clave)
    return crudo ? JSON.parse(crudo) : porDefecto
  } catch {
    return porDefecto
  }
}

function escribir(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // Cuota llena o almacenamiento bloqueado: la app sigue funcionando en memoria.
  }
}

function olvidarTodo() {
  try {
    localStorage.removeItem(CLAVE_RUTINAS)
    localStorage.removeItem(CLAVE_REGISTROS)
    localStorage.removeItem(CLAVE_HISTORIAL)
    localStorage.removeItem(CLAVE_SEPARADAS)
  } catch {
    // Almacenamiento bloqueado: no hay nada que limpiar.
  }
}

/** Descarta lo guardado por una version anterior en vez de intentar migrarlo. */
export function cargarRutinas() {
  const guardado = leer(CLAVE_RUTINAS, null)
  if (!guardado || guardado.version !== VERSION_DATOS || !Array.isArray(guardado.rutinas)) {
    olvidarTodo()
    return []
  }
  return guardado.rutinas
}

export const guardarRutinas = (rutinas) =>
  escribir(CLAVE_RUTINAS, { version: VERSION_DATOS, rutinas })

/**
 * Registros: { [rutinaId]: { [claveEjercicio]: { [indiceSerie]: { reps, peso, hecha } } } }
 * La clave de ejercicio incluye el indice para tolerar nombres repetidos en una rutina.
 */
export const cargarRegistros = () => leer(CLAVE_REGISTROS, {})
export const guardarRegistros = (registros) => escribir(CLAVE_REGISTROS, registros)

export function claveEjercicio(indice, nombre, esSuperserie = false) {
  return `${indice}:${nombre}${esSuperserie ? ':ss' : ''}`
}

export function serieRegistrada(registros, rutinaId, clave, indiceSerie) {
  return registros?.[rutinaId]?.[clave]?.[indiceSerie] ?? { reps: '', peso: '', hecha: false }
}

/** Devuelve una copia de los registros con un campo de una serie actualizado. */
export function actualizarSerie(registros, rutinaId, clave, indiceSerie, campo, valor) {
  const deRutina = registros[rutinaId] ?? {}
  const deEjercicio = deRutina[clave] ?? {}
  const serie = { reps: '', peso: '', hecha: false, ...deEjercicio[indiceSerie] }
  return {
    ...registros,
    [rutinaId]: {
      ...deRutina,
      [clave]: { ...deEjercicio, [indiceSerie]: { ...serie, [campo]: valor } },
    },
  }
}

/** Copia el peso de la primera serie al resto de series del ejercicio. */
export function replicarPeso(registros, rutinaId, clave, numeroSeries) {
  const peso = registros?.[rutinaId]?.[clave]?.[0]?.peso ?? ''
  if (peso === '') return registros
  const deRutina = registros[rutinaId] ?? {}
  const deEjercicio = { ...(deRutina[clave] ?? {}) }
  for (let i = 1; i < numeroSeries; i += 1) {
    deEjercicio[i] = { reps: '', hecha: false, ...deEjercicio[i], peso }
  }
  return { ...registros, [rutinaId]: { ...deRutina, [clave]: deEjercicio } }
}

/** Cuantas series de un ejercicio (incluida su superserie) estan marcadas como hechas. */
export function seriesHechas(registros, rutinaId, indice, ejercicio) {
  const cuenta = (clave, total) => {
    const datos = registros?.[rutinaId]?.[clave] ?? {}
    let n = 0
    for (let i = 0; i < total; i += 1) if (datos[i]?.hecha) n += 1
    return n
  }
  let hechas = cuenta(claveEjercicio(indice, ejercicio.ejercicio), ejercicio.series)
  const ss = ejercicio.superserie_ejercicio
  if (ss) hechas += cuenta(claveEjercicio(indice, ss.ejercicio, true), ss.series)
  return hechas
}

/**
 * Historial: { [rutinaId]: [{ fecha, series: { [clave]: { [indice]: { reps, peso } } } }] }
 * La sesion mas reciente va primero.
 */
export const cargarHistorial = () => leer(CLAVE_HISTORIAL, {})
export const guardarHistorial = (historial) => escribir(CLAVE_HISTORIAL, historial)

/** Lo anotado en una rutina, dejando fuera las series que se quedaron vacias. */
function anotadoDeRutina(registros, rutinaId) {
  const anotado = {}
  Object.entries(registros[rutinaId] ?? {}).forEach(([clave, series]) => {
    const conDatos = {}
    Object.entries(series).forEach(([indice, serie]) => {
      if (serie.reps !== '' || serie.peso !== '')
        conDatos[indice] = { reps: serie.reps, peso: serie.peso }
    })
    if (Object.keys(conDatos).length > 0) anotado[clave] = conDatos
  })
  return anotado
}

export function hayAlgoAnotado(registros, rutinaId) {
  return Object.keys(anotadoDeRutina(registros, rutinaId)).length > 0
}

/** Cierra el entrenamiento: lo guarda con su fecha y deja la rutina a cero. */
export function cerrarSesion(registros, historial, rutinaId) {
  const sesion = { fecha: new Date().toISOString(), series: anotadoDeRutina(registros, rutinaId) }
  const sesiones = [sesion, ...(historial[rutinaId] ?? [])].slice(0, MAX_SESIONES)
  return {
    registros: limpiarRutina(registros, rutinaId),
    historial: { ...historial, [rutinaId]: sesiones },
  }
}

/** Ultima sesion guardada de una rutina, o null. */
export function ultimaSesion(historial, rutinaId) {
  return historial?.[rutinaId]?.[0] ?? null
}

/** Lo que se hizo en esa serie la ultima vez que se anoto, o null. */
export function referenciaAnterior(historial, rutinaId, clave, indiceSerie) {
  const sesiones = historial?.[rutinaId] ?? []
  for (const sesion of sesiones) {
    const serie = sesion.series?.[clave]?.[indiceSerie]
    if (serie) return serie
  }
  return null
}

/**
 * Superseries que hoy se hacen por separado: { [rutinaId]: { [clave]: true } }.
 * Es del entrenamiento en curso, no de la rutina, asi que se borra al cerrarlo.
 */
export const cargarSeparadas = () => leer(CLAVE_SEPARADAS, {})
export const guardarSeparadas = (separadas) => escribir(CLAVE_SEPARADAS, separadas)

export function estaSeparada(separadas, rutinaId, clave) {
  return Boolean(separadas?.[rutinaId]?.[clave])
}

export function alternarSeparada(separadas, rutinaId, clave) {
  const deRutina = { ...(separadas[rutinaId] ?? {}) }
  if (deRutina[clave]) delete deRutina[clave]
  else deRutina[clave] = true
  return { ...separadas, [rutinaId]: deRutina }
}

export function limpiarSeparadas(separadas, rutinaId) {
  const copia = { ...separadas }
  delete copia[rutinaId]
  return copia
}

/** Borra el registro de una rutina completa (para empezar la sesion de cero). */
export function limpiarRutina(registros, rutinaId) {
  const copia = { ...registros }
  delete copia[rutinaId]
  return copia
}
