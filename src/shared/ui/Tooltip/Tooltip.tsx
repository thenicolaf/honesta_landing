"use client";

import {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
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
      value={{ open, resolvedSide, show, hide, toggle }}
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
}

export function TooltipTrigger({
  children,
  className,
  asChild = false,
}: TooltipTriggerProps) {
  const { show, hide, toggle } = useTooltip();

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) return null;
    const childProps = child.props as {
      className?: string;
      onClick?: (e: React.MouseEvent) => void;
      onMouseEnter?: (e: React.MouseEvent) => void;
      onMouseLeave?: (e: React.MouseEvent) => void;
      onFocus?: (e: React.FocusEvent) => void;
      onBlur?: (e: React.FocusEvent) => void;
    };
    return cloneElement(child as React.ReactElement<Record<string, unknown>>, {
      onMouseEnter: (e: React.MouseEvent) => { childProps.onMouseEnter?.(e); show(); },
      onMouseLeave: (e: React.MouseEvent) => { childProps.onMouseLeave?.(e); hide(); },
      onFocus: (e: React.FocusEvent) => { childProps.onFocus?.(e); show(); },
      onBlur: (e: React.FocusEvent) => { childProps.onBlur?.(e); hide(); },
      onClick: (e: React.MouseEvent) => { childProps.onClick?.(e); toggle(); },
      className: cn(childProps.className, className),
    });
  }

  return (
    <span
      className={className}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={toggle}
    >
      {children}
    </span>
  );
}

// ─── TooltipContent ──────────────────────────────────────────────────────────

const OFFSET = 6;
const VIEWPORT_PAD = 8;

const basePositionStyles: Record<TooltipSide, string> = {
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
  const { open, hide, resolvedSide } = useTooltip();
  const contentRef = useRef<HTMLDivElement>(null);
  const offset = initialOffset[resolvedSide];
  const isHorizontalSide =
    resolvedSide === "top" || resolvedSide === "bottom";

  // Clamp to viewport after mount / resize — no state, direct DOM mutation.
  // Uses offsetWidth / offsetParent so measurements are NOT affected by
  // motion's `scale` transform in the enter animation.
  const clamp = useCallback(() => {
    const el = contentRef.current;
    const parent = el?.offsetParent as HTMLElement | null;
    if (!el || !parent || !isHorizontalSide) return;

    // Reset previous inline positioning so we measure from CSS baseline
    el.style.left = "";
    el.style.right = "";
    el.style.transform = "";

    const parentRect = parent.getBoundingClientRect();
    const width = el.offsetWidth;
    // CSS baseline: left:50% then -translate-x-1/2 → el's viewport left =
    // parentLeft + parent.width/2 - width/2. Compute without relying on
    // getBoundingClientRect (which reflects the animated scale).
    const baseLeft =
      parentRect.left + parent.offsetWidth / 2 - width / 2;
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
      el.style.transform = "none";
    }
  }, [isHorizontalSide]);

  useLayoutEffect(() => {
    if (!open) return;
    clamp();
    window.addEventListener("resize", clamp);
    window.addEventListener("scroll", clamp, true);
    return () => {
      window.removeEventListener("resize", clamp);
      window.removeEventListener("scroll", clamp, true);
    };
  }, [open, clamp]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    hide();
  };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          ref={contentRef}
          role="tooltip"
          onClick={handleClick}
          initial={{ opacity: 0, x: offset.x, y: offset.y, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: offset.x, y: offset.y, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn(
            "absolute z-50",
            basePositionStyles[resolvedSide],
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
