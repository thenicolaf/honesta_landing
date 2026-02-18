function IconGift(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Box body */}
      <rect
        x="9"
        y="22"
        width="30"
        height="20"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Lid */}
      <rect
        x="7"
        y="16"
        width="34"
        height="6"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Center ribbon vertical */}
      <path d="M24 16V42" stroke="currentColor" strokeWidth="1.2" />
      {/* Bow left loop */}
      <path
        d="M24 16C24 16 18 14 16 10C14 6 18 4 21 7C23 9 24 16 24 16Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Bow right loop */}
      <path
        d="M24 16C24 16 30 14 32 10C34 6 30 4 27 7C25 9 24 16 24 16Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export { IconGift };
