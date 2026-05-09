import { Card } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";

export function StatCard({
  icon,
  label,
  value,
  sub,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card padding="sm" className={cn("min-[30rem]:p-6", className)}>
      <div className="flex items-start justify-between gap-2 min-[30rem]:gap-3">
        <div className="flex flex-col gap-0.5 min-[30rem]:gap-1 min-w-0">
          <p className="font-body font-semibold uppercase tracking-[0.12em] text-xs min-[30rem]:text-2xs text-earth/50 truncate">
            {label}
          </p>
          <p className="font-body font-bold text-base min-[30rem]:text-2xl text-earth leading-tight wrap-break-word">
            {value}
          </p>
          {sub && <div className="mt-0.5 min-[30rem]:mt-1">{sub}</div>}
        </div>
        <div className="rounded-lg min-[30rem]:rounded-xl bg-sand/60 p-1.5 min-[30rem]:p-2.5 text-earth/40 shrink-0 [&>svg]:w-4 [&>svg]:h-4 min-[30rem]:[&>svg]:w-5 min-[30rem]:[&>svg]:h-5">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/40 mb-3",
        className,
      )}
    >
      {children}
    </h3>
  );
}
