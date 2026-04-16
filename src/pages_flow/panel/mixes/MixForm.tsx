"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, toastError } from "@/shared/ui";
import type { MixBox, MixFormOptions } from "@/lib/mixBoxesDb";
import { createMixAction, updateMixAction, type MixState } from "./actions";
import { BasicInfoSection } from "./mix-form/BasicInfoSection";
import { PresetsSection } from "./mix-form/PresetsSection";

interface MixFormProps {
  mix?: MixBox;
  options: MixFormOptions;
}

export function MixForm({ mix, options }: MixFormProps) {
  const action = mix ? updateMixAction.bind(null, mix.id) : createMixAction;

  const [state, dispatch, isPending] = useActionState<
    MixState | null,
    FormData
  >(action, null);

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.error) toastError(state.error);
    if (state?.fieldErrors) toastError("Please fill in the required fields");
  }, [state]);

  const sectionProps = { mix, options, state };

  return (
    <form action={dispatch} className="flex flex-col gap-6">
      <BasicInfoSection {...sectionProps} />
      <PresetsSection {...sectionProps} />

      {state?.error && (
        <p className="font-body text-red-500 text-2xs">{state.error}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          as="a"
          href="/panel/mixes"
          variant="secondary"
          color="default"
          size="sm"
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
          {isPending ? "Saving…" : mix ? "Save changes" : "Create"}
        </Button>
      </div>
    </form>
  );
}
