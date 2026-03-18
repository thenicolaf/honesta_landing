import { supabaseAdmin } from "@/lib/supabase.server";

export interface UserAddress {
  id: string;
  user_id: string;
  label: string | null;
  address: string;
  coordinates: { lat: number; lng: number } | null;
  is_default: boolean;
  created_at: string;
}

export async function getUserAddresses(userId: string): Promise<UserAddress[]> {
  const { data, error } = await supabaseAdmin
    .from("user_addresses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getUserAddresses error:", error);
    return [];
  }

  return (data ?? []) as UserAddress[];
}

export async function createAddress(
  userId: string,
  data: {
    label?: string;
    address: string;
    coordinates: { lat: number; lng: number } | null;
    is_default: boolean;
  },
): Promise<{ id?: string; error?: string }> {
  // Check if user has any addresses
  const { count } = await supabaseAdmin
    .from("user_addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const isFirst = (count ?? 0) === 0;
  const shouldBeDefault = isFirst || data.is_default;

  // If setting as default, unset existing default
  if (shouldBeDefault) {
    await supabaseAdmin
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", userId)
      .eq("is_default", true);
  }

  const { data: row, error } = await supabaseAdmin
    .from("user_addresses")
    .insert({
      user_id: userId,
      label: data.label?.trim() || null,
      address: data.address.trim(),
      coordinates: data.coordinates,
      is_default: shouldBeDefault,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createAddress error:", error);
    return { error: "Failed to save address." };
  }

  return { id: row.id };
}

export async function deleteAddress(
  id: string,
  userId: string,
): Promise<{ error?: string }> {
  // Check if the address being deleted is the default
  const { data: target } = await supabaseAdmin
    .from("user_addresses")
    .select("is_default")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!target) return { error: "Address not found." };

  const { error } = await supabaseAdmin
    .from("user_addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("deleteAddress error:", error);
    return { error: "Failed to delete address." };
  }

  // If deleted address was default, promote the most recent one
  if (target.is_default) {
    const { data: remaining } = await supabaseAdmin
      .from("user_addresses")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (remaining?.[0]) {
      await supabaseAdmin
        .from("user_addresses")
        .update({ is_default: true })
        .eq("id", remaining[0].id);
    }
  }

  return {};
}

export async function updateAddress(
  id: string,
  userId: string,
  data: {
    label?: string;
    address: string;
    coordinates: { lat: number; lng: number } | null;
  },
): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin
    .from("user_addresses")
    .update({
      label: data.label?.trim() || null,
      address: data.address.trim(),
      coordinates: data.coordinates,
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("updateAddress error:", error);
    return { error: "Failed to update address." };
  }

  return {};
}

export async function setDefaultAddress(
  id: string,
  userId: string,
): Promise<{ error?: string }> {
  // Unset all defaults for this user
  await supabaseAdmin
    .from("user_addresses")
    .update({ is_default: false })
    .eq("user_id", userId)
    .eq("is_default", true);

  // Set the new default
  const { error } = await supabaseAdmin
    .from("user_addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("setDefaultAddress error:", error);
    return { error: "Failed to set default address." };
  }

  return {};
}
