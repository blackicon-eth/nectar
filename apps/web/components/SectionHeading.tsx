export default function SectionHeading({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-headline-md">{title}</h2>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      </div>
      {action}
    </div>
  );
}
