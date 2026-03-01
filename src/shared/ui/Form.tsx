import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const labelVariants = cva(
  "font-body font-semibold text-earth text-xs uppercase tracking-[0.12em] block mb-2",
);

const fieldVariants = cva(
  "w-full border rounded-xl px-4 py-3 font-body font-light text-earth bg-cream placeholder:text-earth/30 focus:outline-none transition-colors text-sm",
  {
    variants: {
      state: {
        default: "border-parchment focus:border-orange",
        error: "border-red-400 focus:border-red-500",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

type FieldVariantProps = VariantProps<typeof fieldVariants>;

export function FormLabel({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn(labelVariants(), className)} {...props} />;
}

export function FormInput({
  className,
  state,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & FieldVariantProps) {
  return (
    <input className={cn(fieldVariants({ state }), className)} {...props} />
  );
}

export function FormSelect({
  className,
  state,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & FieldVariantProps) {
  return (
    <select className={cn(fieldVariants({ state }), className)} {...props} />
  );
}

export function FormTextarea({
  className,
  state,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldVariantProps) {
  return (
    <textarea
      className={cn(fieldVariants({ state }), "resize-none", className)}
      {...props}
    />
  );
}

export function FormError({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p className={cn("font-body  text-red-500 text-2xs mt-1", className)}>
      {message}
    </p>
  );
}
