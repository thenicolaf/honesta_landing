import { AlertTriangle, Info } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils/cn";

const alertVariants = cva("flex gap-2.5 rounded-xl border px-3.5 py-3", {
  variants: {
    variant: {
      info: "bg-sand/50 border-earth/15",
      warning: "bg-orange/10 border-orange/30",
      error: "bg-red-50 border-red-200",
    },
  },
  defaultVariants: { variant: "info" },
});

const iconVariants = cva("w-4 h-4 shrink-0 mt-0.5", {
  variants: {
    variant: {
      info: "text-earth/55",
      warning: "text-orange",
      error: "text-red-600",
    },
  },
  defaultVariants: { variant: "info" },
});

const titleVariants = cva("font-body font-semibold text-sm leading-snug", {
  variants: {
    variant: {
      info: "text-earth",
      warning: "text-earth",
      error: "text-red-700",
    },
  },
  defaultVariants: { variant: "info" },
});

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;

const DEFAULT_ICONS: Record<AlertVariant, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  error: AlertTriangle,
};

interface AlertProps extends VariantProps<typeof alertVariants> {
  title?: React.ReactNode;
  /** Overrides the variant's default icon; pass `null` to hide it. */
  icon?: React.ReactNode | null;
  children?: React.ReactNode;
  className?: string;
}

export function Alert({
  variant,
  title,
  icon,
  children,
  className,
}: AlertProps) {
  const v: AlertVariant = variant ?? "info";
  const DefaultIcon = DEFAULT_ICONS[v];
  const renderedIcon =
    icon === undefined ? (
      <DefaultIcon className={iconVariants({ variant: v })} aria-hidden="true" />
    ) : (
      icon
    );

  return (
    <div
      role={v === "info" ? "status" : "alert"}
      className={cn(alertVariants({ variant: v }), className)}
    >
      {renderedIcon}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {title && <p className={titleVariants({ variant: v })}>{title}</p>}
        {children && (
          <div className="font-body font-light text-2xs text-earth/75 leading-relaxed">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
