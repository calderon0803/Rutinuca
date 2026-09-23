import { useEffect, useRef } from 'react'

const ETIQUETAS = [
  {
    tipo: 'normal',
    texto: 'Normal',
    explicacion: 'Series sueltas del ejercicio, con su descanso entre una y otra.',
  },
  {
    tipo: 'topset',
    texto: 'Top set',
    explicacion:
      'La serie más pesada del ejercicio. Es la primera y marca el peso de referencia; las siguientes suelen bajar algo de carga.',
  },
  {
    tipo: 'superserie',
    texto: 'Superserie',
    explicacion:
      'El ejercicio va encadenado con otro: haces una serie de cada uno seguidas, sin descanso entre ellas.',
  },
]

/** Explica los distintivos que aparecen en las tarjetas de ejercicio. */
export default function Leyenda({ onCerrar }) {
  const cerrarRef = useRef(null)

  useEffect(() => {
    cerrarRef.current?.focus()
    const alPulsar = (e) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alPulsar)
    document.body.classList.add('sin-scroll')
    return () => {
      document.removeEventListener('keydown', alPulsar)
      document.body.classList.remove('sin-scroll')
    }
  }, [onCerrar])

  return (
    <div className="fondo-modal" onClick={onCerrar}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Qué significa cada etiqueta"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__barra">
          <h2 className="modal__titulo">Las etiquetas</h2>
          <button
            ref={cerrarRef}
            type="button"
            className="boton-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="modal__cuerpo">
          <p className="nota">Cada ejercicio es de uno de estos tres tipos.</p>
          <dl className="leyenda">
            {ETIQUETAS.map(({ tipo, texto, explicacion }) => (
              <div className="leyenda__fila" key={tipo}>
                <dt>
                  <span className={`etiqueta etiqueta--${tipo}`}>{texto}</span>
                </dt>
                <dd className="leyenda__texto">{explicacion}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
