import { useState } from 'react'
import { ChevronLeft, CircleCheckBig, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import Etiquetas from './Etiquetas'
import Leyenda from './Leyenda'
import { plural, resumenSeries, totalSeries } from '../lib/rutinas'
import { claveEjercicio, estaSeparada, seriesHechas, ultimaSesion } from '../lib/storage'
import { formatearFecha } from '../lib/fechas'
import { useGestoAtras } from '../lib/gestoAtras'

/** Lista de ejercicios de una rutina; cada uno abre su modal. */
export default function DetalleRutina({
  rutina,
  registros,
  historial,
  separadas,
  onVolver,
  onAbrirEjercicio,
  onFinalizar,
  puedeFinalizar,
  onReiniciar,
  onEditar,
  onEliminarRutina,
}) {
  const ultima = ultimaSesion(historial, rutina.id)
  const [verLeyenda, setVerLeyenda] = useState(false)
  useGestoAtras(verLeyenda, () => setVerLeyenda(false))

  return (
    <div className="pantalla">
      <header className="cabecera cabecera--con-volver">
        <button type="button" className="boton-volver" onClick={onVolver}>
          <ChevronLeft size={16} aria-hidden="true" />
          Rutinas
        </button>
        <h1 className="cabecera__titulo">{rutina.rutina}</h1>
        <p className="cabecera__sub">
          {plural(rutina.ejercicios.length, 'ejercicio', 'ejercicios')}
          {ultima && ` · último entrenamiento: ${formatearFecha(ultima.fecha)}`}
        </p>
      </header>

      <ul className="lista">
        {rutina.ejercicios.map((ejercicio, indice) => {
          const hechas = seriesHechas(registros, rutina.id, ejercicio)
          const separada = estaSeparada(separadas, rutina.id, claveEjercicio(ejercicio))
          const total = totalSeries(ejercicio)
          const completo = hechas === total
          return (
            <li key={ejercicio.id}>
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
                  <span className="tarjeta__meta">
                    {ejercicio.grupo && `${ejercicio.grupo} · `}
                    {resumenSeries(ejercicio)}
                  </span>
                  <Etiquetas ejercicio={ejercicio} separada={separada} />
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
        className="boton boton--terciario boton--pequeno leyenda__enlace"
        onClick={() => setVerLeyenda(true)}
      >
        ¿Qué significan las etiquetas?
      </button>

      <footer className="pie">
        <button
          type="button"
          className="boton boton--primario boton--grande"
          onClick={onFinalizar}
          disabled={!puedeFinalizar}
        >
          <CircleCheckBig size={20} aria-hidden="true" />
          Finalizar entrenamiento
        </button>
        <div className="acciones">
          <button type="button" className="boton boton--terciario" onClick={onEditar}>
            <Pencil size={16} aria-hidden="true" />
            Editar
          </button>
          <button type="button" className="boton boton--terciario" onClick={onReiniciar}>
            <RotateCcw size={16} aria-hidden="true" />
            Reiniciar
          </button>
          <button type="button" className="boton boton--peligroso" onClick={onEliminarRutina}>
            <Trash2 size={16} aria-hidden="true" />
            Eliminar
          </button>
        </div>
      </footer>

      {verLeyenda && <Leyenda onCerrar={() => setVerLeyenda(false)} />}
    </div>
  )
}
