"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";

export function GoBackButton() {
  const router = useRouter();

  return (
    <Button
      as="button"
      type="button"
      variant="outline"
      onClick={() => router.back()}
    >
      Go Back
    </Button>
  );
}
