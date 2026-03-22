"use client";

import { cn } from "@/shared/utils/cn";
import { IconChevron } from "@/shared/icons";
import { Button } from "../Button";
import { Card } from "../Card";
import { EmptyState } from "../EmptyState";
import { DataCardContext, useDataCard } from "./context";
import type { PaginationState } from "../Table/hooks";
import type { FieldDef } from "./types";

// ─── DataCard (root) ────────────────────────────────────────────────────────

interface DataCardProps {
  children: React.ReactNode;
  className?: string;
  /** Show dividers between fields. Defaults to true. */
  dividers?: boolean;
}

export function DataCard({
  children,
  className,
  dividers = true,
}: DataCardProps) {
  return (
    <DataCardContext.Provider value={{ dividers }}>
      <Card variant="default" padding="none" className={className}>
        {children}
      </Card>
    </DataCardContext.Provider>
  );
}

// ─── DataCardHeader ─────────────────────────────────────────────────────────

interface DataCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DataCardHeader({ children, className }: DataCardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-earth/8 gap-3 px-4 pt-4 pb-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── DataCardBody ───────────────────────────────────────────────────────────

interface DataCardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function DataCardBody({ children, className }: DataCardBodyProps) {
  return (
    <div className={cn("flex flex-col px-4 py-2", className)}>{children}</div>
  );
}

// ─── DataCardField ──────────────────────────────────────────────────────────

interface DataCardFieldProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export function DataCardField({
  children,
  label,
  className,
}: DataCardFieldProps) {
  const { dividers } = useDataCard();

  return (
    <div
      className={cn(
        "py-2",
        dividers && "border-t border-earth/6 first:border-t-0",
        className,
      )}
    >
      {label && (
        <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/50 mb-1">
          {label}
        </p>
      )}
      <div className="font-body text-sm text-earth">{children}</div>
    </div>
  );
}

// ─── DataCardFooter ─────────────────────────────────────────────────────────

interface DataCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DataCardFooter({ children, className }: DataCardFooterProps) {
  return (
    <div className={cn("border-t border-earth/6 px-4 py-3", className)}>
      {children}
    </div>
  );
}

// ─── DataCardGrid (declarative helper) ──────────────────────────────────────

interface DataCardGridProps<T> {
  data: T;
  fields: FieldDef<T>[];
  className?: string;
}

export function DataCardGrid<T>({
  data,
  fields,
  className,
}: DataCardGridProps<T>) {
  return (
    <DataCardBody className={className}>
      {fields.map((field) => (
        <DataCardField
          key={field.key}
          label={field.label}
          className={field.className}
        >
          {field.cell(data)}
        </DataCardField>
      ))}
    </DataCardBody>
  );
}

// ─── DataCardList ───────────────────────────────────────────────────────────

interface DataCardListProps {
  children: React.ReactNode;
  className?: string;
}

export function DataCardList({ children, className }: DataCardListProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3", className)}>{children}</div>
  );
}

// ─── DataCardEmpty ──────────────────────────────────────────────────────────

interface DataCardEmptyProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  action?: {
    label: string;
    href: string;
    variant?: "primary" | "secondary" | "outline" | "text";
    size?: "sm" | "md" | "lg";
  };
  className?: string;
}

export function DataCardEmpty({
  icon,
  label,
  description,
  action,
  className,
}: DataCardEmptyProps) {
  return (
    <EmptyState
      icon={icon}
      label={label}
      description={description}
      action={action}
      className={className}
    />
  );
}

// ─── DataCardPagination ────────────────────────────────────────────────────

interface DataCardPaginationProps {
  pagination: PaginationState;
  className?: string;
}

export function DataCardPagination({
  pagination,
  className,
}: DataCardPaginationProps) {
  const { page, pageCount, total, pageSize, canPrev, canNext } = pagination;

  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 mt-3 px-1",
        className,
      )}
    >
      <span className="font-body text-2xs text-earth/50">
        {from}–{to} of {total}
      </span>

      <div className="flex items-center gap-3">
        <span className="font-body text-2xs text-earth/50">
          {page} / {pageCount}
        </span>

        <div className="flex items-center gap-1">
          <Button
            as="button"
            type="button"
            variant="outline"
            size="icon"
            disabled={!canPrev}
            onClick={pagination.prevPage}
            aria-label="Previous page"
          >
            <IconChevron className="w-3.5 h-3.5 rotate-90" />
          </Button>
          <Button
            as="button"
            type="button"
            variant="outline"
            size="icon"
            disabled={!canNext}
            onClick={pagination.nextPage}
            aria-label="Next page"
          >
            <IconChevron className="w-3.5 h-3.5 -rotate-90" />
          </Button>
        </div>
      </div>
    </div>
  );
}
