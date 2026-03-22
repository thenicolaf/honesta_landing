import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-body font-medium uppercase tracking-[0.12em] rounded-full",
  {
    variants: {
      variant: {
        natural: "bg-moss/10 text-moss border border-moss/20",
        warm:    "bg-sand text-bark border border-parchment",
        outline: "bg-transparent text-earth border border-parchment",
        counter: "bg-orange text-white-warm border-0 tracking-normal normal-case",
      },
      size: {
        xs: "px-2 py-0.5 text-xs",
        sm: "px-3 py-1 text-2xs",
        md: "px-4 py-1.5 text-2xs",
        pill: "min-w-4 h-4 px-1 text-xs leading-none justify-center",
      },
    },
    defaultVariants: {
      variant: "natural",
      size: "md",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ variant, size, className, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
