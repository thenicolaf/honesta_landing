import { createSupabaseServerClient, supabase, supabaseAdmin } from "@/lib/supabase.server";
import { FavoritesPage } from "@/pages_flow/favorites/FavoritesPage";

export default async function Page() {
  const supabaseServer = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  const [
    { data: favoritesData },
    { data: tagOptionsData },
    { data: freeFromOptionsData },
    { data: servingIdeaOptionsData },
    { data: occasionOptionsData },
    { data: benefitsData },
  ] = await Promise.all([
    supabaseAdmin
      .from("user_favorites")
      .select("product_id")
      .eq("user_id", user!.id),
    supabase.from("tag_options").select("id, label"),
    supabase.from("free_from_options").select("id, label"),
    supabase.from("serving_idea_options").select("id, label"),
    supabase.from("occasion_options").select("id, label"),
    supabase.from("benefits").select("id, name, description"),
  ]);

  const productIds = (favoritesData ?? []).map(
    (f: { product_id: string }) => f.product_id,
  );

  const productsData =
    productIds.length > 0
      ? (
          await supabase
            .from("products")
            .select("*, categories(name, slug)")
            .in("id", productIds)
        ).data ?? []
      : [];

  return (
    <FavoritesPage
      rawProducts={productsData}
      tagOptions={tagOptionsData ?? []}
      freeFromOptions={freeFromOptionsData ?? []}
      servingIdeaOptions={servingIdeaOptionsData ?? []}
      occasionOptions={occasionOptionsData ?? []}
      benefits={benefitsData ?? []}
    />
  );
}
