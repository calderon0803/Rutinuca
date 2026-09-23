import Logo from './Logo'
import { seriesHechas } from '../lib/storage'
import { aFormatoExportable, plural, totalSeries, zonasDeRutina } from '../lib/rutinas'
import { descargarJson } from '../lib/descargas'

function progresoRutina(registros, rutina) {
  let hechas = 0
  let total = 0
  rutina.ejercicios.forEach((ej, i) => {
    hechas += seriesHechas(registros, rutina.id, i, ej)
    total += totalSeries(ej)
  })
  return { hechas, total }
}

/** Un boton por rutina importada. */
export default function ListaRutinas({ rutinas, registros, onAbrir, onEliminar }) {
  return (
    <div className="pantalla">
      <header className="cabecera cabecera--marca">
        <h1 className="cabecera__titulo">
          <Logo className="cabecera__logo" />
        </h1>
      </header>

      <ul className="lista">
        {rutinas.map((rutina) => {
          const { hechas, total } = progresoRutina(registros, rutina)
          const zonas = zonasDeRutina(rutina)
          return (
            <li key={rutina.id}>
              <button
                type="button"
                className="tarjeta tarjeta--rutina"
                onClick={() => onAbrir(rutina.id)}
              >
                <span className="tarjeta__principal">
                  <span className="tarjeta__titulo">{rutina.rutina}</span>
                  <span className="tarjeta__meta">
                    {plural(rutina.ejercicios.length, 'ejercicio', 'ejercicios')} · {hechas}/{total}{' '}
                    series
                  </span>
                  {zonas.length > 0 && (
                    <span className="pildoras">
                      {zonas.map((zona) => (
                        <span className="pildora" key={zona}>
                          {zona}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
                <span className="tarjeta__flecha" aria-hidden="true">
                  ›
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <footer className="pie pie--compacto">
        <button
          type="button"
          className="boton boton--fantasma"
          onClick={() => descargarJson('rutinuca-rutinas.json', aFormatoExportable(rutinas))}
        >
          Exportar rutina
        </button>
        <button type="button" className="boton boton--fantasma" onClick={onEliminar}>
          Eliminar rutina
        </button>
      </footer>
    </div>
  )
}
