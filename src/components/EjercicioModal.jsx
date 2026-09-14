import { Fragment, useEffect, useRef } from 'react'
import { formatearObjetivo } from '../lib/rutinas'
import { claveEjercicio, referenciaAnterior, serieRegistrada } from '../lib/storage'
import { resumenSerie } from '../lib/fechas'

function BloqueSeries({
  ejercicio,
  clave,
  rutinaId,
  registros,
  historial,
  onCambiar,
  onReplicar,
  esPareja,
}) {
  const series = Array.from({ length: ejercicio.series }, (_, i) => i)

  return (
    <section className={`bloque${esPareja ? ' bloque--pareja' : ''}`}>
      {/* El titular del ejercicio principal ya esta en la barra del modal. */}
      {esPareja && (
        <header className="bloque__cabecera">
          <p className="bloque__enlace">En superserie con</p>
          <h3 className="bloque__titulo">{ejercicio.ejercicio}</h3>
        </header>
      )}

      {ejercicio.indicaciones && <p className="indicaciones">{ejercicio.indicaciones}</p>}

      <table className="series">
        <thead>
          <tr>
            <th scope="col" className="series__col-num">
              Serie
            </th>
            <th scope="col">Reps</th>
            <th scope="col">Peso (kg)</th>
            <th scope="col" className="series__col-check">
              Hecha
            </th>
          </tr>
        </thead>
        <tbody>
          {series.map((i) => {
            const objetivo = formatearObjetivo(ejercicio.repeticiones_por_serie[i])
            const registro = serieRegistrada(registros, rutinaId, clave, i)
            const anterior = referenciaAnterior(historial, rutinaId, clave, i)
            return (
              <Fragment key={i}>
                <tr className={registro.hecha ? 'series__fila--hecha' : undefined}>
                  <th scope="row" className="series__num">
                    {i + 1}
                    {ejercicio.topset && i === 0 && <span className="series__topset">Top set</span>}
                    {objetivo && <span className="series__objetivo">obj. {objetivo}</span>}
                  </th>
                  <td>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      className="campo"
                      placeholder={objetivo || '-'}
                      value={registro.reps}
                      onChange={(e) => onCambiar(clave, i, 'reps', e.target.value)}
                      aria-label={`Repeticiones de la serie ${i + 1} de ${ejercicio.ejercicio}`}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.5"
                      className="campo"
                      placeholder="0"
                      value={registro.peso}
                      onChange={(e) => onCambiar(clave, i, 'peso', e.target.value)}
                      aria-label={`Peso de la serie ${i + 1} de ${ejercicio.ejercicio}`}
                    />
                  </td>
                  <td className="series__col-check">
                    <input
                      type="checkbox"
                      className="check"
                      checked={registro.hecha}
                      onChange={(e) => onCambiar(clave, i, 'hecha', e.target.checked)}
                      aria-label={`Marcar la serie ${i + 1} de ${ejercicio.ejercicio} como hecha`}
                    />
                  </td>
                </tr>
                {anterior && (
                  <tr className="series__anterior">
                    <td colSpan={4}>Anterior: {resumenSerie(anterior)}</td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>

      {ejercicio.series > 1 && (
        <button
          type="button"
          className="boton boton--fantasma boton--pequeno"
          onClick={() => onReplicar(clave, ejercicio.series)}
        >
          Repetir el peso de la serie 1 en las demás
        </button>
      )}
    </section>
  )
}

/** Modal con el detalle del ejercicio: indicaciones y registro de cada serie. */
export default function EjercicioModal({
  rutinaId,
  indice,
  ejercicio,
  registros,
  historial,
  onCambiar,
  onReplicar,
  onCerrar,
}) {
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

  const pareja = ejercicio.superserie_ejercicio

  return (
    <div className="fondo-modal" onClick={onCerrar}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={ejercicio.ejercicio}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__barra">
          <h2 className="modal__titulo">{ejercicio.ejercicio}</h2>
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
          <BloqueSeries
            ejercicio={ejercicio}
            clave={claveEjercicio(indice, ejercicio.ejercicio)}
            rutinaId={rutinaId}
            registros={registros}
            historial={historial}
            onCambiar={onCambiar}
            onReplicar={onReplicar}
          />

          {pareja && (
            <BloqueSeries
              esPareja
              ejercicio={pareja}
              clave={claveEjercicio(indice, pareja.ejercicio, true)}
              rutinaId={rutinaId}
              registros={registros}
              historial={historial}
              onCambiar={onCambiar}
              onReplicar={onReplicar}
            />
          )}

          <p className="nota">Los pesos y repeticiones se guardan solos en este dispositivo.</p>
        </div>
      </div>
    </div>
  )
}
