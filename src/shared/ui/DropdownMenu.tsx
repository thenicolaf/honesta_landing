"use client";

import {
  createContext,
  useContext,
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

const DROPDOWN_MAX_H = 240;
const DROPDOWN_GAP = 6; // px between trigger and menu
const VIEWPORT_PAD = 8;

// useSyncExternalStore helpers for SSR-safe mount detection (createPortal needs document.body)
const subscribeNoop = () => () => {};
const getMountedTrue = () => true;
const getMountedFalse = () => false;

// ─── Context ──────────────────────────────────────────────────────────────────

interface DropdownMenuContextValue {
  open: boolean;
  direction: "down" | "up";
  triggerRef: React.RefObject<HTMLDivElement | null>;
  toggle: () => void;
  close: () => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(
  null,
);

export function useDropdownMenu() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx)
    throw new Error("useDropdownMenu must be used within <DropdownMenu>");
  return ctx;
}

// ─── DropdownMenu ─────────────────────────────────────────────────────────────

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
  /** Controlled open state */
  open?: boolean;
  /** Called when open state should change (controlled mode) */
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({
  children,
  className,
  open: controlledOpen,
  onOpenChange,
}: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const rootRef = useRef<HTMLDivElement>(null);

  const open = controlledOpen ?? internalOpen;

  const setOpen = (next: boolean) => {
    if (next && !open && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setDirection(
        spaceBelow >= DROPDOWN_MAX_H || spaceBelow >= spaceAbove
          ? "down"
          : "up",
      );
    }
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const close = () => setOpen(false);

  const toggle = () => setOpen(!open);

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
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <DropdownMenuContext.Provider
      value={{ open, direction, triggerRef: rootRef, toggle, close }}
    >
      <div ref={rootRef} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

// ─── DropdownMenuTrigger ──────────────────────────────────────────────────────

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
  /** Stop event propagation on click (useful inside Link wrappers) */
  stopPropagation?: boolean;
  /** Render child element as trigger instead of wrapping in a button */
  asChild?: boolean;
}

export function DropdownMenuTrigger({
  children,
  className,
  stopPropagation = false,
  asChild = false,
}: DropdownMenuTriggerProps) {
  const { open, toggle } = useDropdownMenu();

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
      "aria-haspopup": "menu",
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
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={handleClick}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </button>
  );
}

// ─── DropdownMenuContent ──────────────────────────────────────────────────────

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right";
  /** Stretch the menu to the trigger's width (e.g. autocomplete inputs). */
  matchTriggerWidth?: boolean;
}

export function DropdownMenuContent({
  children,
  className,
  align = "left",
  matchTriggerWidth = false,
}: DropdownMenuContentProps) {
  const { open, direction, triggerRef } = useDropdownMenu();
  const contentRef = useRef<HTMLUListElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width?: number;
  } | null>(null);

  const isUp = direction === "up";
  const yOffset = isUp ? 6 : -6;

  // SSR safety — createPortal needs document.body (same pattern as Tooltip).
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getMountedTrue,
    getMountedFalse,
  );

  // Position the portaled menu against the trigger, in viewport (fixed) coords.
  // offsetWidth/Height ignore motion's `scale` transform so placement is exact.
  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!trigger || !content) return;

    const rect = trigger.getBoundingClientRect();
    const contentWidth = matchTriggerWidth ? rect.width : content.offsetWidth;
    const contentHeight = content.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = isUp
      ? rect.top - contentHeight - DROPDOWN_GAP
      : rect.bottom + DROPDOWN_GAP;

    let left = align === "right" ? rect.right - contentWidth : rect.left;

    // Clamp to viewport
    const maxLeft = vw - VIEWPORT_PAD - contentWidth;
    if (left > maxLeft) left = maxLeft;
    if (left < VIEWPORT_PAD) left = VIEWPORT_PAD;

    const maxTop = vh - VIEWPORT_PAD - contentHeight;
    if (top > maxTop) top = maxTop;
    if (top < VIEWPORT_PAD) top = VIEWPORT_PAD;

    setCoords({ top, left, width: matchTriggerWidth ? rect.width : undefined });
  }, [isUp, align, matchTriggerWidth, triggerRef]);

  useLayoutEffect(() => {
    if (!open) return;
    // Measure-then-position: read DOM size + trigger position, commit before paint.
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
        <motion.ul
          ref={contentRef}
          role="menu"
          initial={{ opacity: 0, y: yOffset, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: yOffset, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          style={{
            position: "fixed",
            top: coords?.top ?? 0,
            left: coords?.left ?? 0,
            width: coords?.width,
            visibility: coords ? "visible" : "hidden",
          }}
          className={cn(
            "z-50 min-w-40 max-w-[calc(100vw-1rem)]",
            "rounded-xl border border-earth/12 bg-white-warm shadow-lg shadow-earth/8",
            "overflow-y-auto overscroll-contain",
            className,
          )}
        >
          {children}
        </motion.ul>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ─── DropdownMenuItem ─────────────────────────────────────────────────────────

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  asChild?: boolean;
  className?: string;
}

export function DropdownMenuItem({
  children,
  onClick,
  disabled = false,
  destructive = false,
  asChild = false,
  className,
}: DropdownMenuItemProps) {
  const { close } = useDropdownMenu();

  const itemClassName = cn(
    "flex items-center gap-2.5 px-4 py-2.5",
    "font-body text-sm cursor-pointer select-none",
    "transition-colors duration-150",
    disabled
      ? "text-earth/30 cursor-not-allowed"
      : destructive
        ? "text-red-600 hover:bg-red-50"
        : "text-earth/70 hover:bg-earth/4 hover:text-earth",
    className,
  );

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    close();
  };

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) return null;
    const childProps = child.props as {
      className?: string;
      onClick?: (e: React.MouseEvent) => void;
    };
    return (
      <li role="presentation">
        {cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          role: "menuitem",
          "aria-disabled": disabled,
          onClick: (e: React.MouseEvent) => {
            if (disabled) return;
            childProps.onClick?.(e);
            close();
          },
          className: cn(itemClassName, childProps.className),
        })}
      </li>
    );
  }

  return (
    <li
      role="menuitem"
      aria-disabled={disabled}
      onClick={handleClick}
      className={itemClassName}
    >
      {children}
    </li>
  );
}

// ─── DropdownMenuSeparator ────────────────────────────────────────────────────

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <li role="separator" className={cn("h-px bg-earth/8", className)} />;
}

// ─── DropdownMenuLabel ────────────────────────────────────────────────────────

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenuLabel({
  children,
  className,
}: DropdownMenuLabelProps) {
  return (
    <li
      role="presentation"
      className={cn(
        "block px-4 py-2  font-body font-semibold uppercase tracking-[0.12em] text-xs text-earth/35",
        className,
      )}
    >
      {children}
    </li>
  );
}
