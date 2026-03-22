export interface RouteItem {
  href: string;
  label: string;
}

export const USER_ROUTES: RouteItem[] = [
  { href: "/panel/profile", label: "Profile" },
  { href: "/panel/favorites", label: "Favorites" },
  { href: "/panel/orders", label: "Orders" },
];

export const ADMIN_ROUTES: RouteItem[] = [
  { href: "/panel", label: "Dashboard" },
  { href: "/panel/categories", label: "Categories" },
  { href: "/panel/products", label: "Products" },
  { href: "/panel/all-orders", label: "All Orders" },
  { href: "/panel/partnerships", label: "Partnerships" },
  { href: "/panel/promotions", label: "Promotions" },
  { href: "/panel/delivery", label: "Delivery" },
];
