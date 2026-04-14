"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Lock } from "lucide-react";
import { Card, Button } from "@/shared/ui";

const ChangePasswordForm = dynamic(
  () => import("./ChangePasswordForm").then((m) => m.ChangePasswordForm),
  { ssr: false },
);

export function PasswordSection() {
  const [open, setOpen] = useState(false);

  return (
    <Card className="p-4 md:px-6 md:py-4 lg:p-8 mt-6">
      <div className="flex items-center justify-between">
        <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/50">
          Password
        </p>
        {!open && (
          <Button
            as="button"
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            Change
          </Button>
        )}
      </div>

      {open ? (
        <div className="mt-6">
          <ChangePasswordForm onDone={() => setOpen(false)} />
        </div>
      ) : (
        <div className="flex items-center gap-3 mt-4">
          <div className="rounded-lg bg-sand/60 p-2 text-earth/40 shrink-0 [&>svg]:w-4 [&>svg]:h-4">
            <Lock />
          </div>
          <p className="font-body text-sm text-earth tracking-widest">
            ••••••••
          </p>
        </div>
      )}
    </Card>
  );
}
