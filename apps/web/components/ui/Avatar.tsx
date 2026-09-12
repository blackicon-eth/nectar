export default function Avatar({
  src,
  alt,
  size = 32,
  name,
}: {
  src?: string;
  alt?: string;
  size?: number;
  name?: string;
}) {
  const label = alt ?? name ?? "avatar";
  const initials =
    name
      ?.split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "";

  if (!src) {
    return (
      <span
        className="avatar avatar-initials"
        style={{ width: size, height: size, fontSize: size * 0.38 }}
        aria-label={label}
      >
        {initials || "N"}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="avatar"
      src={src}
      alt={label}
      width={size}
      height={size}
      style={{ width: size, height: size }}
    />
  );
}
