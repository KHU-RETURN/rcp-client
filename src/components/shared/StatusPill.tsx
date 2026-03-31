interface StatusPillProps {
  tone: string;
  label: string;
}

export function StatusPill({ tone, label }: StatusPillProps) {
  return <span className={`status-pill ${tone}`}>{label}</span>;
}
