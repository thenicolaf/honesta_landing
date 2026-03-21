"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button, Tooltip, TooltipTrigger, TooltipContent } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Tooltip side="bottom">
      <TooltipTrigger asChild>
        <Button
          as="button"
          type="button"
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          aria-label="Refresh data"
        >
          <RefreshCw size={14} className={cn(isPending && "animate-spin")} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Sync latest data</TooltipContent>
    </Tooltip>
  );
}
