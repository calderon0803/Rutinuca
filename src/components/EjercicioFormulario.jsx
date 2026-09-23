import { useEffect, useId, useRef, useState } from 'react'
import { ZONAS } from '../data/grupos'
import { esObjetivoValido } from '../lib/rutinas'

const SERIES_POR_DEFECTO = 3

// Como se hace el ejercicio: es una eleccion, no una suma de casillas.
const TIPOS = [
  { valor: 'normal', titulo: 'Normal', pista: 'Series sueltas, con su descanso entre una y otra.' },
  { valor: 'topset', titulo: 'Top set', pista: 'La primera serie es la más pesada del ejercicio.' },
  {
    valor: 'superserie',
    titulo: 'Superserie',
    pista: 'Encadenado con otro ejercicio, sin descanso entre ellos.',
  },
]

function ejercicioVacio() {
  return {
    ejercicio: '',
    grupo: '',
    indicaciones: '',
    series: Array.from({ length: SERIES_POR_DEFECTO }, () => ''),
    tipo: 'normal',
    pareja: {
      ejercicio: '',
      grupo: '',
      indicaciones: '',
      series: Array.from({ length: SERIES_POR_DEFECTO }, () => ''),
    },
  }
}

/** Deja el array de objetivos con `largo` posiciones, repitiendo la ultima. */
function ajustarLargo(series, largo) {
  return Array.from({ length: largo }, (_, i) => series[i] ?? series[series.length - 1] ?? '')
}

function revisar(borrador) {
  const fallos = {}
  if (!borrador.ejercicio.trim()) fallos.ejercicio = 'Ponle nombre al ejercicio.'
  if (!borrador.grupo) fallos.grupo = 'Elige un grupo muscular.'
  if (borrador.series.some((s) => !esObjetivoValido(s))) {
    fallos.series = 'Escribe los objetivos como "8-10" o como un número. Déjalo vacío si no fijas.'
  }
  if (borrador.tipo === 'superserie') {
    if (!borrador.pareja.ejercicio.trim())
      fallos.parejaEjercicio = 'Ponle nombre al otro ejercicio.'
    if (!borrador.pareja.grupo) fallos.parejaGrupo = 'Elige su grupo muscular.'
    if (borrador.pareja.series.some((s) => !esObjetivoValido(s))) {
      fallos.parejaSeries = 'Revisa los objetivos de la superserie.'
    }
  }
  return fallos
}

/** Pasa el borrador al formato del fichero de rutinas. */
function aEjercicio(borrador) {
  const salida = {
    ejercicio: borrador.ejercicio.trim(),
    grupo: borrador.grupo,
    series: borrador.series.map((s) => s.trim()),
    topset: borrador.tipo === 'topset',
  }
  if (borrador.indicaciones.trim()) salida.indicaciones = borrador.indicaciones.trim()

  if (borrador.tipo === 'superserie') {
    salida.superserie_ejercicio = {
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

/** Opciones del desplegable, agrupadas por zona del cuerpo. */
function OpcionesDeGrupo() {
  return (
    <>
      <option value="">Elige uno…</option>
      {ZONAS.map(({ zona, grupos }) =>
        // Una zona de un solo musculo no necesita cabecera propia.
        grupos.length === 1 ? (
          <option key={zona} value={grupos[0]}>
            {grupos[0]}
          </option>
        ) : (
          <optgroup label={zona} key={zona}>
            {grupos.map((grupo) => (
              <option key={grupo} value={grupo}>
                {grupo}
              </option>
            ))}
          </optgroup>
        ),
      )}
    </>
  )
}

function CamposSeries({ series, onCambiar, error, etiqueta }) {
  return (
    <div className="formulario__campo">
      <span className="formulario__etiqueta">{etiqueta}</span>

      <ol className="series-edicion">
        {series.map((objetivo, i) => (
          <li className="series-edicion__fila" key={i}>
            <span className="series-edicion__num">Serie {i + 1}</span>
            <input
              type="text"
              inputMode="numeric"
              className="campo"
              placeholder="8-10"
              value={objetivo}
              onChange={(e) => onCambiar(series.map((s, j) => (j === i ? e.target.value : s)))}
              aria-label={`Objetivo de repeticiones de la serie ${i + 1}`}
            />
            <button
              type="button"
              className="boton-quitar"
              onClick={() => onCambiar(series.filter((_, j) => j !== i))}
              disabled={series.length === 1}
              aria-label={`Quitar la serie ${i + 1}`}
            >
              −
            </button>
          </li>
        ))}
      </ol>

      <button
        type="button"
        className="boton boton--fantasma boton--pequeno"
        onClick={() => onCambiar([...series, series[series.length - 1] ?? ''])}
      >
        + Añadir serie
      </button>

      {error && <p className="formulario__error">{error}</p>}
    </div>
  )
}

/** Alta y edicion de un ejercicio: el usuario escribe todo, no hay catalogo. */
export default function EjercicioFormulario({ inicial, onGuardar, onCerrar }) {
  const [borrador, setBorrador] = useState(() => inicial ?? ejercicioVacio())
  const [fallos, setFallos] = useState({})
  const primeroRef = useRef(null)
  const id = useId()

  useEffect(() => {
    primeroRef.current?.focus()
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

  const cambiar = (campo, valor) => setBorrador((b) => ({ ...b, [campo]: valor }))
  const cambiarPareja = (campo, valor) =>
    setBorrador((b) => ({ ...b, pareja: { ...b.pareja, [campo]: valor } }))

  // En una superserie se alterna una serie de cada uno: van a la par.
  const cambiarSeries = (series) =>
    setBorrador((b) => ({
      ...b,
      series,
      pareja: { ...b.pareja, series: ajustarLargo(b.pareja.series, series.length) },
    }))

  function enviar(evento) {
    evento.preventDefault()
    const encontrados = revisar(borrador)
    setFallos(encontrados)
    if (Object.keys(encontrados).length === 0) onGuardar(aEjercicio(borrador), borrador)
  }

  return (
    <div className="fondo-modal" onClick={onCerrar}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={inicial ? 'Editar ejercicio' : 'Nuevo ejercicio'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__barra">
          <h2 className="modal__titulo">{inicial ? 'Editar ejercicio' : 'Nuevo ejercicio'}</h2>
          <button type="button" className="boton-cerrar" onClick={onCerrar} aria-label="Cerrar">
            ×
          </button>
        </div>

        <form className="modal__cuerpo formulario" onSubmit={enviar} noValidate>
          <div className="formulario__campo">
            <label className="formulario__etiqueta" htmlFor={`${id}-nombre`}>
              Ejercicio
            </label>
            <input
              ref={primeroRef}
              id={`${id}-nombre`}
              type="text"
              className="campo"
              placeholder="Press banca"
              required
              aria-invalid={Boolean(fallos.ejercicio)}
              value={borrador.ejercicio}
              onChange={(e) => cambiar('ejercicio', e.target.value)}
            />
            {fallos.ejercicio && <p className="formulario__error">{fallos.ejercicio}</p>}
          </div>

          <div className="formulario__campo">
            <label className="formulario__etiqueta" htmlFor={`${id}-grupo`}>
              Grupo muscular
            </label>
            <select
              id={`${id}-grupo`}
              className="campo"
              value={borrador.grupo}
              onChange={(e) => cambiar('grupo', e.target.value)}
            >
              <OpcionesDeGrupo />
            </select>
            {fallos.grupo && <p className="formulario__error">{fallos.grupo}</p>}
          </div>

          <div className="formulario__campo">
            <label className="formulario__etiqueta" htmlFor={`${id}-indicaciones`}>
              Indicaciones <span className="formulario__opcional">(opcional)</span>
            </label>
            <textarea
              id={`${id}-indicaciones`}
              className="campo campo--area"
              rows={3}
              placeholder="Técnica, tempo, agarre…"
              value={borrador.indicaciones}
              onChange={(e) => cambiar('indicaciones', e.target.value)}
            />
          </div>

          <CamposSeries
            etiqueta="Series y objetivo de repeticiones"
            series={borrador.series}
            onCambiar={cambiarSeries}
            error={fallos.series}
          />

          <fieldset className="selector-tipo">
            <legend className="formulario__etiqueta">Cómo se hace</legend>
            <div className="selector-tipo__opciones">
              {TIPOS.map(({ valor, titulo }) => (
                <label
                  key={valor}
                  className={`selector-tipo__opcion${
                    borrador.tipo === valor ? ' selector-tipo__opcion--activa' : ''
                  }`}
                >
                  <input
                    type="radio"
                    className="visualmente-oculto"
                    name={`${id}-tipo`}
                    value={valor}
                    checked={borrador.tipo === valor}
                    onChange={() => cambiar('tipo', valor)}
                  />
                  {titulo}
                </label>
              ))}
            </div>
            <p className="formulario__pista">
              {TIPOS.find(({ valor }) => valor === borrador.tipo).pista}
            </p>
          </fieldset>

          {borrador.tipo === 'superserie' && (
            <fieldset className="formulario__pareja">
              <legend className="formulario__leyenda">El otro ejercicio</legend>

              <div className="formulario__campo">
                <label className="formulario__etiqueta" htmlFor={`${id}-pareja-nombre`}>
                  Ejercicio
                </label>
                <input
                  id={`${id}-pareja-nombre`}
                  type="text"
                  className="campo"
                  placeholder="Elevaciones laterales"
                  required
                  aria-invalid={Boolean(fallos.parejaEjercicio)}
                  value={borrador.pareja.ejercicio}
                  onChange={(e) => cambiarPareja('ejercicio', e.target.value)}
                />
                {fallos.parejaEjercicio && (
                  <p className="formulario__error">{fallos.parejaEjercicio}</p>
                )}
              </div>

              <div className="formulario__campo">
                <label className="formulario__etiqueta" htmlFor={`${id}-pareja-grupo`}>
                  Grupo muscular
                </label>
                <select
                  id={`${id}-pareja-grupo`}
                  className="campo"
                  value={borrador.pareja.grupo}
                  onChange={(e) => cambiarPareja('grupo', e.target.value)}
                >
                  <OpcionesDeGrupo />
                </select>
                {fallos.parejaGrupo && <p className="formulario__error">{fallos.parejaGrupo}</p>}
              </div>

              <div className="formulario__campo">
                <label className="formulario__etiqueta" htmlFor={`${id}-pareja-indicaciones`}>
                  Indicaciones <span className="formulario__opcional">(opcional)</span>
                </label>
                <textarea
                  id={`${id}-pareja-indicaciones`}
                  className="campo campo--area"
                  rows={2}
                  value={borrador.pareja.indicaciones}
                  onChange={(e) => cambiarPareja('indicaciones', e.target.value)}
                />
              </div>

              <CamposSeries
                etiqueta="Objetivo de cada serie"
                series={borrador.pareja.series}
                onCambiar={(series) => cambiarPareja('series', series)}
                error={fallos.parejaSeries}
              />
              <p className="formulario__pista">
                Tiene el mismo número de series que el ejercicio principal, porque se alternan.
              </p>
            </fieldset>
          )}

          <div className="formulario__acciones">
            <button type="button" className="boton boton--secundario" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="boton boton--primario">
              {inicial ? 'Guardar' : 'Añadir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
