import { ArrowLeft } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/shared/utils/cn";

interface BackLinkProps {
  href?: string;
  label?: string;
  className?: string;
  /** Pin the link just below the fixed navbar as the page scrolls. */
  sticky?: boolean;
}

/**
 * Small outline "back" link — defaults to the home page. Used at the top of
 * standalone routes (/shop, /about, /partnership) so customers have an
 * intuitive way back to the landing page.
 */
export function BackLink({
  href = "/",
  label = "Back to home",
  className,
  sticky = false,
}: BackLinkProps) {
  return (
    <Button
      href={href}
      variant="outline"
      size="sm"
      className={cn(
        "inline-flex",
        sticky && "sticky top-32 md:top-40 lg:top-44 z-100 bg-cream",
        className,
      )}
    >
      <ArrowLeft size={14} className="mr-2" />
      {label}
    </Button>
  );
}
