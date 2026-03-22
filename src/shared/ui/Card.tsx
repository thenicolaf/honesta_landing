import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const cardVariants = cva("rounded-[16px] overflow-hidden transition-all duration-300", {
  variants: {
    variant: {
      default: "bg-white-warm shadow-sm hover:shadow-md",
      sand:    "bg-sand shadow-sm hover:shadow-md",
      cream:   "bg-cream border border-parchment hover:border-bark",
      outline: "bg-transparent border border-parchment hover:border-bark",
      dark:    "bg-earth text-white-warm",
    },
    padding: {
      none: "",
      sm:   "p-4",
      md:   "p-6",
      lg:   "p-8",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ variant, padding, className, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant, padding }), className)} {...props} />
  );
}
