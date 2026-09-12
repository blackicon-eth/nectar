export default function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex items-center justify-center gap-3 text-muted">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-honey" />
      <span className="font-mono text-[12px] uppercase tracking-[0.1em]">{label}</span>
    </div>
  );
}
