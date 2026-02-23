function IconBurjKhalifa(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Main silhouette */}
      <path
        d="M24 3 L25 13 L27 13 L27 22 L30 22 L30 31 L33 31 L33 39 L35 39 L35 45 L13 45 L13 39 L15 39 L15 31 L18 31 L18 22 L21 22 L21 13 L23 13 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Center column */}
      <line
        x1="24"
        y1="13"
        x2="24"
        y2="45"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      {/* Tier accent lines */}
      <line x1="21" y1="22" x2="27" y2="22" stroke="currentColor" strokeWidth="0.7" />
      <line x1="18" y1="31" x2="30" y2="31" stroke="currentColor" strokeWidth="0.7" />
      <line x1="15" y1="39" x2="33" y2="39" stroke="currentColor" strokeWidth="0.7" />
    </svg>
  );
}

export { IconBurjKhalifa };
