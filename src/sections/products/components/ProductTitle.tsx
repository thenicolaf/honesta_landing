export function ProductTitle({ title }: { title: string }) {
  return (
    <h3
      className="font-display font-semibold text-heading leading-tight"
      style={{ fontSize: "clamp(1.15rem, 2vw, 1.4rem)" }}
    >
      {title}
    </h3>
  );
}
