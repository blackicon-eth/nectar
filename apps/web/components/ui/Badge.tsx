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
  const cls = [
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 font-mono text-[13px] font-semibold",
    tier === "public" && "bg-sage-soft text-[#3f5a26]",
    tier === "premium" && "bg-[#ffe6c2] text-[#8a5a00]",
    tier === "act" && "bg-amber-soft text-amber",
    tier === "status" && (status === "published" ? "bg-sage-soft text-[#3f5a26]" : "bg-paper-raised text-muted"),
  ].filter(Boolean).join(" ");
  return (
    <span className={cls}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}
