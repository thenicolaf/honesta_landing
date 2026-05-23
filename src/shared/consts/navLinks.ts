import type { ComponentType, SVGProps } from "react";
import { ShoppingBag, Package, Sparkles } from "lucide-react";

export enum SectionId {
  Hero = "hero",
  About = "about",
  Mix = "mix",
  Promo = "promo",
  Categories = "categories",
  Products = "products",
  Story = "story",
  Contact = "contact",
}

export const SECTION_IDS = Object.values(SectionId);

interface NavLink<T extends Record<string, unknown> = Record<string, never>> {
  href: `/#${SectionId}`;
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
];

export const TAB_LINKS: NavIconLink[] = [
  { href: `/#${SectionId.Products}`, label: "Shop", Icon: ShoppingBag },
  { href: `/#${SectionId.Mix}`, label: "Mix", Icon: Package },
  { href: `/#${SectionId.Promo}`, label: "Offers", Icon: Sparkles },
];

export const FOOTER_NAV_LINKS: NavLink[] = [
  { href: `/#${SectionId.Products}`, label: "Shop" },
  { href: `/#${SectionId.Mix}`, label: "Mix" },
  { href: `/#${SectionId.Promo}`, label: "Offers" },
  { href: `/#${SectionId.Categories}`, label: "Categories" },
  { href: `/#${SectionId.About}`, label: "About" },
  { href: `/#${SectionId.Story}`, label: "Story" },
];
