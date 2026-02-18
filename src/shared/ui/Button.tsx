import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 rounded-full font-body font-semibold uppercase transition-all duration-300",
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
        sm: "px-5 py-2 text-sm tracking-widest",
        md: "px-8 py-4 text-sm tracking-[0.12em]",
        lg: "px-10 py-5 text-base tracking-[0.12em]",
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
