import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { Button, Skeleton } from "@/shared/ui";
import { supabaseAdmin } from "@/lib/supabase.server";
import { getDeliverySettings } from "@/lib/deliveryDb";
import { getActiveMixBoxes } from "@/lib/mixBoxesDb";
import {
  calculateDiscountedPrice,
  findActivePromotion,
  type PromotionRow,
} from "@/shared/utils/calculateDiscount";
import type { Product, ProductVariant } from "@/sections/products/types/types";
import { ManualOrderForm } from "@/pages_flow/panel/orders/manual-order/ManualOrderForm";

type ManualOrderProductRow = {
  id: string;
  title: string;
  slug: string | null;
  image_url: string | null;
  categories: { name: string } | null;
  product_variants: { id: string; weight_g: number; price: string | number }[];
  promotion_products: { promotions: PromotionRow | PromotionRow[] }[];
};

async function getManualOrderProducts(): Promise<Product[]> {
  const { data } = await supabaseAdmin
    .from("products")
    .select(
      `id, title, slug, image_url,
       categories(name),
       product_variants(id, weight_g, price),
       promotion_products(promotions(name, discount_type, discount_value, starts_at, ends_at, is_active))`,
    )
    .eq("status", "published")
    .order("title", { ascending: true });

  const rows = (data ?? []) as unknown as ManualOrderProductRow[];

  return rows.map((p) => {
    const variants: ProductVariant[] = (p.product_variants ?? [])
      .map((v) => ({ id: v.id, weight_g: v.weight_g, price: Number(v.price) }))
      .sort((a, b) => a.weight_g - b.weight_g);
    const defaultVariant = variants[0];
    const originalPrice = defaultVariant?.price ?? 0;
    const activePromo = findActivePromotion(p.promotion_products ?? []);
    const promotion = activePromo
      ? {
          name: activePromo.name,
          discountType: activePromo.discount_type as "percentage" | "fixed",
          discountValue: Number(activePromo.discount_value),
          discountedPrice: calculateDiscountedPrice(
            originalPrice,
            activePromo.discount_type as "percentage" | "fixed",
            Number(activePromo.discount_value),
          ),
          endsAt: activePromo.ends_at,
        }
      : undefined;

    return {
      id: p.id,
      slug: p.slug ?? undefined,
      title: p.title,
      tagline: "",
      category: p.categories?.name ?? "",
      tags: [],
      freeFrom: [],
      ingredients: [],
      image_url: p.image_url ?? "",
      images: [],
      price: originalPrice,
      weight_g: defaultVariant?.weight_g,
      variants,
      mark: "standard",
      promotion,
    } satisfies Product;
  });
}

async function CreateContent() {
  const [products, deliverySettings, boxes] = await Promise.all([
    getManualOrderProducts(),
    getDeliverySettings(),
    getActiveMixBoxes(),
  ]);
  return (
    <ManualOrderForm
      products={products}
      deliverySettings={deliverySettings}
      boxes={boxes}
    />
  );
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-earth/8 bg-white-warm p-5 flex flex-col gap-4"
        >
          <Skeleton className="h-3 w-24" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <>
      <div className="mb-6">
        <Button
          href="/panel/all-orders"
          variant="outline"
          size="sm"
          startIcon={<ArrowLeft size={14} />}
        >
          Back to orders
        </Button>
      </div>

      <AdminPageHeader title="New order" label="Admin Panel" />
      <Suspense fallback={<FormSkeleton />}>
        <CreateContent />
      </Suspense>
    </>
  );
}
