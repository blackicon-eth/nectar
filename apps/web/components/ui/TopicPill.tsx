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
      className={`pill${active ? " active" : ""}`}
      onClick={onClick}
    >
      {icon && <Icon name={icon} size={16} />}
      {label}
    </button>
  );
}
