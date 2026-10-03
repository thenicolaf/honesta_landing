import { Truck } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils/cn";

const deliveryInfoVariants = cva("flex items-center gap-1.5", {
  variants: {
    variant: {
      plain: "",
      highlight: "rounded-xl border border-moss/25 bg-moss/10 px-3 py-2 gap-2",
    },
  },
  defaultVariants: { variant: "plain" },
});

const iconVariants = cva("shrink-0", {
  variants: {
    variant: {
      plain: "w-4 h-4 text-earth/40",
      highlight: "w-4 h-4 text-moss",
    },
  },
  defaultVariants: { variant: "plain" },
});

const labelVariants = cva("font-body text-2xs", {
  variants: {
    variant: {
      plain: "font-normal text-earth/50",
      highlight: "font-normal text-moss",
    },
  },
  defaultVariants: { variant: "plain" },
});

interface DeliveryInfoProps extends VariantProps<typeof deliveryInfoVariants> {
  label: string;
  className?: string;
}

export function DeliveryInfo({ label, variant, className }: DeliveryInfoProps) {
  return (
    <div className={cn(deliveryInfoVariants({ variant }), className)}>
      <Truck className={iconVariants({ variant })} />
      <span className={labelVariants({ variant })}>{label}</span>
    </div>
  );
}
