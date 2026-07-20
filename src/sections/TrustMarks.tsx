import Image from "next/image";

/**
 * Compact horizontal strip of quality/trust marks (No Added Sugar, 100% Natural,
 * No Preservatives, Made in UAE) shown directly under the fixed Navbar on public
 * pages. Server component — pure markup + CSS stagger, no client JS.
 *
 * The band owns the navbar clearance (`pt-16 md:pt-20`) so it can be dropped in
 * as the first child of a page's <main>; the cream background fills the space
 * behind the transparent navbar seamlessly.
 */
const MARKS = [
  { src: "/images/marks/mark-2.png", alt: "100% Natural", width: 432, height: 474 },
  { src: "/images/marks/mark-1.png", alt: "No Added Sugar", width: 501, height: 474 },
  { src: "/images/marks/mark-3.png", alt: "No Preservatives", width: 465, height: 454 },
  { src: "/images/marks/mark-4.png", alt: "Made in UAE", width: 432, height: 460 },
];

export function TrustMarks() {
  return (
    <section aria-label="Our quality promise" className="bg-cream pt-16 md:pt-20">
      <div className="noise relative overflow-hidden bg-sand">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4 md:py-6">
          <ul className="flex items-center justify-center gap-4 sm:gap-8 md:gap-12">
            {MARKS.map((m) => (
              <li key={m.alt} className="animate-about-stagger">
                <Image
                  src={m.src}
                  alt={m.alt}
                  width={m.width}
                  height={m.height}
                  className="h-16 w-16 md:h-24 md:w-24 lg:h-28 lg:w-28 object-contain transition-transform duration-300 hover:scale-[1.06]"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
