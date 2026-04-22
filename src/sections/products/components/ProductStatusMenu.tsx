"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Archive, Eye, Trash2, FileText } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  useDropdownMenu,
  toastSuccess,
} from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import { IconChevron } from "@/shared/icons";
import { ProductStatus } from "@/shared/types";
import { updateProductStatus } from "@/pages_flow/panel/products/actions";

function AnimatedChevron() {
  const { open } = useDropdownMenu();
  return (
    <motion.span
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="inline-flex"
    >
      <IconChevron className="w-3 h-3" />
    </motion.span>
  );
}

type StatusColor = "primary" | "default" | "error";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: StatusColor; icon: React.ReactNode }
> = {
  [ProductStatus.DRAFT]: {
    label: "Draft",
    color: "default",
    icon: <FileText size={12} aria-hidden="true" />,
  },
  [ProductStatus.PUBLISHED]: {
    label: "Published",
    color: "primary",
    icon: <Eye size={12} aria-hidden="true" />,
  },
  [ProductStatus.ARCHIVED]: {
    label: "Archived",
    color: "default",
    icon: <Archive size={12} aria-hidden="true" />,
  },
};

interface ProductStatusMenuProps {
  productId: string;
  status: string;
  onDelete?: () => void;
  className?: string;
}

export function ProductStatusMenu({
  productId,
  status,
  onDelete,
  className,
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
    <DropdownMenu className={cn("w-full", className)}>
      <DropdownMenuTrigger asChild stopPropagation>
        <Button
          as="button"
          type="button"
          variant="outline"
          color={config.color}
          size="sm"
          startIcon={config.icon}
          endIcon={<AnimatedChevron />}
          disabled={isPending}
          aria-label={config.label}
          className="w-full"
        >
          <span className="hidden sm:inline">{config.label}</span>
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
