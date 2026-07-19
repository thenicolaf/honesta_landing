"use client";

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useSyncExternalStore,
  Children,
  cloneElement,
  isValidElement,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/utils/cn";
import { PopoverContext, usePopover } from "./context";

const POPOVER_MAX_H = 360;
const POPOVER_MIN_W = 320;
const VIEWPORT_PAD = 16;
const POPOVER_GAP = 6; // px between trigger and popover

// useSyncExternalStore helpers for SSR-safe mount detection (createPortal needs document.body)
const subscribeNoop = () => () => {};
const getMountedTrue = () => true;
const getMountedFalse = () => false;

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
      value={{ open, direction, triggerRef: rootRef, toggle, close }}
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
  const { open, direction, triggerRef } = usePopover();
  const contentRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  const isUp = direction.vertical === "up";
  const resolvedAlign = align === "auto" ? direction.horizontal : align;
  const yOffset = isUp ? 6 : -6;

  // SSR safety — createPortal needs document.body. Returns false on server,
  // true on client without an effect-driven setState (same pattern as Tooltip).
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getMountedTrue,
    getMountedFalse,
  );

  // Position the portaled popover against the trigger, in viewport (fixed) coords.
  // offsetWidth/Height ignore motion's `scale` transform so placement is exact
  // even during the enter animation.
  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!trigger || !content) return;

    const rect = trigger.getBoundingClientRect();
    const contentWidth = content.offsetWidth;
    const contentHeight = content.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = isUp
      ? rect.top - contentHeight - POPOVER_GAP
      : rect.bottom + POPOVER_GAP;

    let left = resolvedAlign === "right" ? rect.right - contentWidth : rect.left;

    // Clamp to viewport
    const maxLeft = vw - VIEWPORT_PAD - contentWidth;
    if (left > maxLeft) left = maxLeft;
    if (left < VIEWPORT_PAD) left = VIEWPORT_PAD;

    const maxTop = vh - VIEWPORT_PAD - contentHeight;
    if (top > maxTop) top = maxTop;
    if (top < VIEWPORT_PAD) top = VIEWPORT_PAD;

    setCoords({ top, left });
  }, [isUp, resolvedAlign, triggerRef]);

  useLayoutEffect(() => {
    if (!open) return;
    // Measure-then-position is the canonical use case for useLayoutEffect:
    // read DOM size + trigger position and commit coords before paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- DOM measurement requires setState in layout effect
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  if (!mounted) return null;

  return createPortal(
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
          style={{
            position: "fixed",
            top: coords?.top ?? 0,
            left: coords?.left ?? 0,
            visibility: coords ? "visible" : "hidden",
          }}
          className={cn(
            "z-50",
            width,
            "max-w-[calc(100vw-2rem)]",
            "rounded-[16px] border border-earth/8 bg-white-warm shadow-lg shadow-earth/8",
            "overflow-hidden",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
