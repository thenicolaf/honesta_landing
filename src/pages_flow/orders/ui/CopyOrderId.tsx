"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/shared/ui";
import { shortId } from "@/shared/ui/Table";

export function CopyOrderId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button
      as="button"
      type="button"
      variant="text"
      size="sm"
      onClick={handleCopy}
      className="relative font-bold uppercase tracking-widest text-2xs overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1.5 text-moss"
          >
            <Check className="w-3 h-3" strokeWidth={2.5} />
            Copied!
          </motion.span>
        ) : (
          <motion.span
            key="id"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1.5"
          >
            #{shortId(id)}
            <Copy className="w-3 h-3 text-earth/40" strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
