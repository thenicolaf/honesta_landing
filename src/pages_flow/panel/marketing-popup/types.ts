export type MarketingPopupStatus =
  | "active"
  | "scheduled"
  | "expired"
  | "inactive";

export function getMarketingPopupStatus(
  isActive: boolean,
  startsAt: string | null,
  endsAt: string | null,
  now: Date = new Date(),
): MarketingPopupStatus {
  if (!isActive) return "inactive";
  if (startsAt && new Date(startsAt) > now) return "scheduled";
  if (endsAt && new Date(endsAt) <= now) return "expired";
  return "active";
}
