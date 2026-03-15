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

export async function getCategoryById(id: string): Promise<DbCategory | null> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return data as DbCategory;
}
