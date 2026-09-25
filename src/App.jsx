import { useCallback, useEffect, useState } from 'react'
import Inicio from './components/Inicio'
import ListaRutinas from './components/ListaRutinas'
import DetalleRutina from './components/DetalleRutina'
import EjercicioModal from './components/EjercicioModal'
import Confirmacion from './components/Confirmacion'
import EditorRutina from './components/EditorRutina'
import AvisoActualizacion from './components/AvisoActualizacion'
import { conIdLibre } from './lib/rutinas'
import { useGestoAtras } from './lib/gestoAtras'
import {
  actualizarSerie,
  alternarSeparada,
  cargarHistorial,
  cargarRegistros,
  cargarRutinas,
  cargarSeparadas,
  cerrarSesion,
  guardarHistorial,
  guardarRegistros,
  guardarRutinas,
  guardarSeparadas,
  hayAlgoAnotado,
  limpiarRutina,
  replicarPeso,
} from './lib/storage'

export default function App() {
  const [rutinas, setRutinas] = useState(cargarRutinas)
  const [registros, setRegistros] = useState(cargarRegistros)
  const [historial, setHistorial] = useState(cargarHistorial)
  const [separadas, setSeparadas] = useState(cargarSeparadas)
  const [rutinaId, setRutinaId] = useState(null)
  const [ejercicioAbierto, setEjercicioAbierto] = useState(null)
  const [confirmacion, setConfirmacion] = useState(null)
  // null = cerrado | { id: null } = rutina nueva | { id } = editando esa rutina
  const [editor, setEditor] = useState(null)

  useEffect(() => {
    guardarRutinas(rutinas)
  }, [rutinas])

  useEffect(() => {
    guardarRegistros(registros)
  }, [registros])

  useEffect(() => {
    guardarHistorial(historial)
  }, [historial])

  useEffect(() => {
    guardarSeparadas(separadas)
  }, [separadas])

  const rutinaActiva = rutinas.find((r) => r.id === rutinaId) ?? null

  // Volver atras cierra la capa de arriba en vez de salirse de la app.
  useGestoAtras(Boolean(rutinaActiva), () => setRutinaId(null))
  useGestoAtras(Boolean(editor), () => setEditor(null))
  useGestoAtras(ejercicioAbierto !== null, () => setEjercicioAbierto(null))
  useGestoAtras(Boolean(confirmacion), () => setConfirmacion(null))

  const cambiarSerie = useCallback(
    (clave, indiceSerie, campo, valor) => {
      setRegistros((previos) =>
        actualizarSerie(previos, rutinaId, clave, indiceSerie, campo, valor),
      )
    },
    [rutinaId],
  )

  const replicar = useCallback(
    (clave, series) => {
      setRegistros((previos) => replicarPeso(previos, rutinaId, clave, series))
    },
    [rutinaId],
  )

  // Una superserie que hoy no se puede encadenar se hace por separado.
  const separar = useCallback(
    (clave) => setSeparadas((previas) => alternarSeparada(previas, rutinaId, clave)),
    [rutinaId],
  )

  const cerrarModal = useCallback(() => setEjercicioAbierto(null), [])

  // Solo hay una importación activa: para cargar otro fichero hay que eliminarla.
  function importar(nuevas) {
    setRutinas(nuevas)
  }

  /**
   * Crear anade una rutina a las que ya hay; editar sustituye la suya conservando
   * su id, que es la clave de su registro y su historial. Importar un fichero
   * sigue reemplazando todas.
   */
  function guardarRutina([nueva]) {
    setRutinas((previas) =>
      editor.id
        ? previas.map((rutina) => (rutina.id === editor.id ? { ...nueva, id: editor.id } : rutina))
        : [...previas, conIdLibre(nueva, previas)],
    )
    setEditor(null)
  }

  function eliminarRutina(id) {
    const rutina = rutinas.find((r) => r.id === id)
    setConfirmacion({
      mensaje: `Se eliminará "${rutina.rutina}" y su historial.`,
      textoAccion: 'Eliminar',
      peligro: true,
      alAceptar: () => {
        setRutinas((previas) => previas.filter((r) => r.id !== id))
        setRegistros((previos) => limpiarRutina(previos, id))
        setSeparadas((previas) => limpiarRutina(previas, id))
        setHistorial((previo) => limpiarRutina(previo, id))
        setRutinaId(null)
      },
    })
  }

  function eliminarImportacion() {
    setConfirmacion({
      mensaje:
        rutinas.length === 1
          ? 'Se eliminará la rutina, con su registro y su historial.'
          : `Se eliminarán las ${rutinas.length} rutinas, con su registro y su historial.`,
      textoAccion: 'Eliminar',
      peligro: true,
      alAceptar: () => {
        setRutinas([])
        setRegistros({})
        setSeparadas({})
        setHistorial({})
        setRutinaId(null)
      },
    })
  }

  // Guarda lo hecho hoy en el historial y deja la rutina lista para el proximo dia.
  function finalizarEntrenamiento() {
    setConfirmacion({
      mensaje: 'Se guardará el entrenamiento de hoy y la rutina quedará a cero.',
      textoAccion: 'Finalizar',
      alAceptar: () => {
        const cerrada = cerrarSesion(registros, historial, rutinaId)
        setRegistros(cerrada.registros)
        setHistorial(cerrada.historial)
        setSeparadas((previas) => limpiarRutina(previas, rutinaId))
        setRutinaId(null)
      },
    })
  }

  function reiniciarRegistro() {
    setConfirmacion({
      mensaje: 'Se descartará lo anotado en esta rutina, sin guardarlo en el historial.',
      textoAccion: 'Descartar',
      peligro: true,
      alAceptar: () => {
        setRegistros((previos) => limpiarRutina(previos, rutinaId))
        setSeparadas((previas) => limpiarRutina(previas, rutinaId))
      },
    })
  }

  let pantalla
  if (editor) {
    pantalla = (
      <EditorRutina
        rutina={editor.id ? rutinas.find((r) => r.id === editor.id) : null}
        onGuardar={guardarRutina}
        onCancelar={() => setEditor(null)}
      />
    )
  } else if (rutinas.length === 0) {
    pantalla = <Inicio onImportar={importar} onCrear={() => setEditor({ id: null })} />
  } else if (!rutinaActiva) {
    pantalla = (
      <ListaRutinas
        rutinas={rutinas}
        registros={registros}
        onAbrir={setRutinaId}
        onNueva={() => setEditor({ id: null })}
        onEliminarTodo={eliminarImportacion}
      />
    )
  } else {
    pantalla = (
      <>
        <DetalleRutina
          rutina={rutinaActiva}
          registros={registros}
          historial={historial}
          separadas={separadas}
          onVolver={() => setRutinaId(null)}
          onAbrirEjercicio={setEjercicioAbierto}
          onFinalizar={finalizarEntrenamiento}
          onEditar={() => setEditor({ id: rutinaActiva.id })}
          onEliminarRutina={() => eliminarRutina(rutinaActiva.id)}
          puedeFinalizar={hayAlgoAnotado(registros, rutinaActiva.id)}
          onReiniciar={reiniciarRegistro}
        />
        {ejercicioAbierto != null && rutinaActiva.ejercicios[ejercicioAbierto] && (
          <EjercicioModal
            rutinaId={rutinaActiva.id}
            ejercicio={rutinaActiva.ejercicios[ejercicioAbierto]}
            registros={registros}
            historial={historial}
            separadas={separadas}
            onCambiar={cambiarSerie}
            onSeparar={separar}
            onReplicar={replicar}
            onCerrar={cerrarModal}
          />
        )}
      </>
    )
  }

  return (
    <>
      {pantalla}
      <AvisoActualizacion />
      {confirmacion && (
        <Confirmacion
          mensaje={confirmacion.mensaje}
          textoAccion={confirmacion.textoAccion}
          peligro={confirmacion.peligro}
          onAceptar={() => {
            confirmacion.alAceptar()
            setConfirmacion(null)
          }}
          onCancelar={() => setConfirmacion(null)}
        />
      )}
    </>
  )
}
