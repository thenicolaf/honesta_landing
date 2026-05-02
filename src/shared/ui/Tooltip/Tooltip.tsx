"use client";

import {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  useSyncExternalStore,
  Children,
  cloneElement,
  isValidElement,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/utils/cn";
import { TooltipContext, useTooltip, type TooltipSide } from "./context";

const MIN_SPACE = 40;
const OFFSET = 6;
const VIEWPORT_PAD = 8;

// useSyncExternalStore helpers for SSR-safe mount detection
const subscribeNoop = () => () => {};
const getMountedTrue = () => true;
const getMountedFalse = () => false;

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
  const triggerRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        setResolvedSide(
          resolveSide(triggerRef.current.getBoundingClientRect(), side),
        );
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
      if (triggerRef.current) {
        setResolvedSide(
          resolveSide(triggerRef.current.getBoundingClientRect(), side),
        );
      }
      setOpen(true);
    }
  }, [open, hide, side]);

  return (
    <TooltipContext.Provider
      value={{ open, resolvedSide, triggerRef, show, hide, toggle }}
    >
      <div className={cn("relative inline-block", className)}>{children}</div>
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
  const { show, hide, toggle, triggerRef } = useTooltip();

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
    },
    [triggerRef],
  );

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

    // eslint-disable-next-line react-hooks/refs -- ref callback is invoked by React, not read during render
    return cloneElement(child as React.ReactElement<Record<string, unknown>>, {
      ref: setRef,
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
      ref={setRef}
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
  const { open, hide, resolvedSide, triggerRef } = useTooltip();
  const contentRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const offset = initialOffset[resolvedSide];

  // SSR safety — createPortal needs document.body. useSyncExternalStore returns
  // false on server, true on client without an effect-driven setState.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getMountedTrue,
    getMountedFalse,
  );

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!trigger || !content) return;

    const triggerRect = trigger.getBoundingClientRect();
    // offsetWidth/Height ignore motion's `scale` transform during enter
    const contentWidth = content.offsetWidth;
    const contentHeight = content.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = 0;
    let left = 0;

    switch (resolvedSide) {
      case "top":
        top = triggerRect.top - contentHeight - OFFSET;
        left = triggerRect.left + triggerRect.width / 2 - contentWidth / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + OFFSET;
        left = triggerRect.left + triggerRect.width / 2 - contentWidth / 2;
        break;
      case "left":
        top = triggerRect.top + triggerRect.height / 2 - contentHeight / 2;
        left = triggerRect.left - contentWidth - OFFSET;
        break;
      case "right":
        top = triggerRect.top + triggerRect.height / 2 - contentHeight / 2;
        left = triggerRect.right + OFFSET;
        break;
    }

    // Clamp to viewport
    const maxLeft = vw - VIEWPORT_PAD - contentWidth;
    if (left > maxLeft) left = maxLeft;
    if (left < VIEWPORT_PAD) left = VIEWPORT_PAD;

    const maxTop = vh - VIEWPORT_PAD - contentHeight;
    if (top > maxTop) top = maxTop;
    if (top < VIEWPORT_PAD) top = VIEWPORT_PAD;

    setCoords({ top, left });
  }, [resolvedSide, triggerRef]);

  useLayoutEffect(() => {
    if (!open) return;
    // Measure-then-position is the canonical use case for useLayoutEffect:
    // we read DOM size + trigger position and commit coords before paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- DOM measurement requires setState in layout effect
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    hide();
  };

  if (!mounted) return null;

  return createPortal(
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
          style={{
            position: "fixed",
            top: coords?.top ?? 0,
            left: coords?.left ?? 0,
            visibility: coords ? "visible" : "hidden",
          }}
          className={cn(
            "z-50 rounded-lg px-2.5 py-1.5 bg-earth text-white-warm text-2xs font-body whitespace-nowrap shadow-md pointer-events-auto",
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
