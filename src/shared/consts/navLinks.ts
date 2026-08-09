import type { ComponentType, SVGProps } from "react";
import { ShoppingBag, Package, Sparkles, Info, Handshake } from "lucide-react";

export enum SectionId {
  Mix = "mix",
  Promo = "promo",
  Categories = "categories",
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
  { href: "/shop", label: "Shop" },
  { href: `/#${SectionId.Mix}`, label: "Mix" },
  { href: `/#${SectionId.Promo}`, label: "Offers" },
  { href: "/about", label: "About" },
  { href: "/partnership", label: "Partnership" },
];

/**
 * Direct links to the permanent per-category shop pages (TZ §11).
 * Label ≠ slug (Ghee → ghee-essentials, Mixes & Gifts → mixes-gifts), so the
 * mapping is explicit. Slugs are editorial-stable; update here if renamed in DB.
 * Reused by the footer and the About "Our Products" block.
 */
export const SHOP_CATEGORY_LINKS: { label: string; href: `/${string}` }[] = [
  { label: "Fruit Rolls", href: "/shop/fruit-roll" },
  { label: "Dried Fruits", href: "/shop/dried-fruits" },
  { label: "Jerky", href: "/shop/jerky" },
  { label: "Dried Vegetables", href: "/shop/dried-vegetables" },
  { label: "Ghee", href: "/shop/ghee-essentials" },
  { label: "Mixes & Gifts", href: "/shop/mixes-gifts" },
];

export const TAB_LINKS: NavIconLink[] = [
  { href: "/shop", label: "Shop", Icon: ShoppingBag },
  { href: `/#${SectionId.Mix}`, label: "Mix", Icon: Package },
  { href: `/#${SectionId.Promo}`, label: "Offers", Icon: Sparkles },
  { href: "/about", label: "About", Icon: Info },
  { href: "/partnership", label: "Partnership", Icon: Handshake },
];
