export default function Logo({
  height = 26,
  showWordmark = true,
}: {
  height?: number;
  showWordmark?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 160 44"
      height={height}
      fill="none"
      aria-label="Nectar"
      role="img"
    >
      <g transform="translate(4, 6)">
        <path
          d="M16 3L28 10V24L16 31L4 24V10L16 3Z"
          fill="#FFFDF6"
          stroke="#E8A33D"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M16 9C16 9 10 17 10 20.5C10 23.5 12.7 26 16 26C19.3 26 22 23.5 22 20.5C22 17 16 9 16 9Z"
          fill="url(#nectar-amber-grad)"
        />
        <circle cx="16" cy="18" r="1.5" fill="#FAF5EC" opacity="0.8" />
      </g>
      {showWordmark && (
        <text
          x="44"
          y="29"
          fontFamily="'Newsreader', Georgia, serif"
          fontSize="26"
          fontWeight="700"
          letterSpacing="-0.5"
          fill="#3B2B1F"
        >
          Nectar<tspan fill="#E8A33D">.</tspan>
        </text>
      )}
      <defs>
        <linearGradient
          id="nectar-amber-grad"
          x1="16"
          y1="9"
          x2="16"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#E8A33D" />
          <stop offset="100%" stopColor="#B8742A" />
        </linearGradient>
      </defs>
    </svg>
  );
}
