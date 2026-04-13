import { Suspense } from "react";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase.server";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { SkeletonProductGrid } from "@/shared/ui";
import { mapDbProducts } from "@/sections/products/utils/mapDbProducts";
import { FavoritesGrid } from "@/pages_flow/favorites/FavoritesGrid";

async function FavoritesContent() {
  const supabaseServer = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  const { data: favoritesData } = await supabaseAdmin
    .from("user_favorites")
    .select("product_id")
    .eq("user_id", user!.id);

  const productIds = (favoritesData ?? []).map(
    (f: { product_id: string }) => f.product_id,
  );

  const productsData =
    productIds.length > 0
      ? (
          await supabaseAdmin
            .from("products")
            .select(
              `*, categories(slug, name),
              product_tags(tag_options(label)),
              product_free_froms(free_from_options(label)),
              product_serving_ideas(serving_idea_options(label)),
              product_occasions(occasion_options(label)),
              product_benefits(benefits(name, description)),
              promotion_products(promotions(name, discount_type, discount_value, starts_at, ends_at, is_active)),
              product_variants(id, weight_g, price)`,
            )
            .in("id", productIds)
        ).data ?? []
      : [];

  const products = mapDbProducts(productsData);

  return <FavoritesGrid allProducts={products} />;
}

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Favorites" />
      <Suspense fallback={<SkeletonProductGrid count={6} />}>
        <FavoritesContent />
      </Suspense>
    </>
  );
}
