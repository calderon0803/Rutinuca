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

## Estructura

- `src/lib/rutinas.js` — normaliza y valida el JSON importado; es el único sitio
  que decide qué formatos de fichero se aceptan.
- `src/lib/storage.js` — lectura/escritura de `rutinuca:rutinas`,
  `rutinuca:registros` y `rutinuca:historial`, más los helpers de progreso y de
  cierre de sesión.
- `src/lib/fechas.js` — formato de fechas y resumen de una serie anotada.
- `src/components/` — `Inicio`, `ListaRutinas`, `DetalleRutina`, `EjercicioModal`.
- `src/data/plantilla.js` — plantilla de ejemplo que se descarga desde el inicio.

Solo hay una importación activa: `importar()` sustituye las rutinas y la pantalla
de lista solo ofrece eliminarlas, no añadir más.

## PWA

App instalable con `vite-plugin-pwa` (modo `generateSW`). El manifiesto se
declara en `vite.config.js` y los iconos PNG viven en `public/icons/`. El
service worker solo existe en el build de producción.

## Comandos

- `npm run dev` — servidor de desarrollo (puerto 5173).
- `npm run build` — build de producción.
- `npm run preview` — sirve `dist/`; es la única forma de probar el service
  worker y la instalación.
