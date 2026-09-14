# Rutinuca

App de rutinas de gimnasio. Importas un JSON con tus rutinas y vas anotando
repeticiones y pesos serie a serie. Todo se guarda en el navegador
(`localStorage`), sin servidor ni cuenta de usuario.

## Puesta en marcha

```bash
npm install
```

```bash
npm run dev
```

`npm run build` genera la versión de producción en `dist/` y `npm run preview`
la sirve para comprobarla.

## PWA

Es una app instalable: al abrirla desde el navegador aparece la opción de
instalar, y una vez instalada arranca a pantalla completa y **funciona sin
conexión** — todo el front (17 ficheros, 256 KiB) se precarga en la caché del
service worker, y los datos ya viven en `localStorage`.

- Manifiesto e iconos: `vite-plugin-pwa` genera `manifest.webmanifest` a partir
  de la configuración de `vite.config.js`; los iconos están en `public/icons/`.
- El service worker se actualiza solo (`registerType: 'autoUpdate'`): al
  publicar una versión nueva, se instala en segundo plano y entra al recargar.
- El service worker **solo funciona en el build de producción** (`npm run build`
  + `npm run preview`), no en `npm run dev`.

## Cómo se usa

1. **Descargar plantilla** baja un `plantilla-rutina.json` de ejemplo.
2. Editas ese fichero con tus ejercicios.
3. **Importar rutina** lo carga: aparece un botón por rutina y, dentro, la lista
   de ejercicios.
4. Al tocar un ejercicio se abre su modal con las indicaciones y una fila por
   serie para apuntar repeticiones y peso. Se guarda solo según escribes.
5. Al acabar, **Finalizar entrenamiento** guarda la sesión con su fecha y deja
   la rutina a cero. La próxima vez, cada serie muestra debajo lo que hiciste la
   última vez (`Anterior: 10 reps · 42,5 kg`).

Solo hay una importación activa a la vez. Para cargar otro JSON, pulsa
**Eliminar rutina** en la pantalla de rutinas y vuelve a importar: eso
borra también el registro de series.

## Formato del JSON

El fichero admite tres formas: `{ "rutinas": [ ... ] }`, un array de rutinas, o
una rutina suelta.

```json
{
  "rutinas": [
    {
      "rutina": "Día 1 - Empuje",
      "ejercicios": [
        {
          "ejercicio": "Press militar",
          "indicaciones": "Agarre a la anchura de hombros, no arquear excesivamente la espalda baja.",
          "series": 3,
          "repeticiones_por_serie": ["10-12", "10-12", "8-10"],
          "topset": false,
          "superserie": true,
          "superserie_ejercicio": {
            "ejercicio": "Elevaciones laterales",
            "indicaciones": "Subir hasta la altura del hombro, sin impulso.",
            "series": 3,
            "repeticiones_por_serie": ["12-15", "12-15", "12-15"]
          }
        }
      ]
    }
  ]
}
```

| Campo | Obligatorio | Notas |
| --- | --- | --- |
| `rutina` | sí | Nombre de la rutina, es el texto del botón. |
| `ejercicios` | sí | Array con al menos un ejercicio. |
| `ejercicio` | sí | Nombre del ejercicio. |
| `indicaciones` | no | Texto libre que se muestra en el modal. |
| `series` | no | Si falta, se deduce de `repeticiones_por_serie` (o 1). |
| `repeticiones_por_serie` | no | Objetivo por serie, como rango: `"8-10"`. También valen `[8, 10]` y un número suelto (`10`, rango cerrado). Se recorta o rellena hasta cuadrar con `series`. |
| `topset` | no | Distintivo en la lista y marca la **primera serie** del ejercicio como top set. |
| `superserie_ejercicio` | no | Mismo formato (sin anidar otra superserie). Su presencia activa la superserie. |

No hay campo de calentamiento: si quieres series de aproximación, añádelas como
una serie más del ejercicio con sus repeticiones.

Si el fichero no cuadra, la importación se cancela y se explica el motivo debajo
del botón.

## Estructura

```
src/
  components/   Vistas y modal
  lib/          Validación del JSON (rutinas.js) y localStorage (storage.js)
  data/         Plantilla de ejemplo
  styles/       Tokens SCSS y parciales
```

Los datos guardados viven en tres claves: `rutinuca:rutinas` (las rutinas
importadas), `rutinuca:registros` (el entrenamiento en curso) y
`rutinuca:historial` (las sesiones cerradas, hasta 20 por rutina). Las
rutinas llevan un número de versión: si el modelo de datos cambia, lo guardado
se descarta solo al arrancar y hay que volver a importar.
