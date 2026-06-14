import type { ComponentType, SVGProps } from "react";
import { ShoppingBag, Package, Sparkles, Info, Handshake } from "lucide-react";

export enum SectionId {
  Hero = "hero",
  Mix = "mix",
  Promo = "promo",
  Categories = "categories",
  Products = "products",
  Story = "story",
}

export const SECTION_IDS = Object.values(SectionId);

interface NavLink<T extends Record<string, unknown> = Record<string, never>> {
  href: `/#${SectionId}` | `/${string}`;
  label: string;
  props?: T;
}

type NavIconLink = NavLink<{ Icon: ComponentType<SVGProps<SVGSVGElement>> }> & {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const NAV_LINKS: NavLink[] = [
  { href: `/#${SectionId.Products}`, label: "Shop" },
  { href: `/#${SectionId.Mix}`, label: "Mix" },
  { href: `/#${SectionId.Promo}`, label: "Offers" },
  { href: "/about", label: "About" },
  { href: "/partnership", label: "Partnership" },
];

export const TAB_LINKS: NavIconLink[] = [
  { href: `/#${SectionId.Products}`, label: "Shop", Icon: ShoppingBag },
  { href: `/#${SectionId.Mix}`, label: "Mix", Icon: Package },
  { href: `/#${SectionId.Promo}`, label: "Offers", Icon: Sparkles },
  { href: "/about", label: "About", Icon: Info },
  { href: "/partnership", label: "Partnership", Icon: Handshake },
];
