export interface UploadFile {
  id: string;
  file: File;
  preview: string;
}

export interface UploadItem {
  id: string;
  url: string;
  name: string;
}

export type UploadMultipleProps =
  | { multiple?: true; maxFiles?: number }
  | { multiple: false; maxFiles?: never };
