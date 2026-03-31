interface EmptyBlockProps {
  title: string;
  description?: string;
}

export function EmptyBlock({ title, description }: EmptyBlockProps) {
  return (
    <div className="empty-block">
      <strong>{title}</strong>
      {description && <p>{description}</p>}
    </div>
  );
}
