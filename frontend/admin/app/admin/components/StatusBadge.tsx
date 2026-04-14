type Props = {
    value: string
  }
  
  const colors: Record<string, string> = {
    PENDIENTE: '#999',
    OFERTADO: '#0070f3',
    ASIGNADO: '#0a8f08',
    FINALIZADO: '#555',
    CANCELADO: '#c00',
    ACEPTADA: '#0a8f08',
    RECHAZADA: '#c00',
  }
  
  export default function StatusBadge({ value }: Props) {
    return (
      <span
        style={{
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 12,
          background: colors[value] ?? '#ccc',
          color: '#fff',
          fontWeight: 600,
        }}
      >
        {value}
      </span>
    )
  }
  