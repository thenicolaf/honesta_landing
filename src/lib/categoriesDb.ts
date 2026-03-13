import { supabaseAdmin } from "@/lib/supabase.server";
import type { DbCategory } from "@/sections/categories/types";

export async function getCategories(): Promise<DbCategory[]> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data as DbCategory[];
}
