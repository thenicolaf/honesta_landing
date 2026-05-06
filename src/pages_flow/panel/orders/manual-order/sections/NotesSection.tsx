import { FormLabel, FormTextarea } from "@/shared/ui";
import { ManualOrderSection } from "./ManualOrderSection";

interface NotesSectionProps {
  defaultValue?: string | null;
}

export function NotesSection({ defaultValue }: NotesSectionProps) {
  return (
    <ManualOrderSection>
      <div>
        <FormLabel htmlFor="notes">
          Notes{" "}
          <span className="normal-case tracking-normal font-light text-earth/40">
            (optional)
          </span>
        </FormLabel>
        <FormTextarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaultValue ?? undefined}
          placeholder="Any special instructions for delivery…"
        />
      </div>
    </ManualOrderSection>
  );
}
