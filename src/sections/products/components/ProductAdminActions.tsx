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
    <div className="flex flex-col items-stretch gap-2 pt-3 mt-auto min-[520px]:flex-row min-[520px]:items-center">
      <ProductStatusMenu
        productId={productId}
        status={status}
        onDelete={onDelete}
        className="min-[520px]:flex-1"
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
        className="w-full min-[520px]:flex-1"
      >
        Edit
      </Button>
    </div>
  );
}
