"use client";

import {
  useState,
  useRef,
  useId,
  useCallback,
  Children,
  cloneElement,
  isValidElement,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/utils/cn";
import { TooltipContext, useTooltip, type TooltipSide } from "./context";

const MIN_SPACE = 40;

function resolveSide(
  rect: DOMRect,
  preferred: TooltipSide,
): TooltipSide {
  const space = {
    top: rect.top,
    bottom: window.innerHeight - rect.bottom,
    left: rect.left,
    right: window.innerWidth - rect.right,
  };

  if (space[preferred] >= MIN_SPACE) return preferred;

  // Flip to opposite side on the same axis
  const opposite: Record<TooltipSide, TooltipSide> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  };

  return opposite[preferred];
}

// ─── Tooltip (root) ──────────────────────────────────────────────────────────

interface TooltipProps {
  children: React.ReactNode;
  className?: string;
  /** Preferred side to display tooltip */
  side?: TooltipSide;
  /** Delay in ms before showing tooltip */
  delay?: number;
}

export function Tooltip({
  children,
  className,
  side = "top",
  delay = 200,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [resolvedSide, setResolvedSide] = useState<TooltipSide>(side);
  const rootRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const uid = useId();
  const triggerId = `tooltip-trigger-${uid}`;
  const contentId = `tooltip-content-${uid}`;

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (rootRef.current) {
        setResolvedSide(resolveSide(rootRef.current.getBoundingClientRect(), side));
      }
      setOpen(true);
    }, delay);
  }, [delay, side]);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (open) {
      hide();
    } else {
      if (rootRef.current) {
        setResolvedSide(resolveSide(rootRef.current.getBoundingClientRect(), side));
      }
      setOpen(true);
    }
  }, [open, hide, side]);

  return (
    <TooltipContext.Provider
      value={{ open, resolvedSide, triggerId, contentId, show, hide, toggle }}
    >
      <div ref={rootRef} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

// ─── TooltipTrigger ──────────────────────────────────────────────────────────

interface TooltipTriggerProps {
  children: React.ReactNode;
  className?: string;
  /** Render child element as trigger instead of wrapping in a span */
  asChild?: boolean;
  /** Click handler (e.g. stopPropagation to prevent parent Link navigation) */
  onClick?: (e: React.MouseEvent) => void;
}

export function TooltipTrigger({
  children,
  className,
  asChild = false,
  onClick,
}: TooltipTriggerProps) {
  const { open, show, hide, toggle, triggerId, contentId } = useTooltip();

  const handleClick = (e: React.MouseEvent) => {
    onClick?.(e);
    toggle();
  };

  const handlers = {
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
    onClick: handleClick,
  };

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) return null;
    const childProps = child.props as { className?: string };
    return cloneElement(child as React.ReactElement<Record<string, unknown>>, {
      "aria-describedby": open ? contentId : undefined,
      ...handlers,
      className: cn(childProps.className, className),
    });
  }

  return (
    <span
      id={triggerId}
      aria-describedby={open ? contentId : undefined}
      className={className}
      {...handlers}
    >
      {children}
    </span>
  );
}

// ─── TooltipContent ──────────────────────────────────────────────────────────

const OFFSET = 6;

const positionStyles: Record<TooltipSide, string> = {
  top: "bottom-full mb-1.5 left-1/2 -translate-x-1/2",
  bottom: "top-full mt-1.5 left-1/2 -translate-x-1/2",
  left: "right-full mr-1.5 top-1/2 -translate-y-1/2",
  right: "left-full ml-1.5 top-1/2 -translate-y-1/2",
};

const initialOffset: Record<TooltipSide, { x: number; y: number }> = {
  top: { x: 0, y: OFFSET },
  bottom: { x: 0, y: -OFFSET },
  left: { x: OFFSET, y: 0 },
  right: { x: -OFFSET, y: 0 },
};

interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
}

export function TooltipContent({
  children,
  className,
}: TooltipContentProps) {
  const { open, hide, resolvedSide, contentId } = useTooltip();
  const offset = initialOffset[resolvedSide];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    hide();
  };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          id={contentId}
          role="tooltip"
          onClick={handleClick}
          initial={{ opacity: 0, x: offset.x, y: offset.y, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: offset.x, y: offset.y, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn(
            "absolute z-50",
            positionStyles[resolvedSide],
            "rounded-lg px-2.5 py-1.5 bg-earth text-white-warm text-2xs font-body whitespace-nowrap shadow-md",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
