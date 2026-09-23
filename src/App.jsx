import { useCallback, useEffect, useState } from 'react'
import Inicio from './components/Inicio'
import ListaRutinas from './components/ListaRutinas'
import DetalleRutina from './components/DetalleRutina'
import EjercicioModal from './components/EjercicioModal'
import Confirmacion from './components/Confirmacion'
import CrearRutina from './components/CrearRutina'
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
  limpiarSeparadas,
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
  const [creando, setCreando] = useState(false)

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

  function crearRutina(nuevas) {
    setRutinas(nuevas)
    setCreando(false)
  }

  function eliminarImportacion() {
    setConfirmacion({
      mensaje: 'Se eliminará la rutina y todo el registro de series.',
      textoAccion: 'Eliminar',
      peligro: true,
      alAceptar: () => {
        setRutinas([])
        setRegistros({})
        setSeparadas({})
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
        setSeparadas((previas) => limpiarSeparadas(previas, rutinaId))
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
        setSeparadas((previas) => limpiarSeparadas(previas, rutinaId))
      },
    })
  }

  let pantalla
  if (creando) {
    pantalla = <CrearRutina onCrear={crearRutina} onCancelar={() => setCreando(false)} />
  } else if (rutinas.length === 0) {
    pantalla = <Inicio onImportar={importar} onCrear={() => setCreando(true)} />
  } else if (!rutinaActiva) {
    pantalla = (
      <ListaRutinas
        rutinas={rutinas}
        registros={registros}
        onAbrir={setRutinaId}
        onEliminar={eliminarImportacion}
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
          puedeFinalizar={hayAlgoAnotado(registros, rutinaActiva.id)}
          onReiniciar={reiniciarRegistro}
        />
        {ejercicioAbierto != null && rutinaActiva.ejercicios[ejercicioAbierto] && (
          <EjercicioModal
            rutinaId={rutinaActiva.id}
            indice={ejercicioAbierto}
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
