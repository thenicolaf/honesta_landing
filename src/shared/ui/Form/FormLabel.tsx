import { cn } from "@/shared/utils/cn";
import { labelVariants } from "./shared";

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({
  className,
  required,
  children,
  ...props
}: FormLabelProps) {
  return (
    <label className={cn(labelVariants(), className)} {...props}>
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}
