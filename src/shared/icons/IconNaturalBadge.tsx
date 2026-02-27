function IconNaturalBadge(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Outer ring */}
      <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      {/* Inner ring */}
      <circle cx="60" cy="60" r="51" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />

      {/* "NATURAL PRODUCTS" curved along top arc */}
      <defs>
        <path id="badge-arc" d="M 10,60 A 50,50 0 0,1 110,60" />
      </defs>
      <text fontFamily="Jost, sans-serif" fontSize="7" fill="currentColor" letterSpacing="2.5" opacity="0.65">
        <textPath href="#badge-arc" startOffset="50%" textAnchor="middle">
          · NATURAL PRODUCTS ·
        </textPath>
      </text>

      {/* Leaf (IconLeaf paths, scaled and centered) */}
      <g transform="translate(39.6, 15) scale(0.85)" opacity="0.65">
        <path
          d="M24 6C24 6 10 14 10 26C10 34 16.3 40 24 40C31.7 40 38 34 38 26C38 14 24 6 24 6Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M24 40V14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
        <path d="M24 22C24 22 18 19 15 24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <path d="M24 30C24 30 30 27 33 32" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* HONESTA brand text */}
      <text
        x="60"
        y="77"
        textAnchor="middle"
        fontFamily="Cormorant Garamond, serif"
        fontSize="11"
        fontWeight="600"
        fill="currentColor"
        opacity="0.8"
        letterSpacing="3"
      >
        HONESTA
      </text>

      {/* Side dots — visual dividers at 9 o'clock and 3 o'clock */}
      <circle cx="10" cy="60" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="110" cy="60" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export { IconNaturalBadge };
