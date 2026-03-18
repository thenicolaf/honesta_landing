"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Button } from "@/shared/ui/Button";
import { IconGoogle } from "@/shared/icons";

export function GoogleSignInButton({ next }: { next: string }) {
  async function handleClick() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <Button
      as="button"
      variant="outline"
      size="lg"
      className="w-full normal-case tracking-normal font-medium text-sm"
      onClick={handleClick}
    >
      <IconGoogle />
      Continue with Google
    </Button>
  );
}
