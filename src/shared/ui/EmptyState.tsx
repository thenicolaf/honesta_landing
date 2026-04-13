import { cn } from "@/shared/utils/cn";
import { HashLink } from "@/sections/navbar/HashLink";
import { buttonVariants } from "./Button";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmptyStateAction {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "sm" | "md" | "lg";
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

// ─── EmptyState ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, label, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4 py-20 text-center", className)}>
      {icon}
      <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/35">
        {label}
      </p>
      {description && (
        <p className="font-body font-light text-sm text-earth/40 max-w-xs">{description}</p>
      )}
      {action && (
        <HashLink
          href={action.href}
          className={cn(
            buttonVariants({
              variant: action.variant ?? "outline",
              size: action.size ?? "sm",
            }),
            "mt-2",
          )}
        >
          {action.label}
        </HashLink>
      )}
    </div>
  );
}
