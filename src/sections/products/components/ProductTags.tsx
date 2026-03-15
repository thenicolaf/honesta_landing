export function ProductTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1">
      {tags.map((tag) => (
        <li
          key={tag}
          className="flex items-center gap-1 font-body font-light text-2xs text-moss"
        >
          <span className="w-1 h-1 rounded-full bg-moss inline-block shrink-0" />
          {tag}
        </li>
      ))}
    </ul>
  );
}
