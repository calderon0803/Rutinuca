import BotonImportar from './BotonImportar'
import Logo from './Logo'
import { PLANTILLA, descargarPlantilla } from '../data/plantilla'
import { normalizarImportacion } from '../lib/rutinas'

/** Primera pantalla: crear una rutina, cargar la tuya o la de ejemplo. */
export default function Inicio({ onImportar, onCrear }) {
  return (
    <div className="inicio">
      <div className="inicio__marca">
        <h1 className="inicio__titulo">
          <Logo />
        </h1>
      </div>

      <div className="inicio__acciones">
        <BotonImportar onImportar={onImportar}>Importar rutina</BotonImportar>
        <button type="button" className="boton boton--secundario" onClick={onCrear}>
          Crear una rutina
        </button>
        <button
          type="button"
          className="boton boton--secundario"
          onClick={() => onImportar(normalizarImportacion(PLANTILLA))}
        >
          Usar la plantilla de ejemplo
        </button>
        <button type="button" className="boton boton--fantasma" onClick={descargarPlantilla}>
          Descargar plantilla
        </button>
      </div>
    </div>
  )
}
