"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Card, Badge, Button } from "@/shared/ui";
import type { DeliverySetting } from "@/lib/deliveryDb";
import { EmirateView } from "./EmirateView";
import { EmirateForm } from "./EmirateForm";

interface EmirateCardProps {
  setting: DeliverySetting;
}

export function EmirateCard({ setting }: EmirateCardProps) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  return (
    <Card variant="default" padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="font-body font-semibold text-earth text-base">
            {setting.emirate}
          </p>
          <Badge variant={setting.is_active ? "natural" : "warm"} size="xs">
            {setting.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        {!editing && (
          <Button
            as="button"
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
        )}
      </div>

      {editing ? (
        <EmirateForm
          setting={setting}
          onDone={() => {
            setEditing(false);
            router.refresh();
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <EmirateView setting={setting} />
      )}
    </Card>
  );
}
