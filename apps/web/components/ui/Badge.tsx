import Icon from "./Icon";

export type BadgeTier = "public" | "premium" | "act" | "status";

export default function Badge({
  tier,
  children,
  status,
  icon,
}: {
  tier?: BadgeTier;
  children: React.ReactNode;
  status?: string;
  icon?: string;
}) {
  const cls =
    tier === "public"
      ? "badge public"
      : tier === "premium"
        ? "badge premium"
        : tier === "act"
          ? "badge act"
          : `badge status${status ? ` ${status}` : ""}`;
  return (
    <span className={cls}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}
