import Link from "next/link";
import { IconInstagram, IconBotanical } from "@/shared/icons";

const NAV_LINKS = [
  { href: "#products", label: "Products" },
  { href: "#categories", label: "Categories" },
  { href: "#story", label: "Our Story" },
  { href: "#contact", label: "Contact" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="noise relative bg-earth overflow-hidden">
      {/* Decorative botanical — bottom-right */}
      <div
        className="pointer-events-none absolute -bottom-12 -right-16"
        aria-hidden="true"
      >
        <IconBotanical className="w-72 text-sand/5 rotate-12" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-16 md:py-20">
        {/* ── Main columns ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 md:gap-8 pb-12 border-b border-sand/10">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-5">
            <Link
              href="/"
              className="flex flex-col leading-none select-none w-fit"
            >
              <span className="font-display font-bold text-2xl text-white-warm tracking-widest uppercase">
                HONESTA
              </span>
              <span className="font-body font-light text-[9px] uppercase tracking-[0.22em] text-sand/50 mt-0.5">
                Sweetness Before Marketing
              </span>
            </Link>

            <p className="font-body font-light text-sand/50 text-sm leading-relaxed max-w-[220px]">
              Handcrafted dried fruits and pastila.
              <br />
              100% fruit. No additives. Made with care.
            </p>
          </div>

          {/* Column 2: Navigate */}
          <div>
            <p className="font-body font-semibold uppercase tracking-[0.18em] text-[10px] text-sand/40 mb-5">
              Navigate
            </p>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="font-body font-light text-sand/65 text-sm hover:text-orange-light transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <p className="font-body font-semibold uppercase tracking-[0.18em] text-[10px] text-sand/40 mb-5">
              Contact
            </p>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_INSTAGRAM_BRAND_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-body font-light text-sand/65 text-sm hover:text-orange-light transition-colors duration-200"
                >
                  <IconInstagram className="w-3.5 h-3.5 shrink-0" />@
                  {process.env.NEXT_PUBLIC_INSTAGRAM_BRAND}
                </a>
              </li>
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body font-light text-sand/65 text-sm hover:text-orange-light transition-colors duration-200"
                >
                  DM on Instagram
                </a>
              </li>
              <li>
                {/* TODO: replace with real email address */}
                <a
                  href="mailto:honest@honesta.brand"
                  className="font-body font-light text-sand/65 text-sm hover:text-orange-light transition-colors duration-200"
                >
                  honest@honesta.brand
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-body font-light text-[11px] text-sand/30 tracking-wide">
            © {year} HONESTA. All rights reserved.
          </p>
          <p className="font-body font-light text-[11px] text-sand/30 tracking-wide">
            Made with care.
          </p>
        </div>
      </div>
    </footer>
  );
}
