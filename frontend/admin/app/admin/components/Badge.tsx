interface BadgeProps {
    label: string
    color?: 'gray' | 'green' | 'yellow' | 'red' | 'blue'
  }
  
  const colorMap = {
    gray: 'bg-gray-200 text-gray-800',
    green: 'bg-green-200 text-green-800',
    yellow: 'bg-yellow-200 text-yellow-800',
    red: 'bg-red-200 text-red-800',
    blue: 'bg-blue-200 text-blue-800',
  }
  
  export default function Badge({
    label,
    color = 'gray',
  }: BadgeProps) {
    return (
      <span
        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${colorMap[color]}`}
      >
        {label}
      </span>
    )
  }
  