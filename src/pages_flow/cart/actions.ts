"use server";

import { createSupabaseServerClient } from "@/lib/supabase.server";
import { validatePromoCode } from "@/lib/promoCodeApply";
import type { CartItem } from "@/sections/products/types/types";
import type { PromoCodeApplyResult } from "@/lib/promoCodeApply";

export async function applyPromoCodeAction(
  code: string,
  items: CartItem[],
): Promise<PromoCodeApplyResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return validatePromoCode({ code, items, userId: user?.id });
}
