export function ProductFreeFrom({ freeFrom }: { freeFrom: string[] }) {
  if (freeFrom.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1">
      {freeFrom.map((item) => (
        <li key={item} className="font-body font-light text-2xs text-earth/55">
          ✕ {item}
        </li>
      ))}
    </ul>
  );
}
