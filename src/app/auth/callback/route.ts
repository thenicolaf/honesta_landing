import {
  createSupabaseServerClient,
  supabaseAdmin,
} from "@/lib/supabase.server";
import { NextRequest, NextResponse } from "next/server";
import { withGAEvent } from "@/shared/utils/analyticsParams";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) next = "/";

  // Handle error params from Supabase (e.g. expired confirmation link)
  if (error) {
    const message = encodeURIComponent(errorDescription || "Authentication failed");
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      // Ensure profile row exists (trigger on auth.users may not fire for OAuth)
      if (data.user) {
        const meta = data.user.user_metadata;
        await supabaseAdmin.from("profiles").upsert(
          {
            id: data.user.id,
            first_name: meta?.full_name?.split(" ")[0] ?? null,
            last_name: meta?.full_name?.split(" ").slice(1).join(" ") ?? null,
          },
          { onConflict: "id", ignoreDuplicates: true },
        );
      }

      const target = withGAEvent(next, "login", "google");
      const forwardedHost = request.headers.get("x-forwarded-host");
      if (process.env.NODE_ENV === "development" || !forwardedHost) {
        return NextResponse.redirect(`${origin}${target}`);
      }
      return NextResponse.redirect(`https://${forwardedHost}${target}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
