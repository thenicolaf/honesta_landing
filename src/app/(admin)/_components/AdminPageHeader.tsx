export function AdminPageHeader({ title }: { title: string }) {
  return (
    <>
      <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-2">
        My Account
      </p>
      <h1
        className="font-display font-bold italic text-heading mb-6 leading-tight"
        style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
      >
        {title}
      </h1>
    </>
  );
}
