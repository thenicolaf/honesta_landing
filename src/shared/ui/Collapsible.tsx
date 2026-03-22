"use client";

import { createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconChevron } from "@/shared/icons";
import { cn } from "@/shared/utils/cn";

// ─── Context ──────────────────────────────────────────────────────────────────

interface CollapsibleContextValue {
  open: boolean;
  toggle: () => void;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

export function useCollapsible() {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error("useCollapsible must be used within <Collapsible>");
  return ctx;
}

// ─── Collapsible ──────────────────────────────────────────────────────────────

interface CollapsibleProps {
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function Collapsible({ children, className, defaultOpen = false }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <CollapsibleContext.Provider value={{ open, toggle: () => setOpen((v) => !v) }}>
      <div className={cn(className)}>{children}</div>
    </CollapsibleContext.Provider>
  );
}

// ─── CollapsibleTrigger ───────────────────────────────────────────────────────

interface CollapsibleTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  children: React.ReactNode;
}

export function CollapsibleTrigger({ children, className, onClick, ...rest }: CollapsibleTriggerProps) {
  const { open, toggle } = useCollapsible();

  return (
    <button
      type="button"
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        toggle();
      }}
      aria-expanded={open}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </button>
  );
}

// ─── CollapsibleChevron ───────────────────────────────────────────────────────

interface CollapsibleChevronProps {
  className?: string;
}

export function CollapsibleChevron({ className }: CollapsibleChevronProps) {
  const { open } = useCollapsible();

  return (
    <motion.span
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="shrink-0 inline-flex"
    >
      <IconChevron className={cn("w-3.5 h-3.5", className)} />
    </motion.span>
  );
}

// ─── CollapsibleContent ───────────────────────────────────────────────────────

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleContent({ children, className }: CollapsibleContentProps) {
  const { open } = useCollapsible();

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
