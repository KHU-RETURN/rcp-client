import type { StatusTone } from '../../types';

interface InlineBadgeProps {
  tone: StatusTone;
  label: string;
}

export function InlineBadge({ tone, label }: InlineBadgeProps) {
  return <span className={`inline-badge ${tone}`}>{label}</span>;
}
