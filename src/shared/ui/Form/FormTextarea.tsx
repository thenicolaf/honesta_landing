import { cn } from "@/shared/utils/cn";
import { fieldVariants, type FieldVariantProps } from "./shared";

export function FormTextarea({
  className,
  state,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldVariantProps) {
  return (
    <textarea
      className={cn(fieldVariants({ state }), "py-3 resize-none", className)}
      {...props}
    />
  );
}
