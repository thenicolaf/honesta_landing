export type PromoCodeStatus =
  | "active"
  | "scheduled"
  | "expired"
  | "exhausted";

export function getPromoCodeStatus(
  isActive: boolean,
  startsAt: string,
  endsAt: string | null,
  usedCount: number = 0,
  maxUses: number | null = null,
): PromoCodeStatus {
  if (!isActive) return "expired";
  const now = new Date();
  if (new Date(startsAt) > now) return "scheduled";
  if (endsAt && new Date(endsAt) <= now) return "expired";
  if (maxUses != null && usedCount >= maxUses) return "exhausted";
  return "active";
}
