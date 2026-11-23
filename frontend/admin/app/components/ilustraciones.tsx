// Ilustraciones SVG propias de la landing. Sin imágenes externas.

type Props = { className?: string }

export function LogoCasa({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#2563eb" />
      <path d="M8 15.5 16 9l8 6.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 14v8.5h11V14" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="14.2" y="17" width="3.6" height="5.5" rx="1" fill="#93c5fd" />
    </svg>
  )
}

export function IlustracionHero({ className }: Props) {
  return (
    <svg
      viewBox="0 0 520 440"
      className={className}
      role="img"
      aria-label="Una casa conectada con un celular donde un profesional envía una oferta por chat"
    >
      <defs>
        <linearGradient id="hero-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dbeafe" />
          <stop offset="1" stopColor="#bfdbfe" />
        </linearGradient>
        <linearGradient id="hero-techo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      {/* fondo */}
      <circle cx="250" cy="225" r="190" fill="url(#hero-bg)" />
      <circle cx="430" cy="90" r="34" fill="#fde68a" opacity="0.9" />
      <ellipse cx="240" cy="392" rx="190" ry="16" fill="#1e3a8a" opacity="0.08" />

      {/* casa */}
      <rect x="90" y="200" width="210" height="185" rx="6" fill="#ffffff" />
      <path d="M70 212 195 110l125 102" fill="none" stroke="url(#hero-techo)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="250" y="120" width="26" height="54" rx="3" fill="#1e40af" />
      <rect x="168" y="290" width="54" height="95" rx="5" fill="#93c5fd" />
      <circle cx="210" cy="340" r="4" fill="#1e3a8a" />
      <rect x="112" y="232" width="48" height="44" rx="5" fill="#bfdbfe" />
      <path d="M136 232v44M112 254h48" stroke="#fff" strokeWidth="4" />
      <rect x="232" y="232" width="48" height="44" rx="5" fill="#bfdbfe" />
      <path d="M256 232v44M232 254h48" stroke="#fff" strokeWidth="4" />

      {/* caja de herramientas */}
      <rect x="40" y="340" width="76" height="45" rx="7" fill="#f59e0b" />
      <path d="M62 340v-10a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v10" fill="none" stroke="#b45309" strokeWidth="5" />
      <rect x="40" y="356" width="76" height="6" fill="#b45309" opacity="0.5" />

      {/* celular */}
      <g transform="translate(300 150) rotate(6)">
        <rect x="0" y="0" width="150" height="250" rx="22" fill="#0f172a" />
        <rect x="8" y="10" width="134" height="230" rx="16" fill="#f8fafc" />
        <rect x="55" y="16" width="40" height="5" rx="2.5" fill="#cbd5e1" />
        {/* encabezado chat */}
        <circle cx="30" cy="42" r="10" fill="#93c5fd" />
        <rect x="46" y="36" width="56" height="6" rx="3" fill="#334155" />
        <rect x="46" y="46" width="36" height="5" rx="2.5" fill="#94a3b8" />
        {/* mensajes */}
        <rect x="18" y="66" width="86" height="26" rx="10" fill="#e2e8f0" />
        <rect x="46" y="100" width="86" height="26" rx="10" fill="#2563eb" />
        {/* tarjeta de oferta */}
        <rect x="18" y="138" width="114" height="66" rx="12" fill="#ffffff" stroke="#bfdbfe" strokeWidth="2" />
        <rect x="28" y="150" width="50" height="6" rx="3" fill="#64748b" />
        <rect x="28" y="162" width="70" height="10" rx="4" fill="#0f172a" />
        <rect x="28" y="182" width="94" height="14" rx="7" fill="#22c55e" />
        <path d="m68 189 4 4 8-8" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="18" y="214" width="114" height="16" rx="8" fill="#e2e8f0" />
      </g>

      {/* burbuja flotante */}
      <g transform="translate(410 300)">
        <path d="M14 0h58a14 14 0 0 1 14 14v26a14 14 0 0 1-14 14H32L12 68l6-14h-4A14 14 0 0 1 0 40V14A14 14 0 0 1 14 0Z" fill="#ffffff" stroke="#bfdbfe" strokeWidth="2" />
        <path d="m22 27 8 8 16-16" fill="none" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="52" y="20" width="22" height="5" rx="2.5" fill="#94a3b8" />
        <rect x="52" y="30" width="16" height="5" rx="2.5" fill="#cbd5e1" />
      </g>
    </svg>
  )
}

export function IlustracionMantenimiento({ className }: Props) {
  return (
    <svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="Llave y destornillador frente a una canilla">
      <rect width="240" height="150" fill="#eff6ff" />
      <circle cx="120" cy="80" r="56" fill="#dbeafe" />
      {/* canilla */}
      <rect x="60" y="54" width="18" height="40" rx="4" fill="#64748b" />
      <path d="M78 66h34a14 14 0 0 1 14 14v8" fill="none" stroke="#64748b" strokeWidth="14" strokeLinejoin="round" />
      <path d="M126 102c-5 8-5 12 0 14 5-2 5-6 0-14Z" fill="#38bdf8" />
      <rect x="84" y="46" width="26" height="8" rx="4" fill="#94a3b8" />
      {/* llave */}
      <g transform="translate(22 -8) rotate(-35 170 70)">
        <rect x="150" y="62" width="62" height="12" rx="6" fill="#2563eb" />
        <path d="M150 68a16 16 0 1 1-6-14l-8 8 6 10 10-2a16 16 0 0 1-2-2Z" fill="#2563eb" />
      </g>
      {/* destornillador */}
      <g transform="rotate(30 180 110)">
        <rect x="150" y="104" width="34" height="14" rx="6" fill="#f59e0b" />
        <rect x="184" y="108" width="30" height="6" rx="2" fill="#94a3b8" />
      </g>
    </svg>
  )
}

export function IlustracionProfesionales({ className }: Props) {
  return (
    <svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="Perfil de profesional verificado con calificación">
      <rect width="240" height="150" fill="#eff6ff" />
      <circle cx="120" cy="80" r="56" fill="#dbeafe" />
      <rect x="62" y="30" width="116" height="96" rx="14" fill="#ffffff" />
      <circle cx="96" cy="64" r="16" fill="#93c5fd" />
      <path d="M78 96a18 14 0 0 1 36 0" fill="#93c5fd" />
      <rect x="122" y="52" width="44" height="7" rx="3.5" fill="#334155" />
      <rect x="122" y="64" width="32" height="6" rx="3" fill="#94a3b8" />
      {/* estrellas */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          transform={`translate(${78 + i * 18} 106)`}
          d="M6 0l1.8 3.9 4.2.5-3.1 2.9.8 4.2L6 9.4 2.3 11.5l.8-4.2L0 4.4l4.2-.5Z"
          fill={i < 4 ? '#f59e0b' : '#e2e8f0'}
        />
      ))}
      {/* sello verificado */}
      <circle cx="172" cy="36" r="16" fill="#16a34a" />
      <path d="m164 36 6 6 10-11" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IlustracionControl({ className }: Props) {
  return (
    <svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="Panel de control con gráfico de barras y estados">
      <rect width="240" height="150" fill="#eff6ff" />
      <circle cx="120" cy="80" r="56" fill="#dbeafe" />
      <rect x="50" y="30" width="140" height="96" rx="12" fill="#ffffff" />
      <rect x="50" y="30" width="140" height="18" rx="12" fill="#1e293b" />
      <rect x="50" y="40" width="140" height="8" fill="#1e293b" />
      <circle cx="62" cy="39" r="3" fill="#f87171" />
      <circle cx="72" cy="39" r="3" fill="#fbbf24" />
      <circle cx="82" cy="39" r="3" fill="#4ade80" />
      {[30, 46, 24, 58, 40].map((h, i) => (
        <rect key={i} x={64 + i * 16} y={112 - h} width="10" height={h} rx="3" fill={i === 3 ? '#2563eb' : '#93c5fd'} />
      ))}
      <rect x="148" y="60" width="30" height="8" rx="4" fill="#22c55e" />
      <rect x="148" y="74" width="30" height="8" rx="4" fill="#f59e0b" />
      <rect x="148" y="88" width="30" height="8" rx="4" fill="#ef4444" />
    </svg>
  )
}
