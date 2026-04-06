export function ProductIngredients({ ingredients }: { ingredients: string[] }) {
  if (ingredients.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1">
      {ingredients.map((item) => (
        <li
          key={item}
          className="flex items-center gap-1 font-body font-light text-2xs text-earth/60"
        >
          <span className="w-1 h-1 rounded-full bg-earth/40 inline-block shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}
