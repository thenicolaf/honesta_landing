import type { AdminDbProduct, AdminProductInventory } from "@/lib/productsDb";

export function pickAdminInventory(
  product: AdminDbProduct | undefined | null,
): AdminProductInventory {
  if (!product) {
    return { stock_g: 0, low_stock_threshold_g: 500, cost_per_100g: 0 };
  }
  const raw = product.product_inventory;
  const inv = Array.isArray(raw) ? raw[0] : raw;
  return {
    stock_g: inv?.stock_g ?? 0,
    low_stock_threshold_g: inv?.low_stock_threshold_g ?? 500,
    cost_per_100g: Number(inv?.cost_per_100g ?? 0),
  };
}
