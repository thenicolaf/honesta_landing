import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 rounded-full font-body cursor-pointer font-medium uppercase transition-all duration-300 disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border-2",
        secondary: "border-2",
        outline: "border",
        text: "border-0",
      },
      color: {
        primary: "",
        error: "",
        warning: "",
        default: "",
      },
      size: {
        icon: "w-8 h-8 text-xs",
        sm: "h-8 px-4 text-xs tracking-widest",
        md: "h-11 px-6 text-sm tracking-[0.12em]",
        lg: "h-13 px-8 text-sm tracking-[0.12em]",
      },
    },
    compoundVariants: [
      // primary (filled)
      {
        variant: "primary",
        color: "primary",
        className:
          "bg-orange text-white-warm border-orange hover:bg-orange-light hover:border-orange-light",
      },
      {
        variant: "primary",
        color: "error",
        className:
          "bg-red-500 text-white-warm border-red-500 hover:bg-red-600 hover:border-red-600",
      },
      {
        variant: "primary",
        color: "warning",
        className:
          "bg-amber-400 text-earth border-amber-400 hover:bg-amber-500 hover:border-amber-500",
      },
      {
        variant: "primary",
        color: "default",
        className:
          "bg-earth text-white-warm border-earth hover:bg-earth/80 hover:border-earth/80",
      },
      // secondary (inverted)
      {
        variant: "secondary",
        color: "primary",
        className:
          "bg-white-warm text-orange border-white-warm hover:bg-orange hover:text-white-warm",
      },
      {
        variant: "secondary",
        color: "error",
        className:
          "bg-white-warm text-red-500 border-white-warm hover:bg-red-500 hover:text-white-warm",
      },
      {
        variant: "secondary",
        color: "warning",
        className:
          "bg-white-warm text-amber-600 border-white-warm hover:bg-amber-400 hover:text-earth",
      },
      {
        variant: "secondary",
        color: "default",
        className:
          "bg-white-warm text-earth border-white-warm hover:bg-earth hover:text-white-warm",
      },
      // outline
      {
        variant: "outline",
        color: "primary",
        className:
          "bg-transparent text-earth border-parchment hover:border-bark hover:text-bark",
      },
      {
        variant: "outline",
        color: "error",
        className:
          "bg-transparent text-red-500 border-red-200 hover:border-red-500",
      },
      {
        variant: "outline",
        color: "warning",
        className:
          "bg-transparent text-amber-600 border-amber-200 hover:border-amber-500",
      },
      {
        variant: "outline",
        color: "default",
        className:
          "bg-transparent text-earth border-earth/20 hover:border-earth",
      },
      // text
      {
        variant: "text",
        color: "primary",
        className: "bg-transparent text-earth hover:text-bark",
      },
      {
        variant: "text",
        color: "error",
        className: "bg-transparent text-red-500 hover:text-red-600",
      },
      {
        variant: "text",
        color: "warning",
        className: "bg-transparent text-amber-600 hover:text-amber-700",
      },
      {
        variant: "text",
        color: "default",
        className: "bg-transparent text-earth/60 hover:text-earth",
      },
    ],
    defaultVariants: {
      variant: "primary",
      color: "primary",
      size: "md",
    },
  },
);

interface ButtonBaseProps extends VariantProps<typeof buttonVariants> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

interface ButtonAsAnchor
  extends
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color">,
    ButtonBaseProps {
  as?: "a";
}

interface ButtonAsButton
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    ButtonBaseProps {
  as: "button";
}

type ButtonProps = ButtonAsAnchor | ButtonAsButton;

export function Button({
  variant,
  color,
  size,
  className,
  as,
  startIcon,
  endIcon,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    buttonVariants({
      variant,
      color: color as
        | "primary"
        | "error"
        | "warning"
        | "default"
        | null
        | undefined,
      size,
    }),
    className,
  );

  const content = (
    <>
      {startIcon}
      {children}
      {endIcon}
    </>
  );

  if (as === "button") {
    return (
      <button
        className={classes}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      className={classes}
      {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
    >
      {content}
    </a>
  );
}
