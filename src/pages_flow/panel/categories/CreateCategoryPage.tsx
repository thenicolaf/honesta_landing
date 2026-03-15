import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui";
import { CategoryForm } from "./CategoryForm";

export function CreateCategoryPage() {
  return (
    <>
      <div className="mb-6">
        <Button
          as="a"
          href="/panel/categories"
          variant="outline"
          size="sm"
          startIcon={<ArrowLeft size={14} />}
        >
          Back to categories
        </Button>
      </div>

      <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-2">
        Admin Panel
      </p>
      <h1
        className="font-display font-bold italic text-heading mb-8 leading-tight"
        style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
      >
        New Category
      </h1>

      <CategoryForm />
    </>
  );
}
