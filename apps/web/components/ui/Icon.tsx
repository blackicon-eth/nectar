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
      className={`ms ${fill ? "fill" : ""} ${className}`}
      style={{ fontSize: size }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
