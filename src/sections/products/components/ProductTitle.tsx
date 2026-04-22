export function ProductTitle({ title }: { title: string }) {
  return (
    <h3 className="font-display font-semibold text-heading leading-tight capitalize text-[clamp(1rem,4vw,1.15rem)] min-[520px]:text-[clamp(1.15rem,2vw,1.4rem)]">
      {title.toLowerCase()}
    </h3>
  );
}
