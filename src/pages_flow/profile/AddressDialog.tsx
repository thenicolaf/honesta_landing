"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FormLabel,
  FormInput,
  AddressWithMap,
  Button,
  toastSuccess,
  toastError,
  useDialog,
} from "@/shared/ui";
import {
  createAddressAction,
  updateAddressAction,
  type AddressState,
} from "./addressActions";
import { parseAddress } from "@/shared/utils/address";
import type { UserAddress } from "@/lib/addressesDb";

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editAddress?: UserAddress | null;
}

export function AddressDialog({
  open,
  onOpenChange,
  editAddress,
}: AddressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>
            {editAddress ? "Edit Address" : "Add Address"}
          </DialogTitle>
        </DialogHeader>
        <AddressDialogForm editAddress={editAddress} />
      </DialogContent>
    </Dialog>
  );
}

function AddressDialogForm({
  editAddress,
}: {
  editAddress?: UserAddress | null;
}) {
  const { close } = useDialog();
  const router = useRouter();
  const isEdit = !!editAddress;

  const boundUpdateAction = editAddress
    ? updateAddressAction.bind(null, editAddress.id)
    : undefined;

  const [state, action, isPending] = useActionState<
    AddressState | null,
    FormData
  >(boundUpdateAction ?? createAddressAction, null);

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.success) {
      close();
      toastSuccess(isEdit ? "Address updated" : "Address added");
      router.refresh();
    }
    if (state?.error) toastError(state.error);
  }, [state, close, router, isEdit]);

  const defaultLabel = state?.values?.label ?? editAddress?.label ?? undefined;
  const defaultAddress =
    state?.values?.address ?? editAddress?.address ?? undefined;
  const defaultLat =
    state?.values?.lat ??
    (editAddress?.coordinates
      ? String(editAddress.coordinates.lat)
      : undefined);
  const defaultLng =
    state?.values?.lng ??
    (editAddress?.coordinates
      ? String(editAddress.coordinates.lng)
      : undefined);

  const parsed = parseAddress(defaultAddress);

  return (
    <form
      key={state?.attempt ?? 0}
      action={action}
      className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto"
    >
      <div>
        <FormLabel htmlFor="address-label">
          Label{" "}
          <span className="normal-case tracking-normal font-light text-earth/40">
            (optional)
          </span>
        </FormLabel>
        <FormInput
          id="address-label"
          name="label"
          type="text"
          defaultValue={defaultLabel}
          placeholder="Home, Office, etc."
        />
      </div>

      <AddressWithMap
        {...parsed}
        defaultLat={defaultLat}
        defaultLng={defaultLng}
        error={state?.fieldErrors?.address}
      />

      <Button
        as="button"
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? "Saving..." : isEdit ? "Update Address" : "Save Address"}
      </Button>
    </form>
  );
}
