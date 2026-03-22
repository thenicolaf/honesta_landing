import { cn } from "@/shared/utils/cn";

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
