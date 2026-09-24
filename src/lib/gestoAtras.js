import { useEffect, useRef } from 'react'

// Contador de capas abiertas, para reconocer la entrada que mete cada una.
let siguienteCapa = 0

/**
 * Engancha una capa de la interfaz (una pantalla, un modal, un dialogo) al gesto
 * de volver atras del movil y al boton del navegador: en vez de salirse de la
 * app, se cierra la capa de arriba.
 *
 * Cada capa abierta mete una entrada en el historial y la retira al cerrarse
 * desde la interfaz, para no dejar entradas huerfanas que obliguen a pulsar
 * atras dos veces.
 */
export function useGestoAtras(activo, alCerrar) {
  // En una ref para que cambiar de callback no vuelva a apilar una entrada.
  const cerrar = useRef(alCerrar)
  cerrar.current = alCerrar

  useEffect(() => {
    if (!activo) return undefined

    const capa = ++siguienteCapa
    window.history.pushState({ capa }, '')

    // popstate llega a todas las capas abiertas: solo se cierra la de arriba,
    // que es aquella cuya entrada acaba de desaparecer del historial.
    const alVolver = (evento) => {
      if ((evento.state?.capa ?? 0) < capa) cerrar.current()
    }
    window.addEventListener('popstate', alVolver)

    return () => {
      window.removeEventListener('popstate', alVolver)
      // Si se cerro desde la interfaz, la entrada sigue ahi: la quitamos.
      if (window.history.state?.capa === capa) window.history.back()
    }
  }, [activo])
}
