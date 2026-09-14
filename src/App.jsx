import { useCallback, useEffect, useState } from 'react'
import Inicio from './components/Inicio'
import ListaRutinas from './components/ListaRutinas'
import DetalleRutina from './components/DetalleRutina'
import EjercicioModal from './components/EjercicioModal'
import Confirmacion from './components/Confirmacion'
import {
  actualizarSerie,
  cargarHistorial,
  cargarRegistros,
  cargarRutinas,
  cerrarSesion,
  guardarHistorial,
  guardarRegistros,
  guardarRutinas,
  hayAlgoAnotado,
  limpiarRutina,
  replicarPeso,
} from './lib/storage'

export default function App() {
  const [rutinas, setRutinas] = useState(cargarRutinas)
  const [registros, setRegistros] = useState(cargarRegistros)
  const [historial, setHistorial] = useState(cargarHistorial)
  const [rutinaId, setRutinaId] = useState(null)
  const [ejercicioAbierto, setEjercicioAbierto] = useState(null)
  const [confirmacion, setConfirmacion] = useState(null)

  useEffect(() => {
    guardarRutinas(rutinas)
  }, [rutinas])

  useEffect(() => {
    guardarRegistros(registros)
  }, [registros])

  useEffect(() => {
    guardarHistorial(historial)
  }, [historial])

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

  const cerrarModal = useCallback(() => setEjercicioAbierto(null), [])

  // Solo hay una importación activa: para cargar otro fichero hay que eliminarla.
  function importar(nuevas) {
    setRutinas(nuevas)
  }

  function eliminarImportacion() {
    setConfirmacion({
      mensaje: 'Se eliminará la rutina y todo el registro de series.',
      textoAccion: 'Eliminar',
      peligro: true,
      alAceptar: () => {
        setRutinas([])
        setRegistros({})
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
        setRutinaId(null)
      },
    })
  }

  function reiniciarRegistro() {
    setConfirmacion({
      mensaje: 'Se descartará lo anotado en esta rutina, sin guardarlo en el historial.',
      textoAccion: 'Descartar',
      peligro: true,
      alAceptar: () => setRegistros((previos) => limpiarRutina(previos, rutinaId)),
    })
  }

  let pantalla
  if (rutinas.length === 0) {
    pantalla = <Inicio onImportar={importar} />
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
            onCambiar={cambiarSerie}
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
