import { useState } from 'react'
import { ChevronRight, Plus, Share2, Trash2 } from 'lucide-react'
import Logo from './Logo'
import ExportarRutinas from './ExportarRutinas'
import { seriesHechas } from '../lib/storage'
import { plural, totalSeries, zonasDeRutina } from '../lib/rutinas'
import { useGestoAtras } from '../lib/gestoAtras'

function progresoRutina(registros, rutina) {
  let hechas = 0
  let total = 0
  rutina.ejercicios.forEach((ej) => {
    hechas += seriesHechas(registros, rutina.id, ej)
    total += totalSeries(ej)
  })
  return { hechas, total }
}

/** Un boton por rutina importada. */
export default function ListaRutinas({ rutinas, registros, onAbrir, onNueva, onEliminarTodo }) {
  const [exportando, setExportando] = useState(false)
  useGestoAtras(exportando, () => setExportando(false))

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
                <ChevronRight className="tarjeta__flecha" size={22} aria-hidden="true" />
              </button>
            </li>
          )
        })}
      </ul>

      <footer className="pie">
        <button
          type="button"
          className="boton boton--primario boton--grande boton--anadir"
          onClick={onNueva}
        >
          <Plus size={20} aria-hidden="true" />
          Nueva rutina
        </button>

        <div className="acciones">
          <button
            type="button"
            className="boton boton--terciario"
            onClick={() => setExportando(true)}
          >
            <Share2 size={16} aria-hidden="true" />
            Exportar
          </button>
          <button type="button" className="boton boton--peligroso" onClick={onEliminarTodo}>
            <Trash2 size={16} aria-hidden="true" />
            {rutinas.length === 1 ? 'Eliminar' : 'Eliminar todo'}
          </button>
        </div>
      </footer>

      {exportando && <ExportarRutinas rutinas={rutinas} onCerrar={() => setExportando(false)} />}
    </div>
  )
}
