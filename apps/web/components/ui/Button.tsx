import Icon from "./Icon";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "dark" | "ghost" | "outline" | "gilded";
  size?: "sm" | "md";
  block?: boolean;
  icon?: string;
  href?: string;
  type?: "button" | "submit";
  form?: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  block = false,
  icon,
  href,
  type = "button",
  form,
  disabled,
  onClick,
  className = "",
}: ButtonProps) {
  const classes = [
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold tracking-wide transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55",
    variant === "primary" && "bg-honey text-ink shadow-card hover:bg-honey-deep",
    variant === "dark" && "bg-wood text-cream hover:bg-[#1f1610]",
    variant === "ghost" && "bg-transparent text-ink hover:bg-paper-raised",
    variant === "outline" && "border border-line bg-paper-card text-ink hover:bg-paper-raised",
    variant === "gilded" && "border border-amber text-amber [background:linear-gradient(135deg,#faf5ec_0%,#f3ecdd_100%)] hover:border-honey-deep hover:text-honey-deep",
    size === "sm" && "px-3.5 py-1.5 text-[13px]",
    block && "w-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </>
  );

  if (href) {
    return (
      <a className={classes} href={href}>
        {content}
      </a>
    );
  }

  return (
    <button
      className={classes}
      type={type}
      form={form}
      disabled={disabled}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
