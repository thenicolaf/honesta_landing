"use client";

import dynamic from "next/dynamic";
import type { CustomerInfo } from "@/shared/types";
import { mapAddressFieldErrors, parseAddress } from "@/shared/utils/address";
import type { ManualOrderState } from "../actions";
import { ManualOrderSection } from "./ManualOrderSection";

const AddressWithMap = dynamic(
  () => import("@/shared/ui/AddressWithMap").then((m) => m.AddressWithMap),
  { ssr: false },
);

interface DeliveryAddressSectionProps {
  defaults: Partial<CustomerInfo>;
  fieldErrors?: ManualOrderState["fieldErrors"];
  onEmirateChange: (emirate: string) => void;
}

export function DeliveryAddressSection({
  defaults,
  fieldErrors,
  onEmirateChange,
}: DeliveryAddressSectionProps) {
  return (
    <ManualOrderSection title="Delivery address">
      <AddressWithMap
        {...parseAddress(defaults.address)}
        defaultLat={defaults.lat}
        defaultLng={defaults.lng}
        fieldErrors={mapAddressFieldErrors(fieldErrors)}
        onEmirateChange={onEmirateChange}
      />
    </ManualOrderSection>
  );
}
