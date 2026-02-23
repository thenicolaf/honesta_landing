function IconFruitLeather(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Hanging sheet */}
      <path
        d="M10 17 L10 38 Q10 40 12 40 L36 40 Q38 40 38 38 L38 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Top roll — outer ellipse */}
      <ellipse
        cx="24"
        cy="17"
        rx="14"
        ry="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Top roll — inner shadow curve */}
      <path
        d="M11 17 Q24 21.5 37 17"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export { IconFruitLeather };
