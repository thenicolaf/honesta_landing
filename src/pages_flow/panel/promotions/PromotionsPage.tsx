"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import {
  Button,
  Badge,
  Card,
  EmptyState,
  ToastFromUrl,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  useDialog,
  toastSuccess,
} from "@/shared/ui";
import { formatDateTime } from "@/shared/ui/Table";
import type { Promotion } from "@/lib/promotionsDb";
import { deletePromotionAction } from "./actions";
import { getPromotionStatus, type PromotionStatus } from "./types";

const STATUS_BADGE: Record<
  PromotionStatus,
  { variant: "natural" | "warm" | "outline"; label: string; className?: string }
> = {
  active: { variant: "natural", label: "Active" },
  scheduled: { variant: "warm", label: "Scheduled" },
  expired: { variant: "outline", label: "Expired", className: "text-earth/40" },
};

// ─── Delete Confirm ─────────────────────────────────────────────────────────

function DeleteConfirm({ id }: { id: string }) {
  const { close } = useDialog();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <DialogFooter>
      <DialogClose>Cancel</DialogClose>
      <Button
        as="button"
        type="button"
        variant="primary"
        color="error"
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await deletePromotionAction(id);
            close();
            toastSuccess("Promotion deleted");
            router.refresh();
          })
        }
      >
        {isPending ? "Deleting…" : "Delete"}
      </Button>
    </DialogFooter>
  );
}

// ─── Promotion Card ─────────────────────────────────────────────────────────

function PromotionCard({ promo }: { promo: Promotion }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const status = getPromotionStatus(promo.is_active, promo.starts_at, promo.ends_at);
  const badge = STATUS_BADGE[status];

  const discountLabel =
    promo.discount_type === "percentage"
      ? `${promo.discount_value}%`
      : `AED ${promo.discount_value}`;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-body font-semibold text-earth text-sm">
            {promo.name}
          </p>
          <p className="font-body text-2xs text-earth/50 mt-0.5">
            {discountLabel} off
          </p>
        </div>
        <Badge variant={badge.variant} size="sm" className={badge.className}>
          {badge.label}
        </Badge>
      </div>

      <p className="font-body text-xs text-earth/40 mb-4">
        {formatDateTime(promo.starts_at)} → {formatDateTime(promo.ends_at)}
      </p>

      <div className="flex items-center gap-2">
        <Button
          as="a"
          href={`/panel/promotions/${promo.id}/edit`}
          variant="outline"
          size="sm"
          startIcon={<Pencil size={13} />}
        >
          Edit
        </Button>
        <Button
          as="button"
          type="button"
          variant="text"
          size="icon"
          className="text-earth/40 hover:text-red-500"
          onClick={() => setDeleteOpen(true)}
          aria-label="Delete"
        >
          <Trash2 size={15} />
        </Button>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete Promotion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{promo.name}&rdquo;?
            </DialogDescription>
          </DialogHeader>
          <DeleteConfirm id={promo.id} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ─── PromotionsPage ─────────────────────────────────────────────────────────

export function PromotionsPage({ promotions }: { promotions: Promotion[] }) {
  return (
    <>
      <ToastFromUrl />

      <div className="flex items-center justify-between gap-4 mb-2">
        <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss">
          Admin Panel
        </p>
        <Button
          as="a"
          href="/panel/promotions/create"
          variant="primary"
          size="sm"
          startIcon={<Plus size={14} />}
        >
          New Promotion
        </Button>
      </div>
      <h1
        className="font-display font-bold italic text-heading mb-6 leading-tight"
        style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
      >
        Promotions
      </h1>

      {promotions.length === 0 ? (
        <EmptyState
          label="No promotions yet"
          description="Create one to start offering discounts."
          action={{
            label: "New Promotion",
            href: "/panel/promotions/create",
            variant: "primary",
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {promotions.map((promo) => (
            <PromotionCard key={promo.id} promo={promo} />
          ))}
        </div>
      )}
    </>
  );
}
