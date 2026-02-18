function IconNoSugar(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1.5" />
      <rect
        x="18"
        y="18"
        width="12"
        height="12"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M18 18L24 14L30 18"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d="M30 18V30" stroke="currentColor" strokeWidth="1" />
      <path
        d="M12 12L36 36"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export { IconNoSugar };
