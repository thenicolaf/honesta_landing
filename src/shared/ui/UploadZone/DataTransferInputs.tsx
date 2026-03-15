import type { UploadFile } from "./types";

export function DataTransferInputs({
  name,
  files,
}: {
  name: string;
  files: UploadFile[];
}) {
  return (
    <>
      {files.map((f) => {
        const dt = new DataTransfer();
        dt.items.add(f.file);
        return (
          <input
            key={f.id}
            type="file"
            name={name}
            className="hidden"
            ref={(el) => {
              if (el) el.files = dt.files;
            }}
          />
        );
      })}
    </>
  );
}
