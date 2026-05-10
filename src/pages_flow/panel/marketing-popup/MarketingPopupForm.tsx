"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Info } from "lucide-react";
import {
  FormLabel,
  FormInput,
  FormCheckbox,
  FormError,
  FormUploadZone,
  FormRichTextarea,
  FormDatePicker,
  Button,
  Card,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  toastSuccess,
  toastError,
} from "@/shared/ui";
import type { MarketingPopup } from "@/lib/marketingPopupDb";
import {
  createMarketingPopupAction,
  updateMarketingPopupAction,
  type MarketingPopupState,
} from "./actions";

function SubmitButton({ isCreate }: { isCreate: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      as="button"
      type="submit"
      variant="primary"
      size="sm"
      disabled={pending}
    >
      {pending ? "Saving…" : isCreate ? "Create" : "Save"}
    </Button>
  );
}

interface MarketingPopupFormProps {
  /** null → create flow; existing row → edit flow */
  popup: MarketingPopup | null;
}

export function MarketingPopupForm({ popup }: MarketingPopupFormProps) {
  const isCreate = popup === null;
  const action = isCreate
    ? createMarketingPopupAction
    : updateMarketingPopupAction.bind(null, popup.id);

  const [state, dispatch] = useActionState<
    MarketingPopupState | null,
    FormData
  >(action, null);

  const [startsAt, setStartsAt] = useState<Date | undefined>(
    popup?.starts_at ? new Date(popup.starts_at) : undefined,
  );
  const [endsAt, setEndsAt] = useState<Date | undefined>(
    popup?.ends_at ? new Date(popup.ends_at) : undefined,
  );

  const prev = useRef(state);
  useEffect(() => {
    if (state === prev.current) return;
    prev.current = state;
    if (state?.success) toastSuccess("Saved");
    if (state?.error) toastError(state.error);
    if (state?.fieldErrors) toastError("Please fill in the required fields");
  }, [state]);

  return (
    <form action={dispatch} className="flex flex-col gap-6">
      <Card className="p-6 overflow-visible">
        <div className="flex flex-col gap-5">
          <div>
            <FormLabel htmlFor="popup-title" required>
              Title
            </FormLabel>
            <FormInput
              id="popup-title"
              name="title"
              placeholder="e.g. Happy New Year — 20% off everything"
              defaultValue={state?.values?.title ?? popup?.title ?? ""}
              state={state?.fieldErrors?.title ? "error" : "default"}
            />
            <FormError message={state?.fieldErrors?.title} />
            <p className="mt-1.5 font-body text-2xs text-earth/50">
              Shown to visitors as the popup heading and used as the label in
              the admin catalog list.
            </p>
          </div>

          <div>
            <FormLabel htmlFor="popup-body">Body</FormLabel>
            <FormRichTextarea
              id="popup-body"
              name="body"
              placeholder="Greeting message, terms, dates…"
              defaultValue={state?.values?.body ?? popup?.body ?? ""}
            />
          </div>

          <div>
            <FormLabel>Image</FormLabel>
            <FormUploadZone
              name="image_url"
              multiple={false}
              initialUrl={popup?.image_url ?? undefined}
              slug="popup"
              bucket="marketing"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FormLabel htmlFor="popup-cta-label">CTA label</FormLabel>
              <FormInput
                id="popup-cta-label"
                name="cta_label"
                placeholder="e.g. Shop the deal"
                defaultValue={
                  state?.values?.cta_label ?? popup?.cta_label ?? ""
                }
              />
            </div>

            <div>
              <FormLabel htmlFor="popup-cta-url">CTA URL</FormLabel>
              <FormInput
                id="popup-cta-url"
                name="cta_url"
                placeholder="/?sort=promotions#products or https://…"
                defaultValue={state?.values?.cta_url ?? popup?.cta_url ?? ""}
                state={state?.fieldErrors?.cta_url ? "error" : "default"}
              />
              <FormError message={state?.fieldErrors?.cta_url} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormDatePicker
              id="popup-starts"
              name="starts_at"
              label="Start date"
              placeholder="No lower bound"
              showTime
              clearable
              value={startsAt}
              onValueChange={setStartsAt}
              maxDate={endsAt}
              state={state?.fieldErrors?.starts_at ? "error" : "default"}
              errorMessage={state?.fieldErrors?.starts_at}
            />
            <FormDatePicker
              id="popup-ends"
              name="ends_at"
              label="End date"
              placeholder="No upper bound"
              showTime
              clearable
              value={endsAt}
              onValueChange={setEndsAt}
              minDate={startsAt}
              state={state?.fieldErrors?.ends_at ? "error" : "default"}
              errorMessage={state?.fieldErrors?.ends_at}
            />
          </div>

          <p className="font-body text-2xs text-earth/60">
            Leave both empty to show whenever active. Set just one bound to
            constrain only the start or only the end.
          </p>
          <div className="flex items-center gap-1">
            <FormCheckbox
              id="popup-active"
              name="is_active"
              defaultChecked={
                state?.values?.is_active ?? popup?.is_active ?? isCreate
              }
              label="Active — show this popup on the home page"
            />
            <Tooltip side="top">
              <TooltipTrigger asChild>
                <Button
                  as="button"
                  type="button"
                  variant="text"
                  size="icon"
                  aria-label="Active popup info"
                  className="text-earth/40 hover:text-earth/70"
                >
                  <Info size={13} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="w-64 whitespace-normal text-left leading-snug">
                Activating this popup will automatically deactivate any other
                active popup. Each visitor sees it at most once per browser
                session.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button href="/panel/marketing-popup" variant="secondary" size="sm">
          Cancel
        </Button>
        <SubmitButton isCreate={isCreate} />
      </div>
    </form>
  );
}
