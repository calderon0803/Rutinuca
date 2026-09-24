import { Download, FileText, Plus } from 'lucide-react'
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
        <button type="button" className="boton boton--primario boton--grande" onClick={onCrear}>
          <Plus size={20} aria-hidden="true" />
          Crear una rutina
        </button>
        <BotonImportar onImportar={onImportar} variante="secundario">
          Importar rutina
        </BotonImportar>

        <div className="acciones">
          <button
            type="button"
            className="boton boton--terciario"
            onClick={() => onImportar(normalizarImportacion(PLANTILLA))}
          >
            <FileText size={16} aria-hidden="true" />
            Usar plantilla
          </button>
          <button type="button" className="boton boton--terciario" onClick={descargarPlantilla}>
            <Download size={16} aria-hidden="true" />
            Descargar
          </button>
        </div>
      </div>
    </div>
  )
}
