import { getNotificationHref } from "@/shared/ui";

export async function resolveNotificationHref(
  type: string,
  relatedId: string | null,
): Promise<string | null> {
  const staticHref = getNotificationHref(type);
  if (staticHref) return staticHref;

  if (!relatedId) return null;
  if (type !== "new_product" && type !== "new_category") return null;

  try {
    const res = await fetch(
      `/api/notifications/resolve?type=${type}&id=${relatedId}`,
    );
    if (!res.ok) return null;
    const { href } = await res.json();
    return href ?? null;
  } catch {
    return null;
  }
}
