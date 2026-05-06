import type { ComponentType, SVGProps } from "react";
import { ShoppingBag, Grid3X3, BookOpen, MessageCircle, Info, Package, Sparkles } from "lucide-react";

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
  { href: `/#${SectionId.About}`, label: "About" },
  { href: `/#${SectionId.Mix}`, label: "Mix" },
  { href: `/#${SectionId.Promo}`, label: "Offers" },
  { href: `/#${SectionId.Categories}`, label: "Categories" },
  { href: `/#${SectionId.Products}`, label: "Products" },
  { href: `/#${SectionId.Story}`, label: "Story" },
  { href: `/#${SectionId.Contact}`, label: "Contact" },
];

export const TAB_LINKS: NavIconLink[] = [
  { href: `/#${SectionId.About}`, label: "About", Icon: Info },
  { href: `/#${SectionId.Mix}`, label: "Mix", Icon: Package },
  { href: `/#${SectionId.Promo}`, label: "Offers", Icon: Sparkles },
  { href: `/#${SectionId.Categories}`, label: "Categories", Icon: Grid3X3 },
  { href: `/#${SectionId.Products}`, label: "Products", Icon: ShoppingBag },
  { href: `/#${SectionId.Story}`, label: "Story", Icon: BookOpen },
  { href: `/#${SectionId.Contact}`, label: "Contact", Icon: MessageCircle },
];
