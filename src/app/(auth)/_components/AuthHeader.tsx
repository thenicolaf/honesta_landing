export function AuthHeader({ subtitle }: { subtitle: string }) {
  return (
    <div className="text-center mb-10">
      <h1 className="font-display font-semibold text-heading text-[1.75rem] leading-tight">
        {subtitle}
      </h1>
    </div>
  );
}
