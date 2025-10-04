type Status = 'Aceptado' | 'En Atención' | 'Finalizado' | 'Cancelado';

const statusStyles: Record<Status, string> = {
  'Aceptado': 'bg-blue-100 text-blue-700 ring-blue-200',
  'En Atención': 'bg-yellow-100 text-yellow-700 ring-yellow-200',
  'Finalizado': 'bg-green-100 text-green-700 ring-green-200',
  'Cancelado': 'bg-red-100 text-red-700 ring-red-200',
};

const statusDotStyles: Record<Status, string> = {
    'Aceptado': 'bg-blue-500',
    'En Atención': 'bg-yellow-500',
    'Finalizado': 'bg-green-500',
    'Cancelado': 'bg-red-500',
};

export function TicketStatusBadge({ status }: { status: Status }) {
  // Manejar casos donde el estado pueda no ser uno de los esperados
  if (!statusStyles[status]) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status]}`}
    >
      <span className={`h-2 w-2 rounded-full ${statusDotStyles[status]}`}></span>
      {status}
    </span>
  );
}
