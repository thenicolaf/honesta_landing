"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useId,
  Children,
  cloneElement,
  isValidElement,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/utils/cn";

const DROPDOWN_MAX_H = 240;

// ─── Context ──────────────────────────────────────────────────────────────────

interface DropdownMenuContextValue {
  open: boolean;
  direction: "down" | "up";
  triggerId: string;
  menuId: string;
  toggle: () => void;
  close: () => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

export function useDropdownMenu() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error("useDropdownMenu must be used within <DropdownMenu>");
  return ctx;
}

// ─── DropdownMenu ─────────────────────────────────────────────────────────────

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenu({ children, className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const triggerId = `dropdown-trigger-${uid}`;
  const menuId = `dropdown-menu-${uid}`;

  const close = () => setOpen(false);

  const toggle = () => {
    if (!open && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setDirection(spaceBelow >= DROPDOWN_MAX_H || spaceBelow >= spaceAbove ? "down" : "up");
    }
    setOpen((v) => !v);
  };

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
      value={{ open, direction, triggerId, menuId, toggle, close }}
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
}

export function DropdownMenuTrigger({ children, className }: DropdownMenuTriggerProps) {
  const { open, toggle, triggerId, menuId } = useDropdownMenu();

  return (
    <button
      id={triggerId}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={menuId}
      onClick={toggle}
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
}

export function DropdownMenuContent({
  children,
  className,
  align = "left",
}: DropdownMenuContentProps) {
  const { open, direction, menuId, triggerId } = useDropdownMenu();

  const isUp = direction === "up";
  const yOffset = isUp ? 6 : -6;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.ul
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          initial={{ opacity: 0, y: yOffset, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: yOffset, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={cn(
            "absolute z-50 min-w-40",
            isUp ? "bottom-full mb-1.5" : "top-full mt-1.5",
            align === "right" ? "right-0" : "left-0",
            "rounded-xl border border-earth/12 bg-white-warm shadow-lg shadow-earth/8",
            "py-1.5 max-h-60 overflow-y-auto overscroll-contain",
            className,
          )}
        >
          {children}
        </motion.ul>
      )}
    </AnimatePresence>
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
    const childProps = child.props as { className?: string; onClick?: (e: React.MouseEvent) => void };
    return (
      <li role="presentation">
        {cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          role: "menuitem",
          "aria-disabled": disabled,
          onClick: (e: React.MouseEvent) => {
            if (disabled) { e.preventDefault(); return; }
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
  return (
    <li role="separator" className={cn("my-1.5 h-px bg-earth/8", className)} />
  );
}

// ─── DropdownMenuLabel ────────────────────────────────────────────────────────

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenuLabel({ children, className }: DropdownMenuLabelProps) {
  return (
    <li
      role="presentation"
      className={cn(
        "block px-4 pt-2 pb-1 font-body font-semibold uppercase tracking-[0.12em] text-xs text-earth/35",
        className,
      )}
    >
      {children}
    </li>
  );
}
