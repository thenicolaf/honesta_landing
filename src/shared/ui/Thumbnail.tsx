import { cn } from "@/shared/utils/cn";

interface ThumbnailProps {
  src: string;
  alt: string;
  selected?: boolean;
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  /** Renders a <video> element instead of <img> so the first frame is shown. */
  kind?: "image" | "video";
}

export function Thumbnail({
  src,
  alt,
  selected,
  showLabel = true,
  className,
  onClick,
  children,
  kind = "image",
}: ThumbnailProps) {
  const mediaClassName = cn(
    "w-30 h-30 rounded-lg object-cover border-2 transition-colors bg-earth/5",
    onClick && "cursor-pointer",
    selected
      ? "border-orange"
      : "border-parchment hover:border-orange/50",
  );

  return (
    <div className={cn("relative group", className)}>
      <div className="relative">
        {kind === "video" ? (
          <video
            src={src}
            onClick={onClick}
            className={mediaClassName}
            preload="metadata"
            muted
            playsInline
            aria-label={alt}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            onClick={onClick}
            className={mediaClassName}
            draggable={false}
          />
        )}
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
