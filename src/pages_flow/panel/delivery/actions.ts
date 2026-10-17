"use server";

import { revalidatePath } from "next/cache";
import { getDeliverySettings, updateDeliverySetting } from "@/lib/deliveryDb";
import {
  deleteDeliverySlot,
  findSlotConflicts,
  getDeliverySlots,
  insertDeliverySlot,
  updateDeliverySlot,
} from "@/lib/deliverySlotsDb";
import {
  deleteDeliveryBlackout,
  insertDeliveryBlackout,
  updateDeliveryBlackout,
} from "@/lib/deliveryBlackoutsDb";
import { fromDateOnlyString, getZoneIsoWeekday } from "@/shared/utils/zonedTime";
import { WEEKDAYS_ISO } from "@/shared/consts/delivery";
import { toConflictInfo, type SlotConflictInfo } from "./slotScope";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmirateSettingValues {
  fee: number;
  threshold: number | null;
  minimum: number | null;
  days: number;
  cutoff_hour: number;
  is_active: boolean;
}

export interface EmirateSettingState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: EmirateSettingValues;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePositiveNumber(raw: string | null): number | null {
  if (!raw?.trim()) return null;
  const n = parseFloat(raw);
  return isNaN(n) || n < 0 ? NaN : n;
}

function parseIntOrDefault(raw: string | null, fallback: number): number {
  if (!raw?.trim()) return fallback;
  const n = parseInt(raw);
  return isNaN(n) ? fallback : n;
}

function parseFormValues(formData: FormData): EmirateSettingValues {
  return {
    fee: parseFloat(formData.get("fee") as string),
    threshold: parsePositiveNumber(formData.get("threshold") as string),
    minimum: parsePositiveNumber(formData.get("minimum") as string),
    days: parseIntOrDefault(formData.get("days") as string, 1),
    cutoff_hour: parseIntOrDefault(formData.get("cutoff_hour") as string, 19),
    is_active: formData.get("is_active") === "true",
  };
}

function validate(
  fee: number,
  threshold: number | null,
  minimum: number | null,
  days: number,
  cutoffHour: number,
) {
  const fieldErrors: Record<string, string> = {};

  if (isNaN(fee) || fee < 0) {
    fieldErrors.fee = "Delivery fee must be a positive number";
  }
  if (threshold !== null && isNaN(threshold)) {
    fieldErrors.threshold = "Free delivery threshold must be a positive number";
  }
  if (minimum !== null && isNaN(minimum)) {
    fieldErrors.minimum = "Minimum order must be a positive number";
  }
  if (isNaN(days) || days < 0) {
    fieldErrors.days = "Delivery days must be 0 or more";
  }
  if (isNaN(cutoffHour) || cutoffHour < 0 || cutoffHour > 23) {
    fieldErrors.cutoff_hour = "Cut-off hour must be between 0 and 23";
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function saveEmirateSetting(
  id: string,
  _prevState: EmirateSettingState | null,
  formData: FormData,
): Promise<EmirateSettingState> {
  const values = parseFormValues(formData);

  const fieldErrors = validate(
    values.fee,
    values.threshold,
    values.minimum,
    values.days,
    values.cutoff_hour,
  );
  if (fieldErrors) {
    return { fieldErrors, values };
  }

  try {
    const { error } = await updateDeliverySetting(id, {
      delivery_fee: values.fee,
      free_delivery_threshold: values.threshold,
      minimum_order: values.minimum,
      delivery_days: values.days,
      cutoff_hour: values.cutoff_hour,
      is_active: values.is_active,
    });

    if (error) {
      return { error: `Failed to save: ${error}`, values };
    }

    revalidatePath("/panel/delivery");
    revalidatePath("/cart");
    revalidatePath("/checkout");

    return { success: true };
  } catch (err) {
    console.error("Save emirate setting error:", err);
    return { error: "Something went wrong. Please try again.", values };
  }
}

// ─── Slot actions ────────────────────────────────────────────────────────────

interface SlotValues {
  label: string;
  start_time: string;
  end_time: string;
  available_weekdays: number[];
  is_active: boolean;
  /** Empty = all emirates. */
  emirates: string[];
}

export interface SlotState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Overlapping slots within the same schedule — saving is blocked. */
  conflicts?: SlotConflictInfo[];
  values?: SlotValues;
}

function parseEmirates(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const names = parsed
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean);
    return Array.from(new Set(names));
  } catch {
    return [];
  }
}

function parseSlotValues(formData: FormData): SlotValues {
  const weekdaysRaw = ((formData.get("available_weekdays") as string) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !isNaN(n) && WEEKDAYS_ISO.includes(n as 1));

  return {
    label: ((formData.get("label") as string) ?? "").trim(),
    start_time: ((formData.get("start_time") as string) ?? "").trim(),
    end_time: ((formData.get("end_time") as string) ?? "").trim(),
    available_weekdays: Array.from(new Set(weekdaysRaw)).sort((a, b) => a - b),
    is_active: formData.get("is_active") === "true",
    emirates: parseEmirates(formData.get("emirates") as string | null),
  };
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function validateSlot(values: SlotValues): Record<string, string> | null {
  const fieldErrors: Record<string, string> = {};
  if (!values.label) fieldErrors.label = "Enter a slot label";
  if (!TIME_PATTERN.test(values.start_time))
    fieldErrors.start_time = "Use HH:MM format";
  if (!TIME_PATTERN.test(values.end_time))
    fieldErrors.end_time = "Use HH:MM format";
  if (
    !fieldErrors.start_time &&
    !fieldErrors.end_time &&
    values.start_time >= values.end_time
  )
    fieldErrors.end_time = "End must be after start";
  if (values.available_weekdays.length === 0)
    fieldErrors.available_weekdays = "Pick at least one weekday";
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

/**
 * Maps submitted emirate names onto the canonical spelling from
 * `delivery_settings` (case-insensitive). Unknown names are a field error.
 */
async function normalizeSlotEmirates(
  values: SlotValues,
): Promise<{ emirates: string[]; error?: string }> {
  if (values.emirates.length === 0) return { emirates: [] };
  const settings = await getDeliverySettings();
  const byLower = new Map(
    settings.map((s) => [s.emirate.toLowerCase(), s.emirate]),
  );
  const emirates: string[] = [];
  for (const name of values.emirates) {
    const canonical = byLower.get(name.toLowerCase());
    if (!canonical) return { emirates: [], error: `Unknown emirate: ${name}` };
    if (!emirates.includes(canonical)) emirates.push(canonical);
  }
  return { emirates };
}

/**
 * Authoritative overlap check against the current DB state — the form runs
 * the same `findSlotConflicts` live, this catches races between tabs.
 */
async function checkConflicts(
  values: SlotValues,
  excludeId?: string,
): Promise<SlotConflictInfo[]> {
  const existing = await getDeliverySlots();
  return findSlotConflicts(values, existing, excludeId).map(toConflictInfo);
}

async function prepareSlot(
  formData: FormData,
  excludeId?: string,
): Promise<{ values: SlotValues; failure?: SlotState }> {
  const values = parseSlotValues(formData);
  const fieldErrors = validateSlot(values) ?? {};

  const { emirates, error: emiratesError } =
    await normalizeSlotEmirates(values);
  if (emiratesError) fieldErrors.emirates = emiratesError;
  if (Object.keys(fieldErrors).length > 0) {
    return { values, failure: { fieldErrors, values } };
  }

  const normalized = { ...values, emirates };
  const conflicts = await checkConflicts(normalized, excludeId);
  if (conflicts.length > 0) {
    return {
      values: normalized,
      failure: {
        error: `Overlaps with ${conflicts.length} slot${conflicts.length === 1 ? "" : "s"}`,
        conflicts,
        values: normalized,
      },
    };
  }
  return { values: normalized };
}

function toSlotInput(values: SlotValues) {
  return {
    label: values.label,
    start_time: values.start_time,
    end_time: values.end_time,
    is_active: values.is_active,
    available_weekdays: values.available_weekdays,
    emirates: values.emirates,
  };
}

function revalidateDelivery() {
  revalidatePath("/panel/delivery");
  revalidatePath("/panel/all-orders/create");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function createSlotAction(
  _prevState: SlotState | null,
  formData: FormData,
): Promise<SlotState> {
  let values = parseSlotValues(formData);

  try {
    const prepared = await prepareSlot(formData);
    values = prepared.values;
    if (prepared.failure) return prepared.failure;

    const { error } = await insertDeliverySlot(toSlotInput(values));
    if (error) return { error: `Failed to create slot: ${error}`, values };

    revalidateDelivery();
    return { success: true };
  } catch (err) {
    console.error("createSlotAction error:", err);
    return { error: "Something went wrong. Please try again.", values };
  }
}

export async function updateSlotAction(
  id: string,
  _prevState: SlotState | null,
  formData: FormData,
): Promise<SlotState> {
  let values = parseSlotValues(formData);

  try {
    const prepared = await prepareSlot(formData, id);
    values = prepared.values;
    if (prepared.failure) return prepared.failure;

    const { error } = await updateDeliverySlot(id, toSlotInput(values));
    if (error) return { error: `Failed to update slot: ${error}`, values };

    revalidateDelivery();
    return { success: true };
  } catch (err) {
    console.error("updateSlotAction error:", err);
    return { error: "Something went wrong. Please try again.", values };
  }
}

export async function deleteSlotAction(
  id: string,
): Promise<{ error?: string; success?: boolean }> {
  try {
    const { error } = await deleteDeliverySlot(id);
    if (error) return { error: `Failed to delete slot: ${error}` };
    revalidateDelivery();
    return { success: true };
  } catch (err) {
    console.error("deleteSlotAction error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

// ─── Blackout actions ────────────────────────────────────────────────────────

interface BlackoutValues {
  blackout_date: string;
  slot_id: string | null;
  reason: string | null;
}

export interface BlackoutState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: BlackoutValues;
}

function parseBlackoutValues(formData: FormData): BlackoutValues {
  const slotId = ((formData.get("slot_id") as string) ?? "").trim();
  const reason = ((formData.get("reason") as string) ?? "").trim();
  return {
    blackout_date: ((formData.get("blackout_date") as string) ?? "").trim(),
    slot_id: slotId.length > 0 ? slotId : null,
    reason: reason.length > 0 ? reason : null,
  };
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

async function validateBlackoutInput(
  values: BlackoutValues,
): Promise<Record<string, string> | null> {
  const fieldErrors: Record<string, string> = {};

  if (!ISO_DATE_PATTERN.test(values.blackout_date)) {
    fieldErrors.blackout_date = "Pick a date";
  } else {
    const parsed = fromDateOnlyString(values.blackout_date);
    if (Number.isNaN(parsed.getTime())) {
      fieldErrors.blackout_date = "Invalid date";
    }
  }

  if (Object.keys(fieldErrors).length > 0) return fieldErrors;

  if (values.slot_id) {
    const slots = await getDeliverySlots();
    const slot = slots.find((s) => s.id === values.slot_id);
    if (!slot) return { slot_id: "Slot not found, refresh the page" };
    const isoWeekday = getZoneIsoWeekday(
      fromDateOnlyString(values.blackout_date),
    );
    if (!slot.available_weekdays.includes(isoWeekday)) {
      return { slot_id: "This slot doesn't run on the selected weekday" };
    }
  }

  return null;
}

function mapBlackoutDbError(error: string): {
  fieldErrors?: Record<string, string>;
  error?: string;
} {
  if (error.includes("duplicate") || error.includes("unique")) {
    return { fieldErrors: { blackout_date: "This date is already blocked" } };
  }
  return { error: `Failed to save blackout: ${error}` };
}

export async function addBlackoutAction(
  _prevState: BlackoutState | null,
  formData: FormData,
): Promise<BlackoutState> {
  const values = parseBlackoutValues(formData);
  const fieldErrors = await validateBlackoutInput(values);
  if (fieldErrors) return { fieldErrors, values };

  try {
    const { error } = await insertDeliveryBlackout({
      blackout_date: values.blackout_date,
      slot_id: values.slot_id,
      reason: values.reason,
    });
    if (error) return { ...mapBlackoutDbError(error), values };

    revalidateDelivery();
    return { success: true };
  } catch (err) {
    console.error("addBlackoutAction error:", err);
    return { error: "Something went wrong. Please try again.", values };
  }
}

export async function updateBlackoutAction(
  id: string,
  _prevState: BlackoutState | null,
  formData: FormData,
): Promise<BlackoutState> {
  const values = parseBlackoutValues(formData);
  const fieldErrors = await validateBlackoutInput(values);
  if (fieldErrors) return { fieldErrors, values };

  try {
    const { error } = await updateDeliveryBlackout(id, {
      blackout_date: values.blackout_date,
      slot_id: values.slot_id,
      reason: values.reason,
    });
    if (error) return { ...mapBlackoutDbError(error), values };

    revalidateDelivery();
    return { success: true };
  } catch (err) {
    console.error("updateBlackoutAction error:", err);
    return { error: "Something went wrong. Please try again.", values };
  }
}

export async function removeBlackoutAction(
  id: string,
): Promise<{ error?: string; success?: boolean }> {
  try {
    const { error } = await deleteDeliveryBlackout(id);
    if (error) return { error: `Failed to remove blackout: ${error}` };
    revalidateDelivery();
    return { success: true };
  } catch (err) {
    console.error("removeBlackoutAction error:", err);
    return { error: "Something went wrong." };
  }
}

