"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase.server";

export async function toggleFulfilled(orderId: string, isFulfilled: boolean) {
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ is_fulfilled: isFulfilled })
    .eq("id", orderId);

  if (error) return { error: "Failed to update order." };

  revalidatePath("/panel/all-orders");
  return { success: true };
}
