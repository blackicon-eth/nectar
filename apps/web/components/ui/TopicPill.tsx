import Icon from "./Icon";

export default function TopicPill({
  label,
  active = false,
  icon,
  onClick,
}: {
  label: string;
  active?: boolean;
  icon?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-[14px] font-medium transition ${active ? "bg-wood text-cream" : "bg-paper-raised text-muted hover:bg-[#ece3d0] hover:text-ink"}`}
      onClick={onClick}
    >
      {icon && <Icon name={icon} size={16} />}
      {label}
    </button>
  );
}
