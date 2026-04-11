"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil } from "lucide-react";
import {
  Button,
  Badge,
  Card,
  CopyText,
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
import type { PromoCodeListItem } from "@/lib/promoCodesDb";
import { deletePromoCodeAction } from "./actions";
import { getPromoCodeStatus, type PromoCodeStatus } from "./types";

const STATUS_BADGE: Record<
  PromoCodeStatus,
  { variant: "natural" | "warm" | "outline"; label: string; className?: string }
> = {
  active: { variant: "natural", label: "Active" },
  scheduled: { variant: "warm", label: "Scheduled" },
  exhausted: {
    variant: "outline",
    label: "Exhausted",
    className: "text-orange/70 border-orange/30",
  },
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
            await deletePromoCodeAction(id);
            close();
            toastSuccess("Promo code deleted");
            router.refresh();
          })
        }
      >
        {isPending ? "Deleting…" : "Delete"}
      </Button>
    </DialogFooter>
  );
}

// ─── Promo Code Card ────────────────────────────────────────────────────────

function PromoCodeCard({ promo }: { promo: PromoCodeListItem }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const status = getPromoCodeStatus(
    promo.is_active,
    promo.starts_at,
    promo.ends_at,
    promo.used_count,
    promo.max_uses,
  );
  const badge = STATUS_BADGE[status];

  const discountLabel =
    promo.discount_type === "percentage"
      ? `${promo.discount_value}%`
      : `AED ${promo.discount_value}`;

  const usageLabel =
    promo.max_uses != null
      ? `${promo.used_count} / ${promo.max_uses}`
      : `${promo.used_count} used`;

  const scopeLabel = promo.scope === "cart" ? "Whole cart" : "Specific products";

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <CopyText
            text={promo.code}
            className="font-mono font-semibold text-earth text-base tracking-widest"
          >
            {promo.code}
          </CopyText>
          <p className="font-body text-2xs text-earth/50 mt-0.5">
            {discountLabel} off · {scopeLabel}
          </p>
        </div>
        <Badge variant={badge.variant} size="sm" className={badge.className}>
          {badge.label}
        </Badge>
      </div>

      <p className="font-body text-xs text-earth/40 mb-1">
        {formatDateTime(promo.starts_at)} → {formatDateTime(promo.ends_at)}
      </p>
      <p className="font-body text-2xs text-earth/40 mb-4">{usageLabel}</p>

      <div className="flex items-center gap-2">
        <Button
          as="a"
          href={`/panel/promo-codes/${promo.id}/edit`}
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
            <DialogTitle>Delete Promo Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{promo.code}&rdquo;?
            </DialogDescription>
          </DialogHeader>
          <DeleteConfirm id={promo.id} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ─── PromoCodesPage ─────────────────────────────────────────────────────────

const STATUS_ORDER: Record<PromoCodeStatus, number> = {
  active: 0,
  scheduled: 1,
  exhausted: 2,
  expired: 3,
};

export function PromoCodesPage({
  promoCodes,
}: {
  promoCodes: PromoCodeListItem[];
}) {
  const sorted = [...promoCodes].sort((a, b) => {
    const sa =
      STATUS_ORDER[
        getPromoCodeStatus(
          a.is_active,
          a.starts_at,
          a.ends_at,
          a.used_count,
          a.max_uses,
        )
      ];
    const sb =
      STATUS_ORDER[
        getPromoCodeStatus(
          b.is_active,
          b.starts_at,
          b.ends_at,
          b.used_count,
          b.max_uses,
        )
      ];
    return sa - sb;
  });

  return (
    <>
      <ToastFromUrl />

      <div className="flex items-center justify-between gap-4 mb-2">
        <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss">
          Admin Panel
        </p>
        <Button
          as="a"
          href="/panel/promo-codes/create"
          variant="primary"
          size="sm"
          startIcon={<Plus size={14} />}
        >
          New Promo Code
        </Button>
      </div>
      <h1
        className="font-display font-bold italic text-heading mb-6 leading-tight"
        style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
      >
        Promo Codes
      </h1>

      {promoCodes.length === 0 ? (
        <EmptyState
          label="No promo codes yet"
          description="Create one to give customers a discount."
          action={{
            label: "New Promo Code",
            href: "/panel/promo-codes/create",
            variant: "primary",
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((promo) => (
            <PromoCodeCard key={promo.id} promo={promo} />
          ))}
        </div>
      )}
    </>
  );
}
