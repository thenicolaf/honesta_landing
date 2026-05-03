import { Button } from "@/shared/ui";

interface ManualOrderFooterProps {
  isPending: boolean;
}

export function ManualOrderFooter({ isPending }: ManualOrderFooterProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <Button
        as="a"
        href="/panel/all-orders"
        variant="secondary"
        color="default"
        size="sm"
      >
        Cancel
      </Button>
      <Button
        as="button"
        type="submit"
        variant="primary"
        size="sm"
        disabled={isPending}
      >
        {isPending ? "Creating…" : "Create order"}
      </Button>
    </div>
  );
}
