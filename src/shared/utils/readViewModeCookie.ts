import { cookies } from "next/headers";
import {
  DEFAULT_VIEW_MODE,
  type ViewMode,
} from "@/providers/ViewModeProvider";

export async function readViewModeCookie(
  cookieKey: string,
  defaultMode: ViewMode = DEFAULT_VIEW_MODE,
): Promise<ViewMode> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(cookieKey)?.value;
  return stored === "card" || stored === "row" ? stored : defaultMode;
}
