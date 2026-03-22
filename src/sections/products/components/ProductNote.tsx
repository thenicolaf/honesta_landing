"use client";

import { useRef, useState, useEffect } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/ui";

interface ProductNoteProps {
  note?: string;
  /** Truncate to 2 lines with tooltip for overflow (used in cards) */
  truncate?: boolean;
}

export function ProductNote({ note, truncate }: ProductNoteProps) {
  if (!note) return null;

  if (!truncate) {
    return (
      <blockquote className="border-l-2 border-orange/40 bg-sand/50 rounded-r-lg px-3 py-2 font-body text-sm text-earth/70 italic">
        {note}
      </blockquote>
    );
  }

  return <TruncatedNote note={note} />;
}

function TruncatedNote({ note }: { note: string }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) setIsClamped(el.scrollHeight > el.clientHeight);
  }, [note]);

  const blockquote = (
    <blockquote className="border-l-2 border-orange/40 bg-sand/50 rounded-r-lg px-3 py-2 font-body text-sm text-earth/70 italic">
      <span ref={textRef} className="line-clamp-2">
        {note}
      </span>
    </blockquote>
  );

  if (!isClamped) return blockquote;

  return (
    <Tooltip side="top" className="block">
      <TooltipTrigger asChild className="block text-left w-full">
        <blockquote
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
          className="border-l-2 border-orange/40 bg-sand/50 rounded-r-lg px-3 py-2 font-body text-sm text-earth/70 italic cursor-pointer"
        >
          <span ref={textRef} className="line-clamp-2">
            {note}
          </span>
        </blockquote>
      </TooltipTrigger>
      <TooltipContent className="whitespace-normal w-full left-0 translate-x-0! text-left">
        {note}
      </TooltipContent>
    </Tooltip>
  );
}
