"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Power, PowerOff } from "lucide-react";
import {
  Button,
  Badge,
  Card,
  EmptyState,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  useDialog,
  toastSuccess,
  toastError,
} from "@/shared/ui";
import { formatDateTime } from "@/shared/ui/Table";
import type { MarketingPopup } from "@/lib/marketingPopupDb";
import {
  activateMarketingPopupAction,
  deactivateMarketingPopupAction,
  deleteMarketingPopupAction,
} from "./actions";
import {
  getMarketingPopupStatus,
  type MarketingPopupStatus,
} from "./types";

const STATUS_BADGE: Record<
  MarketingPopupStatus,
  { variant: "natural" | "warm" | "outline"; label: string; className?: string }
> = {
  active: { variant: "natural", label: "Active" },
  scheduled: { variant: "warm", label: "Scheduled" },
  expired: { variant: "outline", label: "Expired", className: "text-earth/40" },
  inactive: { variant: "outline", label: "Inactive", className: "text-earth/40" },
};

const STATUS_ORDER: Record<MarketingPopupStatus, number> = {
  active: 0,
  scheduled: 1,
  inactive: 2,
  expired: 3,
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
            const result = await deleteMarketingPopupAction(id);
            close();
            if (result.error) toastError(result.error);
            else toastSuccess("Popup deleted");
            router.refresh();
          })
        }
      >
        {isPending ? "Deleting…" : "Delete"}
      </Button>
    </DialogFooter>
  );
}

// ─── Card ───────────────────────────────────────────────────────────────────

function MarketingPopupCard({ popup }: { popup: MarketingPopup }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const status = getMarketingPopupStatus(
    popup.is_active,
    popup.starts_at,
    popup.ends_at,
  );
  const badge = STATUS_BADGE[status];

  const handleToggle = () => {
    startTransition(async () => {
      const result = popup.is_active
        ? await deactivateMarketingPopupAction(popup.id)
        : await activateMarketingPopupAction(popup.id);
      if (result.error) toastError(result.error);
      else
        toastSuccess(
          popup.is_active ? "Deactivated" : "Activated",
        );
      router.refresh();
    });
  };

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p
            className="font-body font-semibold text-earth text-sm truncate"
            title={popup.title || "(untitled)"}
          >
            {popup.title || "(untitled)"}
          </p>
        </div>
        <Badge variant={badge.variant} size="sm" className={badge.className}>
          {badge.label}
        </Badge>
      </div>

      {(popup.starts_at || popup.ends_at) && (
        <p className="font-body text-xs text-earth/40 mb-4">
          {popup.starts_at ? formatDateTime(popup.starts_at) : "—"}
          {" → "}
          {popup.ends_at ? formatDateTime(popup.ends_at) : "—"}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          as="a"
          href={`/panel/marketing-popup/${popup.id}/edit`}
          variant="outline"
          size="sm"
          startIcon={<Pencil size={13} />}
        >
          Edit
        </Button>
        <Button
          as="button"
          type="button"
          variant={popup.is_active ? "secondary" : "primary"}
          size="sm"
          disabled={isPending}
          onClick={handleToggle}
          startIcon={
            popup.is_active ? <PowerOff size={13} /> : <Power size={13} />
          }
        >
          {popup.is_active ? "Deactivate" : "Activate"}
        </Button>
        <Button
          as="button"
          type="button"
          variant="text"
          size="icon"
          className="ml-auto text-earth/40 hover:text-red-500"
          onClick={() => setDeleteOpen(true)}
          aria-label="Delete"
        >
          <Trash2 size={15} />
        </Button>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete Popup</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{popup.title || "this popup"}&rdquo;?
            </DialogDescription>
          </DialogHeader>
          <DeleteConfirm id={popup.id} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ─── List ───────────────────────────────────────────────────────────────────

export function MarketingPopupList({ popups }: { popups: MarketingPopup[] }) {
  if (popups.length === 0) {
    return (
      <EmptyState
        label="No popups yet"
        description="Create one to greet visitors with announcements or holiday offers."
        action={{
          label: "New Popup",
          href: "/panel/marketing-popup/create",
          variant: "primary",
        }}
      />
    );
  }

  const sorted = [...popups].sort((a, b) => {
    const sa =
      STATUS_ORDER[
        getMarketingPopupStatus(a.is_active, a.starts_at, a.ends_at)
      ];
    const sb =
      STATUS_ORDER[
        getMarketingPopupStatus(b.is_active, b.starts_at, b.ends_at)
      ];
    return sa - sb;
  });

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {sorted.map((popup) => (
        <MarketingPopupCard key={popup.id} popup={popup} />
      ))}
    </div>
  );
}
