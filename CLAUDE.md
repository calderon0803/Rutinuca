# Rutinuca

App React (Vite, JavaScript) para seguir rutinas de gimnasio. Sin backend: las
rutinas se importan de un JSON y todo se persiste en `localStorage`.

## Convenciones

- **Estilos**: SCSS global con BEM en `src/styles/`. Los tokens están en
  `_colors.scss`, `_breakpoints.scss` y `_medidas.scss`, reexportados por
  `_variables.scss`.
- El parcial de variables **no** se inyecta desde Vite: cada fichero de estilos
  empieza con `@use 'variables' as v;`.
- Colores siempre desde los tokens (`v.$color-...`). Si hace falta un tono nuevo,
  se pregunta antes de añadirlo.
- Media queries: base móvil, solo `min-width`, agrupadas al final de cada fichero
  y en orden ascendente, usando los breakpoints del parcial.
- Nombres de dominio en español (`rutina`, `ejercicio`, `series`). Comentarios e
  identificadores en español sin tildes; los textos que ve el usuario sí van
  acentuados.

### Botones

Todo lo que se pulsa es un botón; lo que cambia es el tamaño, según la
importancia. Cada pantalla tiene **una sola** acción principal, ancha y naranja,
y lo accesorio va en una **fila** debajo, nunca apilado: una columna de botones
se lee como una lista y todos parecen igual de importantes.

| Papel | Clases | Tamaño |
| --- | --- | --- |
| Principal de la pantalla | `boton--primario boton--grande` | ancho completo, 61 px |
| Alternativa de peso | `boton--secundario` | ancho completo, 51 px |
| Accesoria | `boton--terciario` | en fila, 42 px |
| Destructiva, al dispararla | `boton--peligroso` | en fila, 42 px, roja |
| Destructiva, al confirmarla | `boton--peligro` | solo en el diálogo |
| Dentro de un bloque | `boton--terciario boton--pequeno` | se ciñe al texto, 34 px |

Los iconos salen de **lucide-react**, la misma librería que usa Previuca. Van
con `aria-hidden` porque el texto del botón ya dice lo que hace; la excepción son
los botones que solo tienen icono (cerrar, quitar, mover), que llevan
`aria-label`. Tamaños: 20 px en la acción principal, 18 en las normales, 15-16 en
las pequeñas.

Las filas usan `.acciones`, que reparte el ancho a partes iguales. Los textos de
esa fila van cortos (*Editar*, *Reiniciar*, *Eliminar*) para que quepan tres.

## Estructura

- `src/lib/rutinas.js` — normaliza y valida el JSON importado; es el único sitio
  que decide qué formatos de fichero se aceptan. La validación es **estricta**:
  claves desconocidas, grupos fuera de lista, objetivos ilegibles o booleanos
  mal escritos cancelan la importación, para que un fichero no pueda declarar
  nada que la app no sepa hacer.
- Cada ejercicio lleva un `id` propio (`nuevoIdEjercicio`), y **lo anotado, el
  historial y las superseries separadas cuelgan de ese id**, nunca de la
  posición ni del nombre: así renombrar o reordenar no pierde nada. El id viaja
  en el fichero exportado.
- `src/lib/storage.js` — lectura/escritura de `rutinuca:rutinas`,
  `rutinuca:registros`, `rutinuca:separadas` y `rutinuca:historial`, más los
  helpers de progreso y de cierre de sesión. Lo que es del entrenamiento en
  curso (registro y superseries separadas) se borra al finalizarlo.
- `src/lib/fechas.js` — formato de fechas y resumen de una serie anotada.
- `src/components/` — `Inicio`, `ListaRutinas`, `DetalleRutina`, `EjercicioModal`.
- `src/data/plantilla.js` — plantilla de ejemplo que se descarga desde el inicio.
- `src/data/grupos.js` — lista cerrada de grupos musculares del formulario.
- `EditorRutina` + `EjercicioFormulario` — alta y edición de rutinas dentro de
  la app. El formulario produce objetos en **formato de fichero** y los pasa por
  `normalizarImportacion`, así que crear, editar e importar comparten validación.
- `src/lib/borradores.js` — traduce entre el borrador del formulario (todo
  texto) y el formato de fichero, en los dos sentidos. Editar una rutina
  guardada reconstruye el borrador desde el modelo normalizado.

Importar un fichero **sustituye** todas las rutinas: un JSON es el conjunto
entero. Crear una rutina desde la app, en cambio, **añade** una más
(`conIdLibre` le da un id que no choque, porque el id es la clave de su registro
y su historial). Se puede eliminar una rutina suelta desde su pantalla, o todas
desde la lista.

## Navegación con gestos

No hay router: la navegación es estado (`rutinaId`, `editor`, `ejercicioAbierto`,
`confirmacion`…). Cada capa que se abre se engancha al historial con
`useGestoAtras` ([`src/lib/gestoAtras.js`](src/lib/gestoAtras.js)), de modo que
el gesto de volver atrás del móvil cierra la capa de arriba en vez de salirse de
la app. Detalles que importan:

- Cada capa mete **una** entrada y la retira si se cierra desde la interfaz, para
  que no haya que pulsar atrás dos veces.
- `popstate` llega a todas las capas abiertas, así que cada una comprueba que la
  entrada desaparecida es la suya; si no, un solo gesto cerraría varias.
- `pushState` va **sin URL**: la dirección sigue siendo `/`, que es lo que
  conviene en una PWA instalada y con el service worker sirviendo `index.html`.
- Al abrir una capa nueva hay que llamar al hook; si no, el gesto cerrará la app.

## PWA

App instalable con `vite-plugin-pwa` (modo `generateSW`). El manifiesto se
declara en `vite.config.js` y los iconos PNG viven en `public/icons/`. El
service worker solo existe en el build de producción.

`registerType: 'prompt'`: el service worker nuevo se queda esperando y
`AvisoActualizacion` (con el hook `src/lib/actualizacion.js`) enseña la barra de
«hay una versión nueva». Con `autoUpdate` la app se recargaba sola y no había
forma de avisar. Las pantallas reservan `env(safe-area-inset-top)` además del
inferior, porque instalada en un iPhone con isla dinámica el contenido sube
hasta debajo de la barra de estado.

## Comandos

- `npm run dev` — servidor de desarrollo (puerto 5173).
- `npm run build` — build de producción.
- `npm run preview` — sirve `dist/`; es la única forma de probar el service
  worker y la instalación.
