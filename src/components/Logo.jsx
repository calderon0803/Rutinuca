/**
 * Marca de la app: el nombre apoyado sobre una barra con discos. El texto usa
 * la tipografia de la pagina (font-family: inherit) para que case con el resto.
 */
export default function Logo({ className }) {
  return (
    <svg
      className={`logo${className ? ` ${className}` : ''}`}
      viewBox="0 0 320 86"
      role="img"
      aria-label="Rutinuca"
    >
      <text className="logo__texto" x="160" y="44" textAnchor="middle">
        Rutinuca
      </text>

      {/* La barra sobresale por los dos lados de la palabra */}
      <rect className="logo__barra" x="40" y="60" width="240" height="6" rx="3" />

      {/* Discos: los grandes pegados a la barra, los pequenos por fuera */}
      <rect className="logo__disco" x="52" y="48" width="11" height="30" rx="3" />
      <rect className="logo__disco" x="257" y="48" width="11" height="30" rx="3" />
      <rect className="logo__disco" x="40" y="53" width="8" height="20" rx="2.5" />
      <rect className="logo__disco" x="272" y="53" width="8" height="20" rx="2.5" />
    </svg>
  )
}
