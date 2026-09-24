// Normalizacion y validacion del JSON de rutinas importado por el usuario.
// La validacion es estricta a proposito: el fichero solo puede contener lo que
// la app sabe hacer, asi que una clave o un valor de mas cancela la importacion.

import { GRUPOS_MUSCULARES, ZONAS, zonaDe } from '../data/grupos'

const CLAVES_FICHERO = ['rutinas']
const CLAVES_RUTINA = ['rutina', 'ejercicios']
const CLAVES_EJERCICIO = [
  'id',
  'ejercicio',
  'grupo',
  'indicaciones',
  'series',
  'topset',
  'superserie',
  'superserie_ejercicio',
]
// La pareja de una superserie no lleva distintivos ni anida otra superserie.
const CLAVES_PAREJA = ['id', 'ejercicio', 'grupo', 'indicaciones', 'series']

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

/**
 * Id de un ejercicio. Lo que se anota cuelga de el, no de su nombre ni de su
 * posicion, para que renombrar o reordenar no pierda el registro ni el historial.
 */
export function nuevoIdEjercicio() {
  return 'e' + crypto.randomUUID().replaceAll('-', '').slice(0, 10)
}

function aEntero(valor, porDefecto) {
  const n = Number(valor)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : porDefecto
}

/** Corta la importacion si el objeto trae claves que la app no usa. */
function revisarClaves(bruto, permitidas, ruta) {
  const sobran = Object.keys(bruto).filter((clave) => !permitidas.includes(clave))
  if (sobran.length > 0) {
    const lista = sobran.map((c) => `"${c}"`).join(', ')
    throw new ErrorRutina(
      `${ruta}: la app no contempla ${lista}. Admite: ${permitidas.join(', ')}.`,
    )
  }
}

function leerTexto(bruto, clave, ruta) {
  const valor = bruto[clave]
  if (valor === undefined) return ''
  if (typeof valor !== 'string') throw new ErrorRutina(`${ruta}: "${clave}" tiene que ser texto.`)
  return valor.trim()
}

function leerBooleano(bruto, clave, ruta) {
  const valor = bruto[clave]
  if (valor === undefined) return false
  if (typeof valor !== 'boolean') {
    throw new ErrorRutina(`${ruta}: "${clave}" tiene que ser true o false.`)
  }
  return valor
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

/** Un objetivo escrito a mano vale si esta vacio o si se entiende. */
export function esObjetivoValido(texto) {
  const limpio = String(texto ?? '').trim()
  return limpio === '' || normalizarObjetivo(limpio) != null
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

  if (bruto.repeticiones_por_serie !== undefined) {
    throw new ErrorRutina(
      `${ruta}: "repeticiones_por_serie" ya no existe, los objetivos van dentro de "series".`,
    )
  }
  revisarClaves(bruto, permitirSuperserie ? CLAVES_EJERCICIO : CLAVES_PAREJA, ruta)

  const nombre = leerTexto(bruto, 'ejercicio', ruta)
  if (!nombre) throw new ErrorRutina(`${ruta}: falta la propiedad "ejercicio".`)

  const grupo = leerTexto(bruto, 'grupo', ruta)
  if (grupo && !GRUPOS_MUSCULARES.includes(grupo)) {
    throw new ErrorRutina(
      `${ruta}: el grupo muscular "${grupo}" no existe. Elige uno de: ${GRUPOS_MUSCULARES.join(', ')}.`,
    )
  }

  // "series" es el array de objetivos, uno por serie; su longitud manda. Tambien
  // vale un numero suelto cuando no quieres fijar objetivo.
  let repeticiones
  if (Array.isArray(bruto.series)) {
    if (bruto.series.length === 0) throw new ErrorRutina(`${ruta}: "series" esta vacio.`)
    repeticiones = bruto.series.map((valor, i) => {
      const objetivo = normalizarObjetivo(valor)
      if (objetivo == null && valor !== '' && valor != null) {
        throw new ErrorRutina(
          `${ruta}: no se entiende el objetivo "${valor}" de la serie ${i + 1}. Escribelo como "8-10" o como un numero.`,
        )
      }
      return objetivo
    })
  } else if (bruto.series === undefined) {
    repeticiones = [null]
  } else {
    const cuantas = aEntero(bruto.series, null)
    if (cuantas == null) {
      throw new ErrorRutina(`${ruta}: "series" tiene que ser una lista de objetivos o un numero.`)
    }
    repeticiones = Array.from({ length: cuantas }, () => null)
  }

  const ejercicio = {
    id: leerTexto(bruto, 'id', ruta) || nuevoIdEjercicio(),
    ejercicio: nombre,
    grupo,
    indicaciones: leerTexto(bruto, 'indicaciones', ruta),
    series: repeticiones.length,
    repeticiones_por_serie: repeticiones,
    topset: permitirSuperserie ? leerBooleano(bruto, 'topset', ruta) : false,
    superserie: false,
    superserie_ejercicio: null,
  }

  if (permitirSuperserie) {
    const tienePareja = bruto.superserie_ejercicio !== undefined
    const marcada = leerBooleano(bruto, 'superserie', ruta)
    // El distintivo y la pareja tienen que decir lo mismo.
    if (bruto.superserie !== undefined && marcada !== tienePareja) {
      throw new ErrorRutina(
        tienePareja
          ? `${ruta}: hay "superserie_ejercicio" pero "superserie" es false.`
          : `${ruta}: "superserie" es true pero falta "superserie_ejercicio".`,
      )
    }
    if (tienePareja && ejercicio.topset) {
      throw new ErrorRutina(
        `${ruta}: un ejercicio es top set o superserie, no las dos cosas a la vez.`,
      )
    }
    if (tienePareja) {
      ejercicio.superserie_ejercicio = normalizarEjercicio(
        bruto.superserie_ejercicio,
        `${ruta} > superserie_ejercicio`,
        { permitirSuperserie: false },
      )
      ejercicio.superserie = true
    }
  }

  return ejercicio
}

function normalizarRutina(bruto, indice) {
  if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) {
    throw new ErrorRutina(`Rutina ${indice + 1}: se esperaba un objeto.`)
  }
  revisarClaves(bruto, CLAVES_RUTINA, `Rutina ${indice + 1}`)

  const nombre = leerTexto(bruto, 'rutina', `Rutina ${indice + 1}`)
  if (!nombre) throw new ErrorRutina(`Rutina ${indice + 1}: falta la propiedad "rutina".`)

  const listaBruta = bruto.ejercicios
  if (!Array.isArray(listaBruta) || listaBruta.length === 0) {
    throw new ErrorRutina(`"${nombre}": falta el array de ejercicios.`)
  }

  const ejercicios = listaBruta.map((ej, i) =>
    normalizarEjercicio(ej, `"${nombre}" > ejercicio ${i + 1}`, { permitirSuperserie: true }),
  )

  const ids = ejercicios.flatMap((e) => [e.id, e.superserie_ejercicio?.id].filter(Boolean))
  const repetido = ids.find((id, i) => ids.indexOf(id) !== i)
  if (repetido)
    throw new ErrorRutina(`"${nombre}": el id de ejercicio "${repetido}" esta repetido.`)

  return {
    id: `${slug(nombre)}--${indice}`,
    rutina: nombre,
    ejercicios,
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
  else if (datos && Array.isArray(datos.rutinas)) {
    revisarClaves(datos, CLAVES_FICHERO, 'El fichero')
    brutas = datos.rutinas
  } else if (datos && typeof datos === 'object' && datos.rutina) brutas = [datos]
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
  const salida = { id: ejercicio.id, ejercicio: ejercicio.ejercicio }
  if (ejercicio.grupo) salida.grupo = ejercicio.grupo
  if (ejercicio.indicaciones) salida.indicaciones = ejercicio.indicaciones
  const objetivos = ejercicio.repeticiones_por_serie.map(formatearObjetivo)
  // Sin objetivos no tiene sentido el array: basta con cuantas series son.
  salida.series = objetivos.every((o) => o === '') ? ejercicio.series : objetivos

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

/**
 * Devuelve la rutina con un id que no choque con las existentes. El id es la
 * clave del registro y del historial, asi que nunca se reutiliza.
 */
export function conIdLibre(rutina, existentes) {
  const usados = new Set(existentes.map((r) => r.id))
  if (!usados.has(rutina.id)) return rutina

  const base = rutina.id.replace(/--\d+$/, '')
  let n = 1
  while (usados.has(`${base}--${n}`)) n += 1
  return { ...rutina, id: `${base}--${n}` }
}

/** Zonas del cuerpo que toca una rutina, en el orden de la lista de grupos. */
export function zonasDeRutina(rutina) {
  const tocadas = new Set()
  rutina.ejercicios.forEach((ejercicio) => {
    ;[ejercicio, ejercicio.superserie_ejercicio].forEach((cual) => {
      const zona = zonaDe(cual?.grupo)
      if (zona) tocadas.add(zona)
    })
  })
  return ZONAS.map(({ zona }) => zona).filter((zona) => tocadas.has(zona))
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
