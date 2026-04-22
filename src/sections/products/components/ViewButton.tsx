import { ArrowUpRight } from "lucide-react";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";

interface ViewButtonProps {
  href: string;
  className?: string;
}

export function ViewButton({ href, className }: ViewButtonProps) {
  return (
    <Button
      href={href}
      variant="text"
      size="icon"
      className={cn(
        "absolute bottom-2 left-2 z-20 rounded-full bg-earth/30 p-1.5! text-white-warm! backdrop-blur-sm hover:bg-earth/50 transition-all duration-300",
        className,
      )}
      aria-label="View product details"
    >
      <ArrowUpRight className="w-3.5 h-3.5" />
    </Button>
  );
}
