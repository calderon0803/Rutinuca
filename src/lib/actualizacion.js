import { useRegisterSW } from 'virtual:pwa-register/react'

// Cada cuanto se le pregunta al servidor si hay una version nueva.
const CADA = 30 * 60 * 1000

/**
 * Avisa cuando hay una version nueva esperando. Con registerType 'prompt' el
 * service worker nuevo se queda en espera hasta que se confirma, en vez de
 * colarse en la siguiente recarga sin decir nada; asi no cambia la app a mitad
 * de un entrenamiento.
 */
export function useActualizacion() {
  const {
    needRefresh: [hayVersionNueva],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registro) {
      if (!registro) return

      const mirar = () => registro.update().catch(() => {})
      setInterval(mirar, CADA)
      // Al volver a la app desde segundo plano, que es cuando mas se nota.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') mirar()
      })
    },
  })

  return { hayVersionNueva, actualizar: () => updateServiceWorker(true) }
}
