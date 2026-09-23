/** Distintivos de la tarjeta del ejercicio. Siempre hay al menos uno. */
export default function Etiquetas({ ejercicio, separada }) {
  const etiquetas = []
  if (ejercicio.topset) etiquetas.push(['topset', 'Top set'])
  if (ejercicio.superserie) {
    etiquetas.push(separada ? ['separada', 'Hoy separada'] : ['superserie', 'Superserie'])
  }
  if (etiquetas.length === 0) etiquetas.push(['normal', 'Normal'])

  return (
    <span className="etiquetas">
      {etiquetas.map(([tipo, texto]) => (
        <span key={tipo} className={`etiqueta etiqueta--${tipo}`}>
          {texto}
        </span>
      ))}
    </span>
  )
}
