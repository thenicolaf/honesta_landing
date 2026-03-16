"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Eye, Trash2 } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  toastSuccess,
} from "@/shared/ui";
import { IconChevron } from "@/shared/icons";
import { ProductStatus } from "@/shared/types";
import { updateProductStatus } from "@/pages_flow/panel/products/actions";

type StatusColor = "primary" | "default" | "error";

const STATUS_CONFIG: Record<string, { label: string; color: StatusColor }> = {
  [ProductStatus.DRAFT]: { label: "Draft", color: "default" },
  [ProductStatus.PUBLISHED]: { label: "Published", color: "primary" },
  [ProductStatus.ARCHIVED]: { label: "Archived", color: "default" },
};

interface ProductStatusMenuProps {
  productId: string;
  status: string;
  onDelete?: () => void;
}

export function ProductStatusMenu({
  productId,
  status,
  onDelete,
}: ProductStatusMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[ProductStatus.DRAFT];

  const isDraft = status === ProductStatus.DRAFT;
  const isPublished = status === ProductStatus.PUBLISHED;
  const isArchived = status === ProductStatus.ARCHIVED;

  const STATUS_LABELS: Record<string, string> = {
    published: "Product published",
    archived: "Product archived",
    draft: "Product moved to draft",
  };

  const handleStatusChange = (
    newStatus: "draft" | "published" | "archived",
  ) => {
    startTransition(async () => {
      await updateProductStatus(productId, newStatus);
      toastSuccess(STATUS_LABELS[newStatus]);
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild stopPropagation>
        <Button
          as="button"
          type="button"
          variant="outline"
          color={config.color}
          size="sm"
          endIcon={<IconChevron className="w-3 h-3" />}
          disabled={isPending}
        >
          {config.label}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="left">
        {(isDraft || isArchived) && (
          <DropdownMenuItem onClick={() => handleStatusChange("published")}>
            <Eye size={14} aria-hidden="true" />
            Publish
          </DropdownMenuItem>
        )}
        {(isDraft || isPublished) && (
          <DropdownMenuItem onClick={() => handleStatusChange("archived")}>
            <Archive size={14} aria-hidden="true" />
            Archive
          </DropdownMenuItem>
        )}
        {isArchived && onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={() => onDelete()}>
              <Trash2 size={14} aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
