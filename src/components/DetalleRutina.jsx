import { useState } from 'react'
import Etiquetas from './Etiquetas'
import Leyenda from './Leyenda'
import { plural, resumenSeries, totalSeries } from '../lib/rutinas'
import { seriesHechas, ultimaSesion } from '../lib/storage'
import { formatearFecha } from '../lib/fechas'

/** Lista de ejercicios de una rutina; cada uno abre su modal. */
export default function DetalleRutina({
  rutina,
  registros,
  historial,
  onVolver,
  onAbrirEjercicio,
  onFinalizar,
  puedeFinalizar,
  onReiniciar,
}) {
  const ultima = ultimaSesion(historial, rutina.id)
  const [verLeyenda, setVerLeyenda] = useState(false)

  return (
    <div className="pantalla">
      <header className="cabecera cabecera--con-volver">
        <button type="button" className="boton-volver" onClick={onVolver}>
          <span aria-hidden="true">‹</span> Rutinas
        </button>
        <h1 className="cabecera__titulo">{rutina.rutina}</h1>
        <p className="cabecera__sub">
          {plural(rutina.ejercicios.length, 'ejercicio', 'ejercicios')}
          {ultima && ` · último entrenamiento: ${formatearFecha(ultima.fecha)}`}
        </p>
      </header>

      <ul className="lista">
        {rutina.ejercicios.map((ejercicio, indice) => {
          const hechas = seriesHechas(registros, rutina.id, indice, ejercicio)
          const total = totalSeries(ejercicio)
          const completo = hechas === total
          return (
            <li key={`${indice}-${ejercicio.ejercicio}`}>
              <button
                type="button"
                className={`tarjeta tarjeta--ejercicio${completo ? ' tarjeta--completa' : ''}`}
                onClick={() => onAbrirEjercicio(indice)}
              >
                <span className="tarjeta__principal">
                  <span className="tarjeta__titulo">{ejercicio.ejercicio}</span>
                  {ejercicio.superserie_ejercicio && (
                    <span className="tarjeta__pareja">
                      + {ejercicio.superserie_ejercicio.ejercicio}
                    </span>
                  )}
                  <span className="tarjeta__meta">{resumenSeries(ejercicio)}</span>
                  <Etiquetas ejercicio={ejercicio} />
                </span>
                <span className={`progreso${completo ? ' progreso--completo' : ''}`}>
                  {hechas}/{total}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        className="boton boton--fantasma boton--pequeno leyenda__enlace"
        onClick={() => setVerLeyenda(true)}
      >
        ¿Qué significan las etiquetas?
      </button>

      <footer className="pie">
        <button
          type="button"
          className="boton boton--primario"
          onClick={onFinalizar}
          disabled={!puedeFinalizar}
        >
          Finalizar entrenamiento
        </button>
        <button type="button" className="boton boton--fantasma" onClick={onReiniciar}>
          Reiniciar registro de esta rutina
        </button>
      </footer>

      {verLeyenda && <Leyenda onCerrar={() => setVerLeyenda(false)} />}
    </div>
  )
}
