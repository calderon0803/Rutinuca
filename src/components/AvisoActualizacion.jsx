import { RefreshCw } from 'lucide-react'
import { useActualizacion } from '../lib/actualizacion'

/** Barra que aparece abajo cuando hay una version nueva lista para entrar. */
export default function AvisoActualizacion() {
  const { hayVersionNueva, actualizar } = useActualizacion()

  if (!hayVersionNueva) return null

  return (
    <div className="aviso" role="status">
      <span className="aviso__texto">Hay una versión nueva de Rutinuca</span>
      <button type="button" className="boton boton--terciario boton--pequeno" onClick={actualizar}>
        <RefreshCw size={15} aria-hidden="true" />
        Actualizar
      </button>
    </div>
  )
}
