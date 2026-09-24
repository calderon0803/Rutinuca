// Traduccion entre lo que maneja el formulario (borrador, todo texto) y el
// formato de fichero. Al editar una rutina guardada se hace el camino inverso:
// del modelo normalizado se reconstruye el borrador que rellena el formulario.

import { formatearObjetivo, nuevoIdEjercicio } from './rutinas'

const SERIES_POR_DEFECTO = 3

function parejaVacia(largo) {
  return {
    id: nuevoIdEjercicio(),
    ejercicio: '',
    grupo: '',
    indicaciones: '',
    series: Array.from({ length: largo }, () => ''),
  }
}

export function ejercicioVacio() {
  return {
    id: nuevoIdEjercicio(),
    ejercicio: '',
    grupo: '',
    indicaciones: '',
    series: Array.from({ length: SERIES_POR_DEFECTO }, () => ''),
    tipo: 'normal',
    pareja: parejaVacia(SERIES_POR_DEFECTO),
  }
}

/** Del ejercicio ya normalizado al borrador que rellena el formulario. */
export function aBorrador(ejercicio) {
  const series = ejercicio.repeticiones_por_serie.map(formatearObjetivo)
  const pareja = ejercicio.superserie_ejercicio

  return {
    id: ejercicio.id,
    ejercicio: ejercicio.ejercicio,
    grupo: ejercicio.grupo,
    indicaciones: ejercicio.indicaciones,
    series,
    tipo: ejercicio.topset ? 'topset' : ejercicio.superserie ? 'superserie' : 'normal',
    pareja: pareja
      ? {
          id: pareja.id,
          ejercicio: pareja.ejercicio,
          grupo: pareja.grupo,
          indicaciones: pareja.indicaciones,
          series: pareja.repeticiones_por_serie.map(formatearObjetivo),
        }
      : parejaVacia(series.length),
  }
}

/** Del borrador al formato del fichero de rutinas. */
export function aEjercicio(borrador) {
  const salida = {
    id: borrador.id,
    ejercicio: borrador.ejercicio.trim(),
    grupo: borrador.grupo,
    series: borrador.series.map((s) => s.trim()),
    topset: borrador.tipo === 'topset',
  }
  if (borrador.indicaciones.trim()) salida.indicaciones = borrador.indicaciones.trim()

  if (borrador.tipo === 'superserie') {
    salida.superserie_ejercicio = {
      id: borrador.pareja.id,
      ejercicio: borrador.pareja.ejercicio.trim(),
      grupo: borrador.pareja.grupo,
      series: borrador.pareja.series.map((s) => s.trim()),
    }
    if (borrador.pareja.indicaciones.trim()) {
      salida.superserie_ejercicio.indicaciones = borrador.pareja.indicaciones.trim()
    }
  }
  return salida
}
