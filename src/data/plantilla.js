// Plantilla de ejemplo que se descarga desde la pantalla de inicio.
// El objetivo de cada serie es un rango: "8-10", "6-8"...
// Si quieres series de aproximacion, anadelas como una serie mas del ejercicio.

import { descargarJson } from '../lib/descargas'

export const PLANTILLA = {
  rutinas: [
    {
      rutina: 'Día 1 - Empuje',
      ejercicios: [
        {
          ejercicio: 'Press banca',
          grupo: 'Pecho',
          indicaciones:
            'Escápulas retraídas, barra a la línea del pecho, muñecas alineadas. La primera serie es la pesada; en las siguientes baja carga.',
          series: ['6-8', '8-10', '8-10', '10-12'],
          topset: true,
          superserie: false,
        },
        {
          ejercicio: 'Press militar',
          grupo: 'Hombro',
          indicaciones: 'Agarre a la anchura de hombros, no arquear excesivamente la espalda baja.',
          series: ['10-12', '10-12', '10-12'],
          topset: false,
          superserie: true,
          superserie_ejercicio: {
            ejercicio: 'Elevaciones laterales',
            grupo: 'Hombro',
            indicaciones:
              'Subir hasta la altura del hombro, sin impulso, contracción de 1 segundo arriba.',
            series: ['12-15', '12-15', '12-15'],
          },
        },
        {
          ejercicio: 'Fondos en paralelas',
          grupo: 'Pecho',
          indicaciones: 'Torso ligeramente inclinado, bajar hasta que el codo forme 90 grados.',
          series: ['10-12', '10-12', '10-12'],
          topset: false,
          superserie: false,
        },
      ],
    },
    {
      rutina: 'Día 2 - Tirón',
      ejercicios: [
        {
          ejercicio: 'Dominadas',
          grupo: 'Dorsal',
          indicaciones:
            'Agarre prono, sin balanceo, barbilla por encima de la barra. La primera serie es la pesada (con lastre si hace falta); en las siguientes quita peso.',
          series: ['5-6', '6-8', '6-8', '8-10'],
          topset: true,
          superserie: false,
        },
        {
          ejercicio: 'Remo con barra',
          grupo: 'Dorsal',
          indicaciones: 'Espalda neutra, tirar hacia el ombligo, pausa de 1 segundo arriba.',
          series: ['8-10', '8-10', '8-10'],
          topset: false,
          superserie: true,
          superserie_ejercicio: {
            ejercicio: 'Curl martillo',
            grupo: 'Bíceps',
            indicaciones: 'Codos pegados al cuerpo, bajada controlada en 2 segundos.',
            series: ['10-12', '10-12', '10-12'],
          },
        },
      ],
    },
  ],
}

/** Dispara la descarga de la plantilla como fichero .json. */
export function descargarPlantilla() {
  descargarJson('plantilla-rutina.json', PLANTILLA)
}
