import { useEffect, useRef } from 'react'

/**
 * Dialogo de confirmacion propio. No usamos window.confirm porque hay
 * navegadores y webviews que lo ignoran y devuelven false sin preguntar.
 */
export default function Confirmacion({ mensaje, textoAccion, peligro, onAceptar, onCancelar }) {
  const aceptarRef = useRef(null)

  useEffect(() => {
    aceptarRef.current?.focus()
    const alPulsar = (e) => {
      if (e.key === 'Escape') onCancelar()
    }
    document.addEventListener('keydown', alPulsar)
    document.body.classList.add('sin-scroll')
    return () => {
      document.removeEventListener('keydown', alPulsar)
      document.body.classList.remove('sin-scroll')
    }
  }, [onCancelar])

  return (
    <div className="fondo-modal" onClick={onCancelar}>
      <div
        className="modal modal--confirmacion"
        role="alertdialog"
        aria-modal="true"
        aria-label={mensaje}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__cuerpo">
          <p className="confirmacion__mensaje">{mensaje}</p>
          <div className="confirmacion__acciones">
            <button type="button" className="boton boton--secundario" onClick={onCancelar}>
              Cancelar
            </button>
            <button
              ref={aceptarRef}
              type="button"
              className={`boton boton--${peligro ? 'peligro' : 'primario'}`}
              onClick={onAceptar}
            >
              {textoAccion}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
