"use client";

import { cn } from "@/shared/utils/cn";
import { Card } from "../Card";
import { EmptyState } from "../EmptyState";
import { DataCardContext, useDataCard } from "./context";
import type { FieldDef } from "./types";

// ─── DataCard (root) ────────────────────────────────────────────────────────

interface DataCardProps {
  children: React.ReactNode;
  className?: string;
  /** Show dividers between fields. Defaults to true. */
  dividers?: boolean;
}

export function DataCard({ children, className, dividers = true }: DataCardProps) {
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
    <div className={cn("flex items-center justify-between gap-3 px-4 pt-4 pb-2", className)}>
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
    <div className={cn("flex flex-col px-4 py-2", className)}>
      {children}
    </div>
  );
}

// ─── DataCardField ──────────────────────────────────────────────────────────

interface DataCardFieldProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export function DataCardField({ children, label, className }: DataCardFieldProps) {
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

export function DataCardGrid<T>({ data, fields, className }: DataCardGridProps<T>) {
  return (
    <DataCardBody className={className}>
      {fields.map((field) => (
        <DataCardField key={field.key} label={field.label} className={field.className}>
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
    <div className={cn("grid grid-cols-1 gap-3", className)}>
      {children}
    </div>
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

export function DataCardEmpty({ icon, label, description, action, className }: DataCardEmptyProps) {
  return <EmptyState icon={icon} label={label} description={description} action={action} className={className} />;
}
