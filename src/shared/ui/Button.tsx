import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 rounded-full font-body cursor-pointer font-medium uppercase transition-all duration-300",
  {
    variants: {
      variant: {
        primary:
          "bg-orange text-white-warm border-2 border-orange hover:bg-orange-light hover:border-orange-light",
        secondary:
          "bg-white-warm text-orange border-2 border-white-warm hover:bg-orange hover:text-white-warm",
        ghost:
          "bg-transparent text-earth border-2 border-parchment hover:border-bark hover:text-bark",
      },
      size: {
        icon: "w-8 h-8 text-xs",
        sm: "h-8 px-4 text-xs tracking-widest",
        md: "h-11 px-6 text-sm tracking-[0.12em]",
        lg: "h-13 px-8 text-sm tracking-[0.12em]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonAsAnchor
  extends
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  as?: "a";
}

interface ButtonAsButton
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  as: "button";
}

type ButtonProps = ButtonAsAnchor | ButtonAsButton;

export function Button({
  variant,
  size,
  className,
  as,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (as === "button") {
    return (
      <button
        className={classes}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      />
    );
  }

  return (
    <a
      className={classes}
      {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
    />
  );
}
