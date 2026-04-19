export type MixStatus = "active" | "inactive";

export function getMixStatus(isActive: boolean): MixStatus {
  return isActive ? "active" : "inactive";
}

export const MIX_STATUS_LABELS: Record<MixStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};
