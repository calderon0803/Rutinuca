// Normalizacion y validacion del JSON de rutinas importado por el usuario.

/** Convierte un texto en un identificador estable y legible. */
export function slug(texto) {
  return (
    String(texto ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'sin-nombre'
  )
}

class ErrorRutina extends Error {}

function aEntero(valor, porDefecto) {
  const n = Number(valor)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : porDefecto
}

/** Ordena un par de extremos y tolera que falte uno de los dos. */
function rango(min, max) {
  if (min == null && max == null) return null
  if (min == null) return { min: max, max }
  if (max == null) return { min, max: min }
  return min <= max ? { min, max } : { min: max, max: min }
}

/**
 * El objetivo de una serie es un rango. Se acepta escrito como "8-10" (tambien
 * "8 a 10" o con guion largo), como par [8, 10] o como un numero suelto, que
 * equivale a un rango cerrado.
 */
function normalizarObjetivo(valor) {
  if (valor == null || valor === '') return null
  if (Array.isArray(valor)) return rango(aEntero(valor[0], null), aEntero(valor[1], null))
  if (typeof valor === 'number') return rango(aEntero(valor, null), aEntero(valor, null))

  const texto = String(valor).trim()
  const extremos = texto.match(/^(\d+)\s*(?:-|–|—|a)\s*(\d+)$/i)
  if (extremos) return rango(Number(extremos[1]), Number(extremos[2]))

  const suelto = aEntero(texto, null)
  return suelto == null ? null : { min: suelto, max: suelto }
}

/** "8-10", o "10" cuando el rango es cerrado. */
export function formatearObjetivo(objetivo) {
  if (!objetivo) return ''
  return objetivo.min === objetivo.max ? `${objetivo.min}` : `${objetivo.min}-${objetivo.max}`
}

function normalizarEjercicio(bruto, ruta, { permitirSuperserie }) {
  if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) {
    throw new ErrorRutina(`${ruta}: se esperaba un objeto de ejercicio.`)
  }
  const nombre = String(bruto.ejercicio ?? '').trim()
  if (!nombre) throw new ErrorRutina(`${ruta}: falta la propiedad "ejercicio".`)

  const reps = Array.isArray(bruto.repeticiones_por_serie)
    ? bruto.repeticiones_por_serie.map(normalizarObjetivo)
    : null
  const series = aEntero(bruto.series, reps ? reps.length : 1)

  // Las series mandan sobre el array: lo recortamos o rellenamos para que cuadren.
  const repeticiones = Array.from({ length: series }, (_, i) => (reps ? (reps[i] ?? null) : null))

  const ejercicio = {
    ejercicio: nombre,
    indicaciones: String(bruto.indicaciones ?? '').trim(),
    series,
    repeticiones_por_serie: repeticiones,
    topset: Boolean(bruto.topset),
    superserie: false,
    superserie_ejercicio: null,
  }

  if (permitirSuperserie && bruto.superserie_ejercicio) {
    ejercicio.superserie_ejercicio = normalizarEjercicio(
      bruto.superserie_ejercicio,
      `${ruta} > superserie_ejercicio`,
      { permitirSuperserie: false },
    )
    ejercicio.superserie = true
  } else if (permitirSuperserie) {
    // Marcada como superserie pero sin pareja: la ignoramos en vez de romper la importacion.
    ejercicio.superserie = false
  }

  return ejercicio
}

function normalizarRutina(bruto, indice) {
  if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) {
    throw new ErrorRutina(`Rutina ${indice + 1}: se esperaba un objeto.`)
  }
  const nombre = String(bruto.rutina ?? '').trim()
  if (!nombre) throw new ErrorRutina(`Rutina ${indice + 1}: falta la propiedad "rutina".`)

  const listaBruta = bruto.ejercicios ?? bruto.ejercicio ?? bruto.lista
  if (!Array.isArray(listaBruta) || listaBruta.length === 0) {
    throw new ErrorRutina(`"${nombre}": falta el array de ejercicios.`)
  }

  return {
    id: `${slug(nombre)}--${indice}`,
    rutina: nombre,
    ejercicios: listaBruta.map((ej, i) =>
      normalizarEjercicio(ej, `"${nombre}" > ejercicio ${i + 1}`, { permitirSuperserie: true }),
    ),
  }
}

/**
 * Acepta las tres formas razonables del fichero:
 *   { rutinas: [ {...}, {...} ] } | [ {...}, {...} ] | { rutina: "...", ejercicios: [...] }
 * Devuelve siempre un array de rutinas normalizadas o lanza un error legible.
 */
export function normalizarImportacion(datos) {
  let brutas
  if (Array.isArray(datos)) brutas = datos
  else if (datos && Array.isArray(datos.rutinas)) brutas = datos.rutinas
  else if (datos && typeof datos === 'object' && datos.rutina) brutas = [datos]
  else
    throw new ErrorRutina(
      'El JSON debe ser una rutina, un array de rutinas o { "rutinas": [...] }.',
    )

  if (brutas.length === 0) throw new ErrorRutina('El fichero no contiene ninguna rutina.')
  return brutas.map(normalizarRutina)
}

/** Lee un File y devuelve las rutinas normalizadas. */
export async function leerFicheroRutinas(fichero) {
  const texto = await fichero.text()
  let datos
  try {
    datos = JSON.parse(texto)
  } catch {
    throw new ErrorRutina('El fichero no es un JSON válido.')
  }
  return normalizarImportacion(datos)
}

function ejercicioExportable(ejercicio, esPareja) {
  const salida = { ejercicio: ejercicio.ejercicio }
  if (ejercicio.indicaciones) salida.indicaciones = ejercicio.indicaciones
  salida.series = ejercicio.series
  salida.repeticiones_por_serie = ejercicio.repeticiones_por_serie.map(formatearObjetivo)

  // La pareja de una superserie no lleva sus propios distintivos.
  if (esPareja) return salida

  salida.topset = ejercicio.topset
  salida.superserie = ejercicio.superserie
  if (ejercicio.superserie_ejercicio) {
    salida.superserie_ejercicio = ejercicioExportable(ejercicio.superserie_ejercicio, true)
  }
  return salida
}

/** Las rutinas en el mismo formato que acepta la importacion, sin datos internos. */
export function aFormatoExportable(rutinas) {
  return {
    rutinas: rutinas.map(({ rutina, ejercicios }) => ({
      rutina,
      ejercicios: ejercicios.map((ejercicio) => ejercicioExportable(ejercicio, false)),
    })),
  }
}

/** Total de series de un ejercicio contando su superserie. */
export function totalSeries(ejercicio) {
  return ejercicio.series + (ejercicio.superserie_ejercicio?.series ?? 0)
}

/** "4 x 8-10" cuando todas las series comparten objetivo, si no "8-10 / 8-10 / 6-8". */
export function resumenSeries(ejercicio) {
  const objetivos = ejercicio.repeticiones_por_serie.map(formatearObjetivo)
  if (objetivos.every((o) => o === '')) return plural(ejercicio.series, 'serie', 'series')
  const unicos = new Set(objetivos.map((o) => o || '-'))
  if (unicos.size === 1) return `${ejercicio.series} x ${objetivos[0]}`
  return objetivos.map((o) => o || '-').join(' / ')
}

/** "1 ejercicio" / "3 ejercicios". */
export function plural(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural}`
}
