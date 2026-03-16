export type SortDirection = "asc" | "desc";

export interface SortState<K extends string = string> {
  key: K;
  direction: SortDirection;
}

export interface ColumnDef<T, K extends string = string> {
  /** Unique key for this column — used for sorting, visibility, etc. */
  key: K;
  /** Header label */
  header: React.ReactNode;
  /** Cell renderer — receives the row item */
  cell: (item: T) => React.ReactNode;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Custom sort comparator. Return negative/zero/positive like Array.sort. */
  compare?: (a: T, b: T) => number;
  /** Header cell className */
  headerClassName?: string;
  /** Body cell className */
  cellClassName?: string;
  /** Min-width utility class (e.g. "min-w-32") */
  minWidth?: string;
}
