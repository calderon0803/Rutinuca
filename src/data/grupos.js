// Grupos musculares que ofrece el formulario, ordenados por zona del cuerpo.
// La zona solo agrupa: lo que se elige y se guarda es siempre un grupo concreto.

export const ZONAS = [
  { zona: 'Pecho', grupos: ['Pecho'] },
  { zona: 'Espalda', grupos: ['Dorsal', 'Trapecio', 'Lumbar'] },
  { zona: 'Hombro', grupos: ['Hombro'] },
  { zona: 'Brazo', grupos: ['Bíceps', 'Tríceps', 'Antebrazo'] },
  {
    zona: 'Pierna',
    grupos: ['Cuádriceps', 'Femoral', 'Glúteo', 'Aductor', 'Abductor', 'Gemelo'],
  },
  { zona: 'Core', grupos: ['Abdomen', 'Oblicuos'] },
  { zona: 'Cardio', grupos: ['Cardio'] },
]

/** Todos los grupos en plano, que es lo que valida la importacion. */
export const GRUPOS_MUSCULARES = ZONAS.flatMap(({ grupos }) => grupos)

/** Zona a la que pertenece un grupo, o '' si no es de la lista. */
export function zonaDe(grupo) {
  return ZONAS.find(({ grupos }) => grupos.includes(grupo))?.zona ?? ''
}
