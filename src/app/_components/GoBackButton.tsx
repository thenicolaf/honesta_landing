"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { IconChevron } from "@/shared/icons";

interface GoBackButtonProps {
  label?: string;
  className?: string;
}

export function GoBackButton({
  label = "Go Back",
  className,
}: GoBackButtonProps) {
  const router = useRouter();

  return (
    <Button
      as="button"
      type="button"
      variant="outline"
      size="sm"
      className={`gap-1.5 ${className ?? ""}`}
      onClick={() => router.back()}
    >
      <IconChevron className="w-3.5 h-3.5 rotate-90" aria-hidden />
      {label}
    </Button>
  );
}
