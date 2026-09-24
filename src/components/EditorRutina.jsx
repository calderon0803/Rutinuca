import { useId, useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronUp, Plus, X } from 'lucide-react'
import EjercicioFormulario from './EjercicioFormulario'
import Etiquetas from './Etiquetas'
import { aBorrador, aEjercicio } from '../lib/borradores'
import { normalizarImportacion, plural, resumenSeries } from '../lib/rutinas'
import { useGestoAtras } from '../lib/gestoAtras'

/**
 * Alta y edicion de una rutina: nombre y lista de ejercicios escritos a mano.
 * Con `rutina` edita la que se le pasa; sin ella, crea una nueva.
 */
export default function EditorRutina({ rutina, onGuardar, onCancelar }) {
  const esEdicion = Boolean(rutina)
  const [nombre, setNombre] = useState(rutina?.rutina ?? '')
  // De vuelta al borrador, que es con lo que sabe trabajar el formulario.
  const [ejercicios, setEjercicios] = useState(() =>
    (rutina?.ejercicios ?? []).map((ejercicio) => {
      const borrador = aBorrador(ejercicio)
      return { borrador, fichero: aEjercicio(borrador) }
    }),
  )
  const [editando, setEditando] = useState(null)
  const [fallos, setFallos] = useState({})
  const id = useId()
  useGestoAtras(editando !== null, () => setEditando(null))

  // Se normaliza lo escrito hasta ahora para enseñarlo tal y como quedara.
  const vistaPrevia = useMemo(() => {
    if (ejercicios.length === 0) return null
    try {
      const [rutina] = normalizarImportacion({
        rutina: nombre.trim() || 'Rutina sin nombre',
        ejercicios: ejercicios.map((e) => e.fichero),
      })
      return rutina
    } catch {
      return null
    }
  }, [nombre, ejercicios])

  /** Intercambia un ejercicio con el de al lado; el id va con el, no la posicion. */
  function mover(indice, salto) {
    setEjercicios((previos) => {
      const destino = indice + salto
      if (destino < 0 || destino >= previos.length) return previos
      const copia = [...previos]
      ;[copia[indice], copia[destino]] = [copia[destino], copia[indice]]
      return copia
    })
  }

  function guardarEjercicio(fichero, borrador) {
    setEjercicios((previos) =>
      editando === 'nuevo'
        ? [...previos, { fichero, borrador }]
        : previos.map((e, i) => (i === editando ? { fichero, borrador } : e)),
    )
    setEditando(null)
    setFallos((previos) => ({ ...previos, lista: undefined }))
  }

  function guardar() {
    const encontrados = {}
    if (!nombre.trim()) encontrados.nombre = 'La rutina necesita un nombre.'
    if (ejercicios.length === 0) encontrados.lista = 'Añade al menos un ejercicio.'
    setFallos(encontrados)
    if (Object.keys(encontrados).length > 0) return

    onGuardar(
      normalizarImportacion({
        rutina: nombre.trim(),
        ejercicios: ejercicios.map((e) => e.fichero),
      }),
    )
  }

  return (
    <div className="pantalla">
      <header className="cabecera cabecera--con-volver">
        <button type="button" className="boton-volver" onClick={onCancelar}>
          <ChevronLeft size={16} aria-hidden="true" />
          Volver
        </button>
        <h1 className="cabecera__titulo">{esEdicion ? 'Editar rutina' : 'Nueva rutina'}</h1>
      </header>

      <div className="formulario__campo">
        <label className="formulario__etiqueta" htmlFor={`${id}-nombre`}>
          Nombre de la rutina
        </label>
        <input
          id={`${id}-nombre`}
          type="text"
          className="campo"
          placeholder="Día 1 - Empuje"
          required
          aria-invalid={Boolean(fallos.nombre)}
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value)
            if (fallos.nombre) setFallos((previos) => ({ ...previos, nombre: undefined }))
          }}
        />
        {fallos.nombre && (
          <p className="formulario__error" role="alert">
            {fallos.nombre}
          </p>
        )}
      </div>

      <h2 className="cabecera__titulo cabecera__titulo--seccion">
        {plural(ejercicios.length, 'ejercicio', 'ejercicios')}
      </h2>

      {vistaPrevia && (
        <ul className="lista">
          {vistaPrevia.ejercicios.map((ejercicio, indice) => (
            <li className="tarjeta tarjeta--editable" key={ejercicio.id}>
              <span className="orden">
                <button
                  type="button"
                  className="orden__boton"
                  onClick={() => mover(indice, -1)}
                  disabled={indice === 0}
                  aria-label={`Subir ${ejercicio.ejercicio}`}
                >
                  <ChevronUp size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="orden__boton"
                  onClick={() => mover(indice, 1)}
                  disabled={indice === vistaPrevia.ejercicios.length - 1}
                  aria-label={`Bajar ${ejercicio.ejercicio}`}
                >
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
              </span>
              <button
                type="button"
                className="tarjeta__principal tarjeta__principal--boton"
                onClick={() => setEditando(indice)}
              >
                <span className="tarjeta__titulo">{ejercicio.ejercicio}</span>
                {ejercicio.superserie_ejercicio && (
                  <span className="tarjeta__pareja">
                    + {ejercicio.superserie_ejercicio.ejercicio}
                  </span>
                )}
                <span className="tarjeta__meta">
                  {ejercicio.grupo && `${ejercicio.grupo} · `}
                  {resumenSeries(ejercicio)}
                </span>
                <Etiquetas ejercicio={ejercicio} />
              </button>
              <button
                type="button"
                className="boton-quitar"
                onClick={() => setEjercicios((previos) => previos.filter((_, i) => i !== indice))}
                aria-label={`Quitar ${ejercicio.ejercicio}`}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="boton boton--secundario boton--anadir"
        onClick={() => setEditando('nuevo')}
      >
        <Plus size={18} aria-hidden="true" />
        Añadir ejercicio
      </button>

      {fallos.lista && (
        <p className="formulario__error formulario__error--pie" role="alert">
          {fallos.lista}
        </p>
      )}

      <footer className="pie">
        <button type="button" className="boton boton--primario boton--grande" onClick={guardar}>
          {esEdicion ? 'Guardar cambios' : 'Crear rutina'}
        </button>
        <button type="button" className="boton boton--terciario" onClick={onCancelar}>
          Cancelar
        </button>
      </footer>

      {editando !== null && (
        <EjercicioFormulario
          inicial={editando === 'nuevo' ? null : ejercicios[editando].borrador}
          onGuardar={guardarEjercicio}
          onCerrar={() => setEditando(null)}
        />
      )}
    </div>
  )
}
