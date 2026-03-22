"use client";

import { useRef } from "react";
import { cn } from "@/shared/utils/cn";
import { IconChevron } from "@/shared/icons";
import { Button } from "../Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../DropdownMenu";
import { TableContext, useTable } from "./context";
import type { PaginationState } from "./hooks";
import type { SortState, SortDirection, ColumnDef } from "./types";

// ─── Table (root) ────────────────────────────────────────────────────────────

interface TableProps<K extends string = string> {
  children: React.ReactNode;
  className?: string;
  /** Applied to the scrollable wrapper — use for max-h-*, overflow tweaks, etc. */
  wrapperClassName?: string;
  sort?: SortState<K> | null;
  onSort?: (key: K) => void;
  /** Show dividers between rows. Defaults to true. */
  dividers?: boolean;
  /** Rendered outside the scroll container (used by DataTable for pagination). */
  footer?: React.ReactNode;
}

export function Table<K extends string = string>({
  children,
  className,
  wrapperClassName,
  sort = null,
  onSort,
  dividers = true,
  footer,
}: TableProps<K>) {
  const ctx = {
    sort,
    onSort: onSort ?? (() => {}),
    striped: dividers,
  };

  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <TableContext.Provider value={ctx}>
      <div
        className={cn(
          "w-full rounded-xl border border-earth/10 bg-white-warm",
          className,
        )}
      >
        <div
          ref={wrapperRef}
          className={cn("overflow-auto overscroll-contain rounded-t-xl", wrapperClassName)}
        >
          <table className="w-full border-separate border-spacing-0 text-left">{children}</table>
        </div>
        {footer}
      </div>
    </TableContext.Provider>
  );
}

// ─── TableHeader ─────────────────────────────────────────────────────────────

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead
      className={cn(
        "bg-white-warm sticky top-0 z-20 shadow-[inset_0_-1px_0_color-mix(in_srgb,var(--color-earth)_10%,transparent)]",
        className,
      )}
    >
      {children}
    </thead>
  );
}

// ─── TableHeaderRow ──────────────────────────────────────────────────────────

interface TableHeaderRowProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeaderRow({ children, className }: TableHeaderRowProps) {
  return <tr className={cn("", className)}>{children}</tr>;
}

// ─── TableHead ───────────────────────────────────────────────────────────────

interface TableHeadProps {
  children?: React.ReactNode;
  className?: string;
  /** Column key — required if sortable */
  sortKey?: string;
  sortable?: boolean;
}

function SortIndicator({ direction }: { direction?: SortDirection }) {
  return (
    <span className="inline-flex flex-col ml-1 -space-y-1">
      <IconChevron
        className={cn(
          "w-3 h-3 rotate-180 transition-colors duration-150",
          direction === "asc" ? "text-earth" : "text-earth/20",
        )}
      />
      <IconChevron
        className={cn(
          "w-3 h-3 transition-colors duration-150",
          direction === "desc" ? "text-earth" : "text-earth/20",
        )}
      />
    </span>
  );
}

export function TableHead({
  children,
  className,
  sortKey,
  sortable = false,
}: TableHeadProps) {
  const { sort, onSort } = useTable();
  const isActive = sortable && sortKey && sort?.key === sortKey;

  const handleClick = () => {
    if (sortable && sortKey) onSort(sortKey);
  };

  return (
    <th
      className={cn(
        "px-4 py-3 font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/50",
        "whitespace-nowrap",
        sortable && "cursor-pointer select-none hover:text-earth/80 transition-colors duration-150",
        className,
      )}
      onClick={sortable ? handleClick : undefined}
    >
      <span className="inline-flex items-center gap-0.5">
        {children}
        {sortable && (
          <SortIndicator direction={isActive ? sort!.direction : undefined} />
        )}
      </span>
    </th>
  );
}

// ─── TableBody ───────────────────────────────────────────────────────────────

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
  return (
    <tbody className={cn("", className)}>
      {children}
    </tbody>
  );
}

// ─── TableRow ────────────────────────────────────────────────────────────────

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      className={cn(
        "transition-colors duration-150",
        onClick && "cursor-pointer hover:bg-earth/3",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// ─── TableCell ───────────────────────────────────────────────────────────────

interface TableCellProps {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export function TableCell({ children, className, colSpan }: TableCellProps) {
  const { striped } = useTable();
  return (
    <td
      className={cn(
        "px-4 py-3 font-body text-sm text-earth",
        striped && "border-t border-earth/6",
        className,
      )}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}

// ─── TableEmpty ──────────────────────────────────────────────────────────────

interface TableEmptyProps {
  colSpan: number;
  icon?: React.ReactNode;
  label?: string;
  description?: string;
  className?: string;
}

export function TableEmpty({
  colSpan,
  icon,
  label = "No data",
  description,
  className,
}: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div
          className={cn(
            "flex flex-col items-center gap-3 py-16 text-center",
            className,
          )}
        >
          {icon}
          <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/35">
            {label}
          </p>
          {description && (
            <p className="font-body font-light text-sm text-earth/40 max-w-xs">
              {description}
            </p>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── TableCaption ────────────────────────────────────────────────────────────

interface TableCaptionProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCaption({ children, className }: TableCaptionProps) {
  return (
    <caption
      className={cn(
        "px-4 py-3 font-body font-light text-sm text-earth/50 text-left caption-bottom",
        className,
      )}
    >
      {children}
    </caption>
  );
}

// ─── TablePagination ─────────────────────────────────────────────────────────

interface TablePaginationProps {
  pagination: PaginationState;
  className?: string;
  pageSizeOptions?: number[];
}

export function TablePagination({
  pagination,
  className,
  pageSizeOptions = [10, 20, 50],
}: TablePaginationProps) {
  const { page, pageCount, total, pageSize, canPrev, canNext } = pagination;

  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-3",
        "border-t border-earth/10",
        className,
      )}
    >
      <span className="font-body text-2xs text-earth/50">
        {from}–{to} of {total}
      </span>

      <div className="flex items-center gap-3">
        {/* Page size */}
        <div className="flex items-center gap-1.5">
          <span className="font-body text-2xs text-earth/40">Rows</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-lg border border-earth/15 px-2 py-1 font-body text-2xs text-earth hover:border-earth/30 transition-colors duration-150">
              {pageSize}
              <IconChevron className="w-3 h-3 text-earth/40" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="right" className="min-w-0">
              {pageSizeOptions.map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => pagination.setPageSize(size)}
                  className={cn(
                    "justify-center",
                    size === pageSize && "font-semibold text-orange",
                  )}
                >
                  {size}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Page indicator */}
        <span className="font-body text-2xs text-earth/50">
          {page} / {pageCount}
        </span>

        {/* Prev / Next */}
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

// ─── DataTable (declarative helper) ──────────────────────────────────────────

interface DataTableProps<T, K extends string = string> {
  data: T[];
  columns: ColumnDef<T, K>[];
  keyExtractor: (item: T) => string;
  sort?: SortState<K> | null;
  onSort?: (key: K) => void;
  onRowClick?: (item: T) => void;
  pagination?: PaginationState;
  pageSizeOptions?: number[];
  emptyIcon?: React.ReactNode;
  emptyLabel?: string;
  emptyDescription?: string;
  className?: string;
  wrapperClassName?: string;
  dividers?: boolean;
  rowClassName?: string | ((item: T) => string);
}

export function DataTable<T, K extends string = string>({
  data,
  columns,
  keyExtractor,
  sort,
  onSort,
  onRowClick,
  pagination,
  pageSizeOptions,
  emptyIcon,
  emptyLabel,
  emptyDescription,
  className,
  wrapperClassName,
  dividers,
  rowClassName,
}: DataTableProps<T, K>) {
  return (
    <Table
      sort={sort}
      onSort={onSort}
      className={className}
      wrapperClassName={wrapperClassName}
      dividers={dividers}
      footer={
        pagination && (
          <TablePagination
            pagination={pagination}
            pageSizeOptions={pageSizeOptions}
          />
        )
      }
    >
      <TableHeader>
        <TableHeaderRow>
          {columns.map((col) => (
            <TableHead
              key={col.key}
              sortKey={col.key}
              sortable={col.sortable}
              className={cn(col.minWidth, col.headerClassName)}
            >
              {col.header}
            </TableHead>
          ))}
        </TableHeaderRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableEmpty
            colSpan={columns.length}
            icon={emptyIcon}
            label={emptyLabel}
            description={emptyDescription}
          />
        ) : (
          data.map((item) => (
            <TableRow
              key={keyExtractor(item)}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={
                typeof rowClassName === "function"
                  ? rowClassName(item)
                  : rowClassName
              }
            >
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(col.minWidth, col.cellClassName)}
                >
                  {col.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
