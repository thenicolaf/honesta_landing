function IconHands(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M14 28C14 28 10 26 10 22C10 19 12 18 14 19L20 22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M34 28C34 28 38 26 38 22C38 19 36 18 34 19L28 22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 28H34C34 34 30 38 24 38C18 38 14 34 14 28Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="18" r="4" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M24 14C24 14 25 11 28 10"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export { IconHands };
