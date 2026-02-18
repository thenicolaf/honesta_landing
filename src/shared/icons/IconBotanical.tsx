function IconBotanical(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 200 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Central stem */}
      <path
        d="M100 280V20"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Branch pair 1 */}
      <path d="M100 80C100 80 70 60 55 40" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M100 80C100 80 130 60 145 40" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      {/* Branch pair 2 */}
      <path d="M100 130C100 130 65 110 45 95" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M100 130C100 130 135 110 155 95" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      {/* Branch pair 3 */}
      <path d="M100 180C100 180 72 165 58 150" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M100 180C100 180 128 165 142 150" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      {/* Leaves */}
      <ellipse cx="55" cy="38" rx="14" ry="20" transform="rotate(-30 55 38)" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="145" cy="38" rx="14" ry="20" transform="rotate(30 145 38)" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="45" cy="93" rx="16" ry="22" transform="rotate(-20 45 93)" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="155" cy="93" rx="16" ry="22" transform="rotate(20 155 93)" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="58" cy="148" rx="13" ry="18" transform="rotate(-15 58 148)" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="142" cy="148" rx="13" ry="18" transform="rotate(15 142 148)" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export { IconBotanical };
