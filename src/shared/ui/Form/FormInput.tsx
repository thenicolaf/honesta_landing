import { cn } from "@/shared/utils/cn";
import { fieldVariants, type FieldVariantProps } from "./shared";

export function FormInput({
  className,
  state,
  ref,
  ...props
}: React.ComponentPropsWithRef<"input"> & FieldVariantProps) {
  return (
    <input
      ref={ref}
      className={cn(fieldVariants({ state }), "h-10", className)}
      {...props}
    />
  );
}
