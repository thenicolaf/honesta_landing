import { cn } from "@/shared/utils/cn";
import { labelVariants } from "./shared";

export function FormLabel({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn(labelVariants(), className)} {...props} />;
}
