"use client";

import {
  Button,
  RichText,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/ui";
import { IconInfo } from "@/shared/icons";

interface NoteButtonProps {
  note?: string;
}

export function NoteButton({ note }: NoteButtonProps) {
  if (!note) return null;

  return (
    <Tooltip side="top">
      <TooltipTrigger asChild>
        <Button
          as="button"
          type="button"
          variant="text"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className="rounded-full bg-earth/30 p-1.5! text-white-warm! backdrop-blur-sm hover:bg-earth/50 transition-all duration-300"
          aria-label="Show note"
        >
          <IconInfo className="w-3.5 h-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="whitespace-normal min-w-32 w-max max-w-72 text-left leading-snug">
        <RichText html={note} />
      </TooltipContent>
    </Tooltip>
  );
}
