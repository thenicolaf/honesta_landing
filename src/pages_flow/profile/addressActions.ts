"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/addressesDb";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AddressState {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    label?: string;
    address?: string;
  };
  values?: AddressValues;
  attempt?: number;
}

interface AddressValues {
  label?: string;
  address?: string;
  lat?: string;
  lng?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAddressValues(formData: FormData): AddressValues {
  return {
    label: (formData.get("label") as string)?.trim() || "",
    address: (formData.get("address") as string)?.trim() || "",
    lat: (formData.get("lat") as string) || "",
    lng: (formData.get("lng") as string) || "",
  };
}

function parseCoordinates(values: AddressValues) {
  const lat = parseFloat(values.lat ?? "");
  const lng = parseFloat(values.lng ?? "");
  return !isNaN(lat) && !isNaN(lng) ? { lat, lng } : null;
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createAddressAction(
  _prevState: AddressState | null,
  formData: FormData,
): Promise<AddressState> {
  const values = parseAddressValues(formData);
  const attempt = (_prevState?.attempt ?? 0) + 1;

  if (!values.address) {
    return { fieldErrors: { address: "Address is required." }, values, attempt };
  }

  const { user } = await requireUser();

  const { error } = await createAddress(user.id, {
    label: values.label || undefined,
    address: values.address,
    coordinates: parseCoordinates(values),
    is_default: false,
  });

  if (error) {
    return { error, values, attempt };
  }

  return { success: true, attempt };
}

export async function updateAddressAction(
  id: string,
  _prevState: AddressState | null,
  formData: FormData,
): Promise<AddressState> {
  const values = parseAddressValues(formData);
  const attempt = (_prevState?.attempt ?? 0) + 1;

  if (!values.address) {
    return { fieldErrors: { address: "Address is required." }, values, attempt };
  }

  const { user } = await requireUser();

  const { error } = await updateAddress(id, user.id, {
    label: values.label || undefined,
    address: values.address,
    coordinates: parseCoordinates(values),
  });

  if (error) {
    return { error, values, attempt };
  }

  return { success: true, attempt };
}

export async function deleteAddressAction(
  id: string,
): Promise<{ error?: string }> {
  const { user } = await requireUser();
  return deleteAddress(id, user.id);
}

export async function setDefaultAddressAction(
  id: string,
): Promise<{ error?: string }> {
  const { user } = await requireUser();
  return setDefaultAddress(id, user.id);
}
