"use client";

import { CopyText } from "@/shared/ui";
import { shortId } from "@/shared/ui/Table";

export function CopyOrderId({ id }: { id: string }) {
  return (
    <CopyText
      text={id}
      className="font-bold uppercase tracking-widest text-2xs"
    >
      #{shortId(id)}
    </CopyText>
  );
}
