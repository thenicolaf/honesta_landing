"use client";

import { Card, Badge, CopyText, Button } from "@/shared/ui";
import { displayAddress, shortAddress, parseAddress } from "@/shared/utils/address";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { UserAddress } from "@/lib/addressesDb";

interface AddressCardProps {
  address: UserAddress;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AddressCard({
  address,
  selected = false,
  disabled = false,
  onSelect,
  onEdit,
  onDelete,
}: AddressCardProps) {
  const parsed = parseAddress(address.address);

  return (
    <Card
      variant={selected ? "cream" : "outline"}
      padding="none"
      className={cn(
        "transition-all px-3 py-2.5",
        disabled
          ? "opacity-50 pointer-events-none"
          : "cursor-pointer hover:border-orange/50",
        selected && "ring-1 ring-orange border-orange",
      )}
      onClick={disabled ? undefined : onSelect}
    >
      {/* Top row: badges + delete */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {address.label && (
            <Badge variant="warm" size="xs">
              {address.label}
            </Badge>
          )}
          {address.is_default && (
            <Badge variant="natural" size="xs">
              Default
            </Badge>
          )}
          {!address.label && !address.is_default && (
            <Badge variant="outline" size="xs">
              Address
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {onEdit && (
            <Button
              as="button"
              type="button"
              variant="text"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              as="button"
              type="button"
              variant="text"
              size="sm"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      <CopyText
        text={displayAddress(address.address)}
        className="text-sm text-earth hover:text-orange mt-1 w-full min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        <MapPin className="w-3.5 h-3.5 shrink-0 text-earth/40" />
        <span className="truncate min-w-0">
          {shortAddress(address.address) || displayAddress(address.address)}
        </span>
      </CopyText>

      {(parsed.defaultBuildingName || parsed.defaultFlatNumber) && (
        <p className="font-body text-2xs text-earth/50 truncate min-w-0 mt-0.5">
          {[
            parsed.defaultBuildingName,
            parsed.defaultFlatNumber && `Flat ${parsed.defaultFlatNumber}`,
          ]
            .filter(Boolean)
            .join(", ")}
        </p>
      )}
    </Card>
  );
}
