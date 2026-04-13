"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Button, toastError } from "@/shared/ui";
import { IconGoogle } from "@/shared/icons";

export function GoogleSignInButton({ next }: { next: string }) {
  async function handleClick() {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) toastError("Google sign-in failed. Please try again.");
    } catch {
      toastError("Google sign-in failed. Please try again.");
    }
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
