export function AdminPageHeader({
  title,
  label = "My Account",
  actions,
}: {
  title: string;
  label?: string;
  actions?: React.ReactNode;
}) {
  return (
    <>
      <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-2">
        {label}
      </p>
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1
          className="font-display font-bold italic text-heading leading-tight"
          style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
        >
          {title}
        </h1>
        {actions}
      </div>
    </>
  );
}
