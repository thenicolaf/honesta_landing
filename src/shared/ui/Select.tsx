"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useId,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconChevron, IconX } from "@/shared/icons";
import { cn } from "@/shared/utils/cn";

const DROPDOWN_MAX_H = 240; // max-h-60 = 240px

// ─── Context ──────────────────────────────────────────────────────────────────

interface SelectContextValue {
  open: boolean;
  value: string;
  clearable: boolean;
  direction: "down" | "up";
  triggerId: string;
  listboxId: string;
  toggle: () => void;
  close: () => void;
  select: (value: string) => void;
  clear: () => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

export function useSelect() {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error("useSelect must be used within <Select>");
  return ctx;
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string;
  value?: string;
  clearable?: boolean;
  onValueChange?: (value: string) => void;
}

export function Select({
  children,
  className,
  defaultValue = "",
  value: controlledValue,
  clearable = false,
  onValueChange,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const triggerId = `select-trigger-${uid}`;
  const listboxId = `select-listbox-${uid}`;

  const value = controlledValue ?? internalValue;

  const close = () => setOpen(false);

  const clear = () => {
    if (controlledValue === undefined) setInternalValue("");
    onValueChange?.("");
    close();
  };

  const toggle = () => {
    if (!open && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setDirection(spaceBelow >= DROPDOWN_MAX_H || spaceBelow >= spaceAbove ? "down" : "up");
    }
    setOpen((v) => !v);
  };

  const select = (v: string) => {
    if (controlledValue === undefined) setInternalValue(v);
    onValueChange?.(v);
    close();
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
    <SelectContext.Provider
      value={{ open, value, clearable, direction, triggerId, listboxId, toggle, close, select, clear }}
    >
      <div ref={rootRef} className={cn("relative block", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

// ─── SelectTrigger ────────────────────────────────────────────────────────────

interface SelectTriggerProps {
  children: React.ReactNode;
  placeholder?: string;
  className?: string;
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
  const { open, value, clearable, toggle, clear, triggerId, listboxId } = useSelect();
  const showClear = clearable && value !== "";

  return (
    <button
      id={triggerId}
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls={listboxId}
      onClick={toggle}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl",
        "border border-earth/15 bg-white-warm px-4 py-2.5",
        "font-body text-sm text-earth transition-colors duration-200",
        "cursor-pointer select-none",
        "hover:border-earth/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40",
        open && "border-earth/35",
        className,
      )}
    >
      {children}
      <span className="shrink-0 inline-flex items-center gap-1">
        <AnimatePresence initial={false}>
          {showClear && (
            <motion.span
              key="clear"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="inline-flex"
            >
              <span
                role="button"
                aria-label="Clear"
                onClick={(e) => { e.stopPropagation(); clear(); }}
                className="p-0.5 rounded-full text-earth/35 hover:text-earth/70 hover:bg-earth/8 transition-colors duration-150"
              >
                <IconX className="w-3.5 h-3.5" />
              </span>
            </motion.span>
          )}
        </AnimatePresence>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="inline-flex text-earth/50"
        >
          <IconChevron className="w-4 h-4" />
        </motion.span>
      </span>
    </button>
  );
}

// ─── SelectValue ──────────────────────────────────────────────────────────────

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export function SelectValue({
  placeholder = "Выберите...",
  className,
}: SelectValueProps) {
  const { value } = useSelect();

  return (
    <span
      className={cn(
        "truncate",
        value ? "text-earth" : "text-earth/40",
        className,
      )}
    >
      {value || placeholder}
    </span>
  );
}

// ─── SelectContent ────────────────────────────────────────────────────────────

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectContent({ children, className }: SelectContentProps) {
  const { open, direction, listboxId, triggerId } = useSelect();

  const isUp = direction === "up";
  const yOffset = isUp ? 6 : -6;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.ul
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
          initial={{ opacity: 0, y: yOffset, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: yOffset, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={cn(
            "absolute left-0 right-0 z-50",
            isUp ? "bottom-full mb-1.5" : "top-full mt-1.5",
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

// ─── SelectItem ───────────────────────────────────────────────────────────────

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export function SelectItem({ children, value, className }: SelectItemProps) {
  const { value: selected, select } = useSelect();
  const isSelected = selected === value;

  return (
    <li
      role="option"
      aria-selected={isSelected}
      onClick={() => select(value)}
      className={cn(
        "flex items-center justify-between gap-2 px-4 py-2.5",
        "font-body text-sm cursor-pointer select-none",
        "transition-colors duration-150",
        isSelected
          ? "bg-earth/6 text-earth font-medium"
          : "text-earth/70 hover:bg-earth/4 hover:text-earth",
        className,
      )}
    >
      {children}
      {isSelected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="shrink-0 w-1.5 h-1.5 rounded-full bg-orange"
        />
      )}
    </li>
  );
}

// ─── SelectSeparator ──────────────────────────────────────────────────────────

export function SelectSeparator({ className }: { className?: string }) {
  return (
    <li role="separator" className={cn("my-1.5 h-px bg-earth/8", className)} />
  );
}

// ─── SelectGroup ──────────────────────────────────────────────────────────────

interface SelectGroupProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export function SelectGroup({ children, label, className }: SelectGroupProps) {
  return (
    <li role="group" className={cn("", className)}>
      {label && (
        <span className="block px-4 pt-2 pb-1 font-body font-semibold uppercase tracking-[0.12em] text-xs text-earth/35">
          {label}
        </span>
      )}
      <ul>{children}</ul>
    </li>
  );
}
