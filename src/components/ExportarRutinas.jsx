import { useEffect, useRef, useState } from 'react'
import { Download, Share2, X } from 'lucide-react'
import { aFormatoExportable, plural, slug } from '../lib/rutinas'
import { compartirJson, descargarJson, sePuedenCompartirFicheros } from '../lib/descargas'

/** Elige que rutinas se exportan y descarga solo esas. */
export default function ExportarRutinas({ rutinas, onCerrar }) {
  const [elegidas, setElegidas] = useState(() => new Set(rutinas.map((r) => r.id)))
  const [error, setError] = useState('')
  // En movil casi siempre; en escritorio casi nunca.
  const [sePuedeCompartir] = useState(sePuedenCompartirFicheros)
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

  function alternar(id) {
    setElegidas((previas) => {
      const copia = new Set(previas)
      if (copia.has(id)) copia.delete(id)
      else copia.add(id)
      return copia
    })
  }

  /** Las rutinas marcadas, con el nombre de fichero que les toca. */
  function loElegido() {
    const seleccion = rutinas.filter((rutina) => elegidas.has(rutina.id))
    // Con una sola, el fichero lleva su nombre; con varias, uno generico.
    const nombre =
      seleccion.length === 1
        ? `rutinuca-${slug(seleccion[0].rutina)}.json`
        : 'rutinuca-rutinas.json'
    return { nombre, datos: aFormatoExportable(seleccion), cuantas: seleccion.length }
  }

  function descargar() {
    const { nombre, datos } = loElegido()
    descargarJson(nombre, datos)
    onCerrar()
  }

  async function compartir() {
    const { nombre, datos, cuantas } = loElegido()
    try {
      const compartido = await compartirJson(
        nombre,
        datos,
        `${plural(cuantas, 'rutina', 'rutinas')} de Rutinuca`,
      )
      if (compartido) onCerrar()
    } catch {
      setError('No se pudo compartir. Prueba a descargar el fichero.')
    }
  }

  return (
    <div className="fondo-modal" onClick={onCerrar}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Exportar rutinas"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__barra">
          <h2 className="modal__titulo">Exportar</h2>
          <button
            ref={cerrarRef}
            type="button"
            className="boton-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal__cuerpo">
          <ul className="seleccion">
            {rutinas.map((rutina) => (
              <li key={rutina.id}>
                <label className="seleccion__fila">
                  <input
                    type="checkbox"
                    className="check"
                    checked={elegidas.has(rutina.id)}
                    onChange={() => alternar(rutina.id)}
                  />
                  <span className="seleccion__texto">
                    <span className="seleccion__titulo">{rutina.rutina}</span>
                    <span className="seleccion__meta">
                      {plural(rutina.ejercicios.length, 'ejercicio', 'ejercicios')}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>

          {error && (
            <p className="formulario__error" role="alert">
              {error}
            </p>
          )}

          <div className="formulario__acciones">
            <button type="button" className="boton boton--secundario" onClick={onCerrar}>
              Cancelar
            </button>
            <button
              type="button"
              className="boton boton--primario"
              onClick={sePuedeCompartir ? compartir : descargar}
              disabled={elegidas.size === 0}
            >
              {sePuedeCompartir ? (
                <Share2 size={18} aria-hidden="true" />
              ) : (
                <Download size={18} aria-hidden="true" />
              )}
              {sePuedeCompartir ? 'Compartir' : 'Descargar'}
              {elegidas.size > 0 && ` (${elegidas.size})`}
            </button>
          </div>

          {/* Con el menu de compartir delante, descargar sigue estando a mano. */}
          {sePuedeCompartir && (
            <button
              type="button"
              className="boton boton--terciario boton--pequeno"
              onClick={descargar}
              disabled={elegidas.size === 0}
            >
              <Download size={15} aria-hidden="true" />
              Descargar fichero
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
