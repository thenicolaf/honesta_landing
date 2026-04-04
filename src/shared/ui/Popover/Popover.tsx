"use client";

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  Children,
  cloneElement,
  isValidElement,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/utils/cn";
import { PopoverContext, usePopover } from "./context";

const POPOVER_MAX_H = 360;
const POPOVER_MIN_W = 320;
const VIEWPORT_PAD = 16;

// ─── Popover (root) ─────────────────────────────────────────────────────────

interface PopoverProps {
  children: React.ReactNode;
  className?: string;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes (controlled mode) */
  onOpenChange?: (open: boolean) => void;
}

export function Popover({
  children,
  className,
  open: controlledOpen,
  onOpenChange,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [direction, setDirection] = useState<{ vertical: "down" | "up"; horizontal: "left" | "right" }>({ vertical: "down", horizontal: "left" });
  const rootRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange],
  );

  const close = useCallback(() => setOpen(false), [setOpen]);

  const toggle = useCallback(() => {
    if (!open && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Horizontal: prefer "left" (popover extends to the right from trigger's left edge),
      // fall back to "right" when there isn't enough space on the right.
      const spaceRight = window.innerWidth - rect.left;
      const spaceLeft = rect.right;
      setDirection({
        vertical: spaceBelow >= POPOVER_MAX_H || spaceBelow >= spaceAbove ? "down" : "up",
        horizontal: spaceRight >= POPOVER_MIN_W || spaceRight >= spaceLeft ? "left" : "right",
      });
    }
    setOpen(!open);
  }, [open, setOpen]);

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
      value={{ open, direction, toggle, close }}
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
  const { open, toggle } = usePopover();

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
      onClick: (e: React.MouseEvent) => {
        handleClick(e);
        childProps.onClick?.(e);
      },
      className: cn(childProps.className, className),
    });
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
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
  align?: "left" | "right" | "auto";
  /** Content width. Defaults to 320px (w-80). */
  width?: string;
  className?: string;
}

export function PopoverContent({
  children,
  align = "auto",
  width = "w-80",
  className,
}: PopoverContentProps) {
  const { open, direction } = usePopover();
  const contentRef = useRef<HTMLDivElement>(null);

  // Clamp to viewport after mount / resize — no state, direct DOM mutation.
  // Uses offsetWidth / offsetParent so measurements are NOT affected by motion's
  // `scale` transform in the enter animation — otherwise clamp would run with
  // scaled-down dimensions and miss overflow until the animation completes.
  const clamp = useCallback(() => {
    const el = contentRef.current;
    const parent = el?.offsetParent as HTMLElement | null;
    if (!el || !parent) return;

    // Reset previous inline positioning so we measure from CSS baseline
    el.style.left = "";
    el.style.right = "";

    const parentRect = parent.getBoundingClientRect();
    const width = el.offsetWidth;
    // Untransformed top-left of el in viewport coords
    const baseLeft = parentRect.left + el.offsetLeft;
    const baseRight = baseLeft + width;
    const vw = window.innerWidth;

    const overflowLeft = VIEWPORT_PAD - baseLeft;
    const overflowRight = baseRight - (vw - VIEWPORT_PAD);

    if (overflowLeft > 0 || overflowRight > 0) {
      let desiredLeft = baseLeft;
      if (overflowRight > 0) desiredLeft -= overflowRight;
      if (desiredLeft < VIEWPORT_PAD) desiredLeft = VIEWPORT_PAD;

      el.style.left = `${desiredLeft - parentRect.left}px`;
      el.style.right = "auto";
      el.classList.remove("right-0", "left-0");
    }
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    clamp();
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, [open, clamp]);

  const isUp = direction.vertical === "up";
  const resolvedAlign = align === "auto" ? direction.horizontal : align;
  const yOffset = isUp ? 6 : -6;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          ref={contentRef}
          role="dialog"
          initial={{ opacity: 0, y: yOffset, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: yOffset, scale: 0.97 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onMouseDown={(e) => e.stopPropagation()}
          className={cn(
            "absolute z-50",
            width,
            isUp ? "bottom-full mb-1.5" : "top-full mt-1.5",
            resolvedAlign === "right" ? "right-0" : "left-0",
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
