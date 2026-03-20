"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  Children,
  cloneElement,
  isValidElement,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/utils/cn";
import { PopoverContext, usePopover } from "./context";

const POPOVER_MAX_H = 360;
const VIEWPORT_PAD = 16;

// ─── Popover (root) ─────────────────────────────────────────────────────────

interface PopoverProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Popover({ children, className, id }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const stableId = id ?? uid;
  const triggerId = `popover-trigger-${stableId}`;
  const contentId = `popover-content-${stableId}`;

  const close = useCallback(() => setOpen(false), []);

  const toggle = useCallback(() => {
    if (!open && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setDirection(
        spaceBelow >= POPOVER_MAX_H || spaceBelow >= spaceAbove ? "down" : "up",
      );
    }
    setOpen((v) => !v);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, close]);

  return (
    <PopoverContext.Provider
      value={{ open, direction, triggerId, contentId, toggle, close }}
    >
      <div ref={rootRef} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

// ─── PopoverTrigger ─────────────────────────────────────────────────────────

interface PopoverTriggerProps {
  children: React.ReactNode;
  className?: string;
  /** Render child element as trigger instead of wrapping in a button */
  asChild?: boolean;
  /** Stop event propagation on click (useful inside Link wrappers) */
  stopPropagation?: boolean;
}

export function PopoverTrigger({
  children,
  className,
  asChild = false,
  stopPropagation = false,
}: PopoverTriggerProps) {
  const { open, toggle, triggerId, contentId } = usePopover();

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
      e.preventDefault();
    }
    toggle();
  };

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) return null;
    const childProps = child.props as {
      className?: string;
      onClick?: (e: React.MouseEvent) => void;
    };
    return cloneElement(child as React.ReactElement<Record<string, unknown>>, {
      "aria-haspopup": "dialog",
      "aria-expanded": open,
      "aria-controls": contentId,
      onClick: (e: React.MouseEvent) => {
        handleClick(e);
        childProps.onClick?.(e);
      },
      className: cn(childProps.className, className),
    });
  }

  return (
    <button
      id={triggerId}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={contentId}
      onClick={handleClick}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </button>
  );
}

// ─── PopoverContent ─────────────────────────────────────────────────────────

interface PopoverContentProps {
  children: React.ReactNode;
  /** Preferred alignment — auto-adjusted if content overflows viewport */
  align?: "left" | "right";
  /** Content width. Defaults to 320px (w-80). */
  width?: string;
  className?: string;
}

export function PopoverContent({
  children,
  align = "right",
  width = "w-80",
  className,
}: PopoverContentProps) {
  const { open, direction, contentId, triggerId } = usePopover();
  const contentRef = useRef<HTMLDivElement>(null);

  // Clamp to viewport after mount / resize — no state, direct DOM mutation
  const clamp = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    if (rect.left < VIEWPORT_PAD) {
      const parentRect = el.offsetParent?.getBoundingClientRect();
      if (parentRect) {
        const currentRight = parentRect.right - rect.right;
        const shift = VIEWPORT_PAD - rect.left;
        el.style.right = `${currentRight - shift}px`;
        el.classList.remove("right-0", "left-0");
      }
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(clamp);
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, [open, clamp]);

  const isUp = direction === "up";
  const yOffset = isUp ? 6 : -6;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          ref={contentRef}
          id={contentId}
          role="dialog"
          aria-labelledby={triggerId}
          initial={{ opacity: 0, y: yOffset, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: yOffset, scale: 0.97 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onMouseDown={(e) => e.stopPropagation()}
          className={cn(
            "absolute z-50",
            width,
            isUp ? "bottom-full mb-1.5" : "top-full mt-1.5",
            align === "right" ? "right-0" : "left-0",
            "rounded-[16px] border border-earth/8 bg-white-warm shadow-lg shadow-earth/8",
            "overflow-hidden",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
