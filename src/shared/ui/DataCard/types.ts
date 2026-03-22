export interface FieldDef<T> {
  /** Unique key for this field */
  key: string;
  /** Field label (optional — omit for label-less rendering) */
  label?: string;
  /** Cell renderer — receives the data item */
  cell: (item: T) => React.ReactNode;
  /** Additional className for the field wrapper */
  className?: string;
}
