export type PromotionStatus = "active" | "scheduled" | "expired";

export function getPromotionStatus(
  isActive: boolean,
  startsAt: string,
  endsAt: string,
): PromotionStatus {
  if (!isActive) return "expired";
  const now = new Date();
  if (new Date(startsAt) > now) return "scheduled";
  if (new Date(endsAt) <= now) return "expired";
  return "active";
}
