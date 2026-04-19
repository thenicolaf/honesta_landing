"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import {
  AddressCard,
  FormError,
  Card,
} from "@/shared/ui";
import type { AddressFieldErrors } from "@/shared/ui/AddressWithMap";

const AddressWithMap = dynamic(
  () => import("@/shared/ui/AddressWithMap").then((m) => m.AddressWithMap),
  { ssr: false },
);
import { parseAddress } from "@/shared/utils/address";
import { MapPin } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { UserAddress } from "@/lib/addressesDb";

interface AddressSelectorProps {
  addresses: UserAddress[];
  defaultValues?: {
    address?: string;
    lat?: string;
    lng?: string;
  };
  fieldErrors?: AddressFieldErrors | null;
  onEmirateChange?: (emirate: string) => void;
  disabledEmirates?: string[];
}

export function AddressSelector({
  addresses,
  defaultValues,
  fieldErrors,
  onEmirateChange,
  disabledEmirates,
}: AddressSelectorProps) {
  const defaultAddr = addresses.find((a) => a.is_default);
  const [selectedId, setSelectedId] = useState<string>(
    defaultAddr?.id ?? addresses[0]?.id ?? "custom",
  );

  const selectedAddress = addresses.find((a) => a.id === selectedId);
  const isCustom = selectedId === "custom";

  function handleSelect(addr: UserAddress) {
    setSelectedId(addr.id);
    // Extract emirate from the saved address and notify parent
    const parsed = parseAddress(addr.address);
    if (parsed.defaultEmirate && onEmirateChange) {
      onEmirateChange(parsed.defaultEmirate);
    }
  }

  function handleCustom() {
    setSelectedId("custom");
    // Default emirate in AddressWithMap is Dubai
    onEmirateChange?.("Dubai");
  }

  return (
    <div>
      <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/50 mb-3">
        Delivery Address
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {addresses.map((addr) => {
          const addrEmirate = parseAddress(addr.address).defaultEmirate;
          const isDisabled = !!(addrEmirate && disabledEmirates?.includes(addrEmirate));
          return (
            <AddressCard
              key={addr.id}
              address={addr}
              selected={selectedId === addr.id}
              disabled={isDisabled}
              onSelect={() => handleSelect(addr)}
            />
          );
        })}

        {/* Custom address option */}
        <Card
          variant={isCustom ? "cream" : "outline"}
          padding="none"
          className={cn(
            "transition-all px-3 py-2.5 cursor-pointer hover:border-orange/50 flex items-center gap-2 border-dashed",
            isCustom && "ring-1 ring-orange border-orange",
          )}
          onClick={handleCustom}
        >
          <MapPin className="w-3.5 h-3.5 shrink-0 text-earth/40" />
          <span className="font-body text-sm text-earth">
            Use a different address
          </span>
        </Card>
      </div>

      {selectedAddress && (
        <AddressHiddenInputs address={selectedAddress} />
      )}

      <FormError message={!isCustom ? fieldErrors?.emirate : undefined} />

      {/* Custom address form */}
      <AnimatePresence>
        {isCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <AddressWithMap
                {...parseAddress(defaultValues?.address)}
                defaultLat={defaultValues?.lat}
                defaultLng={defaultValues?.lng}
                fieldErrors={isCustom ? fieldErrors : undefined}
                onEmirateChange={onEmirateChange}
                disabledEmirates={disabledEmirates}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddressHiddenInputs({ address }: { address: UserAddress }) {
  const parsed = parseAddress(address.address);
  return (
    <>
      <input type="hidden" name="emirate" value={parsed.defaultEmirate ?? ""} />
      <input type="hidden" name="address" value={address.address} />
      <input type="hidden" name="addressCity" value={parsed.defaultCity ?? ""} />
      <input type="hidden" name="addressArea" value={parsed.defaultArea ?? ""} />
      <input
        type="hidden"
        name="addressBuilding"
        value={parsed.defaultBuildingName ?? ""}
      />
      <input
        type="hidden"
        name="lat"
        value={address.coordinates ? String(address.coordinates.lat) : ""}
      />
      <input
        type="hidden"
        name="lng"
        value={address.coordinates ? String(address.coordinates.lng) : ""}
      />
    </>
  );
}
