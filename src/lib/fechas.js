/** "11 sept", o "11 sept 2025" cuando la fecha es de otro ano. */
export function formatearFecha(iso) {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''

  const opciones = { day: 'numeric', month: 'short' }
  if (fecha.getFullYear() !== new Date().getFullYear()) opciones.year = 'numeric'
  return fecha.toLocaleDateString('es-ES', opciones)
}

/** "10 reps · 42,5 kg" con lo que haya anotado de esa serie. */
export function resumenSerie({ reps, peso }) {
  const partes = []
  if (reps !== '' && reps != null) partes.push(`${reps} reps`)
  if (peso !== '' && peso != null) partes.push(`${String(peso).replace('.', ',')} kg`)
  return partes.join(' · ')
}
