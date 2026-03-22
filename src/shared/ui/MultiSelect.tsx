"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconChevron, IconPlus, IconX } from "@/shared/icons";
import { cn } from "@/shared/utils/cn";
import { Tag } from "./Tag";

const DROPDOWN_MAX_H = 240;

// ─── Context ──────────────────────────────────────────────────────────────────

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectContextValue {
  open: boolean;
  values: string[];
  options: MultiSelectOption[];
  clearable: boolean;
  search: string;
  direction: "down" | "up";
  listRef: React.RefObject<HTMLUListElement | null>;
  scrollTopRef: React.RefObject<number>;
  toggle: () => void;
  close: () => void;
  toggleItem: (value: string) => void;
  removeItem: (value: string) => void;
  clearAll: () => void;
  setSearch: (v: string) => void;
}

const MultiSelectContext = createContext<MultiSelectContextValue | null>(null);

export function useMultiSelect() {
  const ctx = useContext(MultiSelectContext);
  if (!ctx) throw new Error("useMultiSelect must be used within <MultiSelect>");
  return ctx;
}

// ─── MultiSelect ──────────────────────────────────────────────────────────────

interface MultiSelectProps {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string[];
  value?: string[];
  options?: MultiSelectOption[];
  clearable?: boolean;
  onValueChange?: (value: string[]) => void;
}

export function MultiSelect({
  children,
  className,
  defaultValue = [],
  value: controlledValue,
  options = [],
  clearable = false,
  onValueChange,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState<"down" | "up">("down");
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const scrollTopRef = useRef(0);

  const values = controlledValue ?? internalValue;

  const close = () => {
    setOpen(false);
    setSearch("");
  };

  const toggle = () => {
    if (!open && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setDirection(
        spaceBelow >= DROPDOWN_MAX_H || spaceBelow >= spaceAbove ? "down" : "up",
      );
    }
    if (open) {
      close();
    } else {
      setOpen(true);
    }
  };

  const toggleItem = (v: string) => {
    const next = values.includes(v)
      ? values.filter((x) => x !== v)
      : [...values, v];
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  const removeItem = (v: string) => {
    const next = values.filter((x) => x !== v);
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  const clearAll = () => {
    if (controlledValue === undefined) setInternalValue([]);
    onValueChange?.([]);
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
    <MultiSelectContext.Provider
      value={{
        open,
        values,
        options,
        clearable,
        search,
        direction,
        listRef,
        scrollTopRef,
        toggle,
        close,
        toggleItem,
        removeItem,
        clearAll,
        setSearch,
      }}
    >
      <div ref={rootRef} className={cn("relative block", className)}>
        {children}
      </div>
    </MultiSelectContext.Provider>
  );
}

// ─── MultiSelectTrigger ───────────────────────────────────────────────────────

interface MultiSelectTriggerProps {
  placeholder?: string;
  className?: string;
  renderTag?: (value: string, onRemove: () => void) => React.ReactNode;
}

export function MultiSelectTrigger({
  placeholder = "Select...",
  className,
  renderTag,
}: MultiSelectTriggerProps) {
  const { open, values, options, clearable, toggle, removeItem, clearAll } =
    useMultiSelect();
  const hasValues = values.length > 0;
  const showClear = clearable && hasValues;

  const getLabel = (v: string) =>
    options.find((o) => o.value === v)?.label ?? v;

  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      onClick={toggle}
      className={cn(
        "flex w-full flex-wrap items-center gap-1.5 rounded-xl text-left",
        "border border-earth/15 bg-white-warm px-3 py-2",
        "font-body text-sm text-earth transition-colors duration-200",
        "cursor-pointer select-none",
        "hover:border-earth/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40",
        open && "border-earth/35",
        className,
      )}
    >
      <span className="flex flex-1 flex-wrap items-center gap-1.5 min-w-0">
        {hasValues ? (
          values.map((v) =>
            renderTag ? (
              renderTag(v, () => removeItem(v))
            ) : (
              <Tag key={v} onRemove={() => removeItem(v)}>
                {getLabel(v)}
              </Tag>
            ),
          )
        ) : (
          <span className="text-earth/40 py-0.5">{placeholder}</span>
        )}
      </span>

      <span className="shrink-0 inline-flex items-center gap-1 ml-1 self-start mt-0.5">
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
                aria-label="Clear all"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
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

// ─── MultiSelectContent ───────────────────────────────────────────────────────

interface MultiSelectContentProps {
  children: React.ReactNode | ((options: MultiSelectOption[]) => React.ReactNode);
  className?: string;
  searchPlaceholder?: string;
}

export function MultiSelectContent({
  children,
  className,
  searchPlaceholder = "Search...",
}: MultiSelectContentProps) {
  const { open, values, options, direction, search, setSearch, listRef, scrollTopRef } =
    useMultiSelect();

  const sortedOptions = [...options].sort((a, b) => {
    const aSelected = values.includes(a.value) ? 0 : 1;
    const bSelected = values.includes(b.value) ? 0 : 1;
    return aSelected - bSelected;
  });

  const resolved = typeof children === "function" ? children(sortedOptions) : children;
  const searchRef = useRef<HTMLInputElement>(null);

  // Restore scroll position after re-render (saved by MultiSelectItem before toggleItem)
  useLayoutEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = scrollTopRef.current;
    }
  }, [values, listRef, scrollTopRef]);

  const isUp = direction === "up";
  const yOffset = isUp ? 6 : -6;

  // Auto-focus search on open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: yOffset, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: yOffset, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={cn(
            "absolute left-0 right-0 z-50",
            isUp ? "bottom-full mb-1.5" : "top-full mt-1.5",
            "rounded-xl border border-earth/12 bg-white-warm shadow-lg shadow-earth/8",
            "overflow-hidden",
            className,
          )}
        >
          {/* Search */}
          <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-2 border-b border-earth/8">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 min-w-0 bg-transparent outline-none font-body text-sm text-earth placeholder:text-earth/35 py-0.5"
            />
            <AnimatePresence initial={false}>
              {search && (
                <motion.span
                  key="clear-search"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex"
                >
                  <span
                    role="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    className="p-0.5 rounded-full text-earth/35 hover:text-earth/70 hover:bg-earth/8 transition-colors duration-150 cursor-pointer"
                  >
                    <IconX className="w-3.5 h-3.5" />
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Items */}
          <motion.ul
            ref={listRef}
            role="listbox"
            aria-multiselectable="true"
            layoutScroll
            className="py-1.5 max-h-52 overflow-y-auto overscroll-contain"
          >
            {resolved}
          </motion.ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── MultiSelectItem ──────────────────────────────────────────────────────────

interface MultiSelectItemProps {
  children: React.ReactNode;
  value: string;
  searchValue?: string;
  className?: string;
}

export function MultiSelectItem({
  children,
  value,
  searchValue,
  className,
}: MultiSelectItemProps) {
  const { values, search, toggleItem, listRef, scrollTopRef } = useMultiSelect();
  const isSelected = values.includes(value);

  const matchTarget = (searchValue ?? value).toLowerCase();
  if (search && !matchTarget.includes(search.toLowerCase())) return null;

  const handleClick = () => {
    // Capture scroll position BEFORE state update triggers re-render
    if (listRef.current) {
      scrollTopRef.current = listRef.current.scrollTop;
    }
    toggleItem(value);
  };

  return (
    <motion.li
      layout
      layoutId={`multiselect-item-${value}`}
      transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
      role="option"
      aria-selected={isSelected}
      onClick={handleClick}
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
      <AnimatePresence initial={false}>
        {isSelected && (
          <motion.span
            key="dot"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.15 }}
            className="shrink-0 w-1.5 h-1.5 rounded-full bg-orange"
          />
        )}
      </AnimatePresence>
    </motion.li>
  );
}

// ─── MultiSelectEmpty ─────────────────────────────────────────────────────────

export function MultiSelectEmpty({
  className,
  searchValues,
}: {
  className?: string;
  searchValues?: Map<string, string>;
}) {
  const { options, search } = useMultiSelect();

  const hasVisible = search
    ? options.some((o) => {
        const target = searchValues?.get(o.value) ?? o.label;
        return target.toLowerCase().includes(search.toLowerCase());
      })
    : options.length > 0;

  if (hasVisible) return null;

  return (
    <li
      className={cn(
        "px-4 py-3 font-body text-sm text-earth/40 text-center",
        className,
      )}
    >
      Nothing found
    </li>
  );
}

// ─── MultiSelectSeparator ─────────────────────────────────────────────────────

export function MultiSelectSeparator({ className }: { className?: string }) {
  return (
    <li role="separator" className={cn("my-1.5 h-px bg-earth/8", className)} />
  );
}

// ─── MultiSelectGroup ─────────────────────────────────────────────────────────

interface MultiSelectGroupProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export function MultiSelectGroup({
  children,
  label,
  className,
}: MultiSelectGroupProps) {
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

// ─── MultiSelectCreate ───────────────────────────────────────────────────────

interface MultiSelectCreateProps {
  className?: string;
  onCreate: (label: string) => Promise<MultiSelectOption | null>;
}

export function MultiSelectCreate({
  className,
  onCreate,
}: MultiSelectCreateProps) {
  const { search, options, setSearch } = useMultiSelect();
  const [creating, setCreating] = useState(false);

  const trimmed = search.trim();
  if (!trimmed) return null;

  const exists = options.some(
    (o) => o.label.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exists) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCreating(true);
    try {
      const result = await onCreate(trimmed);
      if (result) setSearch("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <li
      role="option"
      aria-selected={false}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5",
        "font-body text-sm cursor-pointer select-none",
        "text-orange hover:bg-earth/4 transition-colors duration-150",
        creating && "opacity-50 pointer-events-none",
        className,
      )}
    >
      <IconPlus className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">
        Create &ldquo;{trimmed}&rdquo;
      </span>
    </li>
  );
}

// ─── MultiSelectDelete ───────────────────────────────────────────────────────

interface MultiSelectDeleteProps {
  value: string;
  deleting: boolean;
  className?: string;
  onDelete: (value: string) => Promise<void>;
}

export function MultiSelectDelete({
  value,
  deleting,
  className,
  onDelete,
}: MultiSelectDeleteProps) {
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onDelete(value);
  };

  return (
    <span
      role="button"
      aria-label="Delete option"
      onClick={handleClick}
      className={cn(
        "shrink-0 p-0.5 rounded-full transition-colors duration-150",
        "text-earth/25 hover:text-red-500 hover:bg-red-50",
        deleting && "opacity-50 pointer-events-none",
        className,
      )}
    >
      <IconX className="w-3 h-3" />
    </span>
  );
}
