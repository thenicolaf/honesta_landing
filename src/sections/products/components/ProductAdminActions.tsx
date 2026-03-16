"use client";

import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/shared/ui";
import { ProductStatusMenu } from "./ProductStatusMenu";

function stop(e: React.MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
}

interface ProductAdminActionsProps {
  productId: string;
  productTitle: string;
  status: string;
  onDelete: () => void;
}

export function ProductAdminActions({
  productId,
  productTitle,
  status,
  onDelete,
}: ProductAdminActionsProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 pt-3 mt-auto [&>button]:grow">
      <ProductStatusMenu
        productId={productId}
        status={status}
        onDelete={onDelete}
      />
      <Button
        as="button"
        type="button"
        variant="outline"
        size="sm"
        startIcon={<Pencil size={12} aria-hidden="true" />}
        onClick={(e) => {
          stop(e);
          router.push(`/panel/products/${productId}/edit`);
        }}
        aria-label={`Edit ${productTitle}`}
        className="grow"
      >
        Edit
      </Button>
    </div>
  );
}
