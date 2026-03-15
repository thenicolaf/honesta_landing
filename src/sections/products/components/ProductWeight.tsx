export function ProductWeight({ weight_g }: { weight_g?: number }) {
  if (weight_g == null) return null;
  return <p className="font-body text-2xs text-earth">{weight_g} g</p>;
}
