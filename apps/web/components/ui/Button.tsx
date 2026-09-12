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
    "btn",
    `btn-${variant}`,
    size === "sm" ? "btn-sm" : "",
    block ? "btn-block" : "",
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
