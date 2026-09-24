// Sacar una rutina del movil: descargarla como fichero o pasarla por el menu de
// compartir del sistema (WhatsApp, Telegram, correo...).

/** Construye el .json en memoria; sirve igual para descargar que para compartir. */
function ficheroJson(nombreFichero, datos) {
  return new File([JSON.stringify(datos, null, 2)], nombreFichero, {
    type: 'application/json',
  })
}

/** Dispara la descarga de un objeto como fichero .json. */
export function descargarJson(nombreFichero, datos) {
  const url = URL.createObjectURL(ficheroJson(nombreFichero, datos))
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreFichero
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

/**
 * Si el navegador sabe compartir ficheros. En escritorio casi nunca; en movil,
 * es lo que abre el menu de siempre para mandarlo por WhatsApp o donde sea.
 */
export function sePuedenCompartirFicheros() {
  try {
    const prueba = new File(['{}'], 'prueba.json', { type: 'application/json' })
    return Boolean(navigator.canShare?.({ files: [prueba] }))
  } catch {
    return false
  }
}

/**
 * Abre el menu de compartir con el fichero. Devuelve false si la persona cierra
 * el menu sin elegir, y lanza si falla de verdad.
 */
export async function compartirJson(nombreFichero, datos, texto) {
  try {
    await navigator.share({ files: [ficheroJson(nombreFichero, datos)], text: texto })
    return true
  } catch (error) {
    if (error.name === 'AbortError') return false
    throw error
  }
}
