import BotonImportar from './BotonImportar'
import Logo from './Logo'
import { descargarPlantilla } from '../data/plantilla'

/** Primera pantalla: importar una rutina o descargar la plantilla de ejemplo. */
export default function Inicio({ onImportar }) {
  return (
    <div className="inicio">
      <div className="inicio__marca">
        <h1 className="inicio__titulo">
          <Logo />
        </h1>
      </div>

      <div className="inicio__acciones">
        <BotonImportar onImportar={onImportar}>Importar rutina</BotonImportar>
        <button type="button" className="boton boton--secundario" onClick={descargarPlantilla}>
          Descargar plantilla
        </button>
      </div>
    </div>
  )
}
