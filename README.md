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
          "series": ["10-12", "10-12", "8-10"],
          "topset": false,
          "superserie": true,
          "superserie_ejercicio": {
            "ejercicio": "Elevaciones laterales",
            "indicaciones": "Subir hasta la altura del hombro, sin impulso.",
            "series": ["12-15", "12-15", "12-15"]
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
| `series` | no | Un objetivo por serie: `["8-10", "8-10", "6-8"]` son tres series. El objetivo se escribe como rango (`"8-10"`, también `"8 a 10"` o `[8, 10]`) o como número suelto (`10`). Si no quieres fijar objetivos, pon solo cuántas son: `"series": 4`. Por defecto, 1. |
| `topset` | no | Distintivo en la lista y marca la **primera serie** del ejercicio como top set. |
| `superserie_ejercicio` | no | Mismo formato (sin anidar otra superserie). Su presencia activa la superserie. |

No hay campo de calentamiento: si quieres series de aproximación, añádelas como
una serie más del ejercicio con sus repeticiones.

### Las etiquetas

Cada ejercicio se muestra en la lista con un distintivo, según lo que digan sus
campos. En la app se explican pulsando **¿Qué significan las etiquetas?**

| Etiqueta | Cuándo sale | Qué significa |
| --- | --- | --- |
| `NORMAL` | ni `topset` ni superserie | Series sueltas, con su descanso entre una y otra. |
| `TOP SET` | `"topset": true` | La serie más pesada del ejercicio. Va la primera y marca el peso de referencia; las siguientes suelen bajar carga. |
| `SUPERSERIE` | hay `superserie_ejercicio` | El ejercicio va encadenado con otro: una serie de cada uno seguidas, sin descanso. |

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
