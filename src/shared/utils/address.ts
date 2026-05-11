import { UAE_EMIRATES } from "@/shared/consts";

const EMIRATE_VALUES = new Set<string>(UAE_EMIRATES.map((e) => e.value));

interface AddressParts {
  emirate: string;
  city: string;
  area: string;
  buildingName: string;
  flatNumber: string;
}

interface ParsedAddressProps {
  defaultEmirate?: string;
  defaultCity?: string;
  defaultArea?: string;
  defaultBuildingName?: string;
  defaultFlatNumber?: string;
}

export function composeAddress(parts: Partial<AddressParts>): string {
  const segments: string[] = [];
  if (parts.flatNumber?.trim())
    segments.push(`Flat ${parts.flatNumber.trim()}`);
  if (parts.buildingName?.trim()) segments.push(parts.buildingName.trim());
  if (parts.area?.trim()) segments.push(parts.area.trim());
  if (parts.city?.trim()) segments.push(parts.city.trim());
  if (parts.emirate?.trim()) segments.push(parts.emirate.trim());
  return segments.join(", ");
}

export function parseAddress(
  address: string | undefined | null,
): ParsedAddressProps {
  const result: AddressParts = {
    emirate: "",
    city: "",
    area: "",
    buildingName: "",
    flatNumber: "",
  };
  if (!address?.trim()) return toProps(result);

  const parts = address
    .split(", ")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return toProps(result);

  // Check last segment for emirate
  const last = parts[parts.length - 1];
  if (EMIRATE_VALUES.has(last)) {
    result.emirate = last;
    parts.pop();
  }

  // Check first segment for flat number
  if (parts.length > 0 && /^Flat\s+/i.test(parts[0])) {
    result.flatNumber = parts[0].replace(/^Flat\s+/i, "");
    parts.shift();
  }

  // Last remaining segment is city
  if (parts.length > 0) {
    result.city = parts.pop()!;
  }

  // Next last remaining segment is area
  if (parts.length > 0) {
    result.area = parts.pop()!;
  }

  // Everything left is building name
  if (parts.length > 0) {
    result.buildingName = parts.join(", ");
  }

  return toProps(result);
}

export function displayAddress(address: string): string {
  const {
    defaultEmirate,
    defaultCity,
    defaultArea,
    defaultBuildingName,
    defaultFlatNumber,
  } = parseAddress(address);
  const segments: string[] = [];
  if (defaultFlatNumber) segments.push(`Flat ${defaultFlatNumber}`);
  if (defaultBuildingName) segments.push(defaultBuildingName);
  if (defaultArea) segments.push(defaultArea);
  if (isCityDistinct(defaultCity, defaultEmirate)) segments.push(defaultCity!);
  if (defaultEmirate) segments.push(defaultEmirate);
  return segments.join(", ");
}

export function shortAddress(address: string): string {
  const { defaultEmirate, defaultCity, defaultArea } = parseAddress(address);
  const parts = [
    defaultArea,
    isCityDistinct(defaultCity, defaultEmirate) ? defaultCity : undefined,
    defaultEmirate,
  ].filter(Boolean);
  return parts.join(", ");
}

function isCityDistinct(city?: string, emirate?: string): boolean {
  return !!city && city.toLowerCase() !== emirate?.toLowerCase();
}

function toProps(p: AddressParts): ParsedAddressProps {
  return {
    defaultEmirate: p.emirate || undefined,
    defaultCity: p.city || undefined,
    defaultArea: p.area || undefined,
    defaultBuildingName: p.buildingName || undefined,
    defaultFlatNumber: p.flatNumber || undefined,
  };
}

/**
 * Maps per-field `CustomerErrors` (flat, keyed by form input name) to the
 * `AddressFieldErrors` shape consumed by `<AddressWithMap>`.
 */
export function mapAddressFieldErrors(fieldErrors?: {
  emirate?: string;
  addressCity?: string;
  addressArea?: string;
  addressBuilding?: string;
  addressFlat?: string;
}) {
  return {
    emirate: fieldErrors?.emirate,
    city: fieldErrors?.addressCity,
    area: fieldErrors?.addressArea,
    buildingName: fieldErrors?.addressBuilding,
    flatNumber: fieldErrors?.addressFlat,
  };
}
