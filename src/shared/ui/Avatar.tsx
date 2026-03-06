import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const avatarVariants = cva(
  "rounded-full bg-orange/15 text-orange font-body font-semibold uppercase select-none flex items-center justify-center shrink-0",
  {
    variants: {
      size: {
        sm: "w-7 h-7 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-16 h-16 text-2xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  initial: string;
}

export function Avatar({ initial, size, className, ...props }: AvatarProps) {
  return (
    <span className={cn(avatarVariants({ size }), className)} {...props}>
      {initial[0].toUpperCase()}
    </span>
  );
}
