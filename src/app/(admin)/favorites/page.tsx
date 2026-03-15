import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase.server";
import { FavoritesPage } from "@/pages_flow/favorites/FavoritesPage";

export default async function Page() {
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
              product_benefits(benefits(name, description))`,
            )
            .in("id", productIds)
        ).data ?? []
      : [];

  return <FavoritesPage rawProducts={productsData} />;
}
