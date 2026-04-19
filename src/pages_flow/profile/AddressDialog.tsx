"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FormLabel,
  FormInput,
  Button,
  toastSuccess,
  toastError,
  useDialog,
} from "@/shared/ui";

const AddressWithMap = dynamic(
  () => import("@/shared/ui/AddressWithMap").then((m) => m.AddressWithMap),
  { ssr: false },
);
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
    if (state?.fieldErrors) toastError("Please fill in the required fields");
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
        fieldErrors={{
          emirate: state?.fieldErrors?.emirate,
          city: state?.fieldErrors?.addressCity,
          area: state?.fieldErrors?.addressArea,
          buildingName: state?.fieldErrors?.addressBuilding,
        }}
      />

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          as="button"
          type="button"
          variant="secondary"
          size="sm"
          onClick={close}
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
          {isPending ? "Saving…" : isEdit ? "Update address" : "Save address"}
        </Button>
      </div>
    </form>
  );
}
