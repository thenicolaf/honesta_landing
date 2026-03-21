import { cn } from "@/shared/utils/cn";

interface ThumbnailProps {
  src: string;
  alt: string;
  selected?: boolean;
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function Thumbnail({
  src,
  alt,
  selected,
  showLabel = true,
  className,
  onClick,
  children,
}: ThumbnailProps) {
  return (
    <div className={cn("relative group", className)}>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onClick={onClick}
          className={cn(
            "w-30 h-30 rounded-lg object-cover border-2 transition-colors",
            onClick && "cursor-pointer",
            selected
              ? "border-orange"
              : "border-parchment hover:border-orange/50",
          )}
          draggable={false}
        />
        {children}
      </div>

      {showLabel && (
        <span className="block mt-1 text-2xs text-earth/40 truncate max-w-30 text-center">
          {alt}
        </span>
      )}
    </div>
  );
}
