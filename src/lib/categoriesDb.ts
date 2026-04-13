import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase.server";
import type { DbCategory } from "@/sections/categories/types";

export const getCategories = cache(async (): Promise<DbCategory[]> => {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error || !data) return [];

  return data as DbCategory[];
});

export async function getCategoryById(id: string): Promise<DbCategory | null> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return data as DbCategory;
}

export async function getMaxSortOrder(): Promise<number> {
  const { data } = await supabaseAdmin
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single<{ sort_order: number }>();

  return data?.sort_order ?? 0;
}

export async function updateCategoryOrder(
  orderedIds: string[],
): Promise<boolean> {
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabaseAdmin
        .from("categories")
        .update({ sort_order: index + 1 })
        .eq("id", id),
    ),
  );

  return results.every((r) => !r.error);
}
