interface ProductTaglineProps {
  tagline: string;
}

export function ProductTagline({ tagline }: ProductTaglineProps) {
  if (!tagline) return null;

  return (
    <p className="font-body font-light text-sm text-earth/60 italic leading-relaxed">
      {tagline}
    </p>
  );
}
