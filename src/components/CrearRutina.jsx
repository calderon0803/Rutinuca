import { useId, useMemo, useState } from 'react'
import EjercicioFormulario from './EjercicioFormulario'
import Etiquetas from './Etiquetas'
import { normalizarImportacion, plural, resumenSeries } from '../lib/rutinas'

/** Editor de una rutina nueva: nombre y lista de ejercicios escritos a mano. */
export default function CrearRutina({ onCrear, onCancelar }) {
  const [nombre, setNombre] = useState('')
  const [ejercicios, setEjercicios] = useState([])
  const [editando, setEditando] = useState(null)
  const [fallos, setFallos] = useState({})
  const id = useId()

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

  function guardarEjercicio(fichero, borrador) {
    setEjercicios((previos) =>
      editando === 'nuevo'
        ? [...previos, { fichero, borrador }]
        : previos.map((e, i) => (i === editando ? { fichero, borrador } : e)),
    )
    setEditando(null)
    setFallos((previos) => ({ ...previos, lista: undefined }))
  }

  function crear() {
    const encontrados = {}
    if (!nombre.trim()) encontrados.nombre = 'La rutina necesita un nombre.'
    if (ejercicios.length === 0) encontrados.lista = 'Añade al menos un ejercicio.'
    setFallos(encontrados)
    if (Object.keys(encontrados).length > 0) return

    onCrear(
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
          <span aria-hidden="true">‹</span> Inicio
        </button>
        <h1 className="cabecera__titulo">Nueva rutina</h1>
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
            <li className="tarjeta tarjeta--editable" key={indice}>
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
                ×
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
        + Añadir ejercicio
      </button>

      {fallos.lista && (
        <p className="formulario__error formulario__error--pie" role="alert">
          {fallos.lista}
        </p>
      )}

      <footer className="pie">
        <button type="button" className="boton boton--primario" onClick={crear}>
          Crear rutina
        </button>
        <button type="button" className="boton boton--fantasma" onClick={onCancelar}>
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
