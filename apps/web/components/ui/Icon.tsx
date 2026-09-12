export default function Icon({
  name,
  size = 20,
  fill = false,
  className = "",
}: {
  name: string;
  size?: number;
  fill?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-block whitespace-nowrap font-["Material_Symbols_Outlined"] leading-none ${className}`}
      style={{ fontSize: size, fontVariationSettings: `"FILL" ${fill ? 1 : 0}` }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
