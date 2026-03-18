export function AuthHeader({ subtitle }: { subtitle: string }) {
  return (
    <div className="text-center mb-10">
      <h1 className="font-display font-bold italic text-heading text-[2rem] leading-tight mb-2">
        Honesta
      </h1>
      <p className="font-body font-light text-earth/60 text-sm">{subtitle}</p>
    </div>
  );
}
