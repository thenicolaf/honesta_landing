export interface DeferredItem {
  id: string;
  /** blob: URL for new local files, https:// URL for existing Storage images */
  preview: string;
  name: string;
  /** true = existing image from Supabase Storage, false = new local file */
  origin: boolean;
  /** Present only when origin is false (new files) */
  file?: File;
}

export type UploadMultipleProps =
  | { multiple?: true; maxFiles?: number }
  | { multiple: false; maxFiles?: never };
