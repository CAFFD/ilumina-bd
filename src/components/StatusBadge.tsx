import { STATUS_LABELS, STATUS_COLORS, type OccurrenceStatus } from "@/lib/mock-data";

export function StatusBadge({ status }: { status: OccurrenceStatus }) {
  return (
    <span className={`status-badge ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    BAIXA: 'bg-muted text-muted-foreground',
    MEDIA: 'bg-info/15 text-info',
    ALTA: 'bg-warning/15 text-warning',
    URGENTE: 'bg-destructive/15 text-destructive',
  };
  const labels: Record<string, string> = {
    BAIXA: 'Baixa', MEDIA: 'Média', ALTA: 'Alta', URGENTE: 'Urgente',
  };
  return (
    <span className={`status-badge ${colors[priority] || ''}`}>
      {labels[priority] || priority}
    </span>
  );
}
