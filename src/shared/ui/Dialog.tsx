"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  cloneElement,
  isValidElement,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/utils/cn";
import { IconX } from "@/shared/icons";
import { Button } from "./Button";

// ─── Context ──────────────────────────────────────────────────────────────────

interface DialogContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within <Dialog>");
  return ctx;
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dialog({
  children,
  open: controlledOpen,
  onOpenChange,
}: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const close = () => {
    if (isControlled) onOpenChange?.(false);
    else setInternalOpen(false);
  };

  const toggle = () => {
    if (isControlled) onOpenChange?.(!open);
    else setInternalOpen((v) => !v);
  };

  return (
    <DialogContext.Provider
      value={{ open, toggle, close }}
    >
      {children}
    </DialogContext.Provider>
  );
}

// ─── DialogTrigger ────────────────────────────────────────────────────────────

interface DialogTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export function DialogTrigger({
  children,
  className,
  asChild,
}: DialogTriggerProps) {
  const { toggle } = useDialog();

  if (asChild && isValidElement(children)) {
    return cloneElement(
      children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
      {
        onClick: toggle,
      },
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </button>
  );
}

// ─── DialogOverlay ────────────────────────────────────────────────────────────

export function DialogOverlay({ className }: { className?: string }) {
  const { close } = useDialog();
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "fixed inset-0 z-50 bg-earth/40 backdrop-blur-sm",
        className,
      )}
      onClick={close}
    />
  );
}

// ─── DialogContent ────────────────────────────────────────────────────────────

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
}

const sizeClasses: Record<NonNullable<DialogContentProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-3xl",
  full: "max-w-5xl",
};

export function DialogContent({
  children,
  className,
  size = "md",
  showCloseButton = true,
}: DialogContentProps) {
  const { open, close } = useDialog();
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, close]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Move focus into dialog on open
  useEffect(() => {
    if (!open) return;
    const el = contentRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable[0]?.focus();
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence initial={false}>
      {open && (
        <>
          <DialogOverlay />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              ref={contentRef}
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "relative w-full pointer-events-auto",
                sizeClasses[size],
                "rounded-2xl border border-earth/12 bg-white-warm shadow-xl shadow-earth/12",
                "p-6",
                className,
              )}
            >
              {showCloseButton && (
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="absolute top-4 right-4 z-10 p-1 rounded-lg text-earth/40 hover:text-earth hover:bg-earth/6 transition-colors cursor-pointer"
                >
                  <IconX width={16} height={16} aria-hidden="true" />
                </button>
              )}

              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ─── DialogClose ──────────────────────────────────────────────────────────────

interface DialogCloseProps {
  children?: React.ReactNode;
  className?: string;
}

export function DialogClose({ children, className }: DialogCloseProps) {
  const { close } = useDialog();
  return (
    <Button
      as="button"
      type="button"
      variant="outline"
      size="sm"
      onClick={close}
      className={className}
    >
      {children}
    </Button>
  );
}

// ─── DialogHeader ─────────────────────────────────────────────────────────────

export function DialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-col gap-1.5", className)}>
      {children}
    </div>
  );
}

// ─── DialogTitle ──────────────────────────────────────────────────────────────

export function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-display font-semibold text-xl text-heading",
        className,
      )}
    >
      {children}
    </h2>
  );
}

// ─── DialogDescription ────────────────────────────────────────────────────────

export function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn("font-body font-light text-sm text-earth/60", className)}
    >
      {children}
    </p>
  );
}

// ─── DialogFooter ─────────────────────────────────────────────────────────────

export function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-wrap items-center justify-end gap-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
