import { useId, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { leerFicheroRutinas } from '../lib/rutinas'

/** Boton que abre el selector de ficheros y devuelve las rutinas ya normalizadas. */
export default function BotonImportar({ onImportar, variante = 'primario', extra = '', children }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const idError = useId()

  async function alElegirFichero(evento) {
    const fichero = evento.target.files?.[0]
    evento.target.value = '' // permite reimportar el mismo fichero
    if (!fichero) return
    try {
      onImportar(await leerFicheroRutinas(fichero))
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="importador">
      <button
        type="button"
        className={`boton boton--${variante}${extra ? ` ${extra}` : ''}`}
        onClick={() => inputRef.current?.click()}
        aria-describedby={error ? idError : undefined}
      >
        <Upload size={18} aria-hidden="true" />
        {children}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="visualmente-oculto"
        onChange={alElegirFichero}
      />
      {error && (
        <p className="error" id={idError} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
