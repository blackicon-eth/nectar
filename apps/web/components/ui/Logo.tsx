export default function Logo({ height = 26 }: { height?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Nectar"
      height={height}
      style={{ height }}
      className="h-auto w-auto"
    />
  );
}
