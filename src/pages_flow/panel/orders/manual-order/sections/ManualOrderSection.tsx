import { cn } from "@/shared/utils/cn";

interface ManualOrderSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function ManualOrderSection({
  title,
  children,
  className,
}: ManualOrderSectionProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-earth/8 bg-white-warm p-5 flex flex-col gap-4",
        className,
      )}
    >
      {title && (
        <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/40 pt-1">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
