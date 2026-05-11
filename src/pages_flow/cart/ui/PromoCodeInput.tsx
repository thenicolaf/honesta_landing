"use client";

import { useState, useTransition } from "react";
import { Tag, X } from "lucide-react";
import { useCart } from "@/providers";
import { Button, FormInput } from "@/shared/ui";
import { trackApplyCoupon, trackCouponInvalid } from "@/lib/analytics";
import { PROMO_CODE_MAX_LENGTH } from "@/shared/utils/promoCode";

interface PromoCodeInputProps {
  isAuthenticated: boolean;
  loginRedirect?: string;
}

export function PromoCodeInput({
  isAuthenticated,
  loginRedirect = "/cart",
}: PromoCodeInputProps) {
  const { appliedPromoCode, promoDiscount, applyPromoCode, removePromoCode } =
    useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-dashed border-earth/15 bg-cream/50 px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-earth/55 text-2xs font-body">
          <Tag size={13} className="shrink-0" />
          Have a promo code?
        </div>
        <Button
          as="a"
          href={`/login?next=${encodeURIComponent(loginRedirect)}`}
          variant="text"
          size="sm"
          className="text-orange hover:text-orange-light"
        >
          Sign in
        </Button>
      </div>
    );
  }

  if (appliedPromoCode) {
    return (
      <div className="rounded-xl border border-moss/30 bg-moss/8 px-3 py-2.5 flex items-center justify-between gap-2">
        <input type="hidden" name="promo_code" value={appliedPromoCode.code} />
        <div className="flex items-center gap-2 min-w-0">
          <Tag size={13} className="shrink-0 text-moss" />
          <div className="min-w-0">
            <p className="font-mono font-semibold text-moss text-xs tracking-widest truncate">
              {appliedPromoCode.code}
            </p>
            <p className="font-body text-2xs text-moss/80">
              −AED {promoDiscount.toFixed(2)} applied
            </p>
          </div>
        </div>
        <Button
          as="button"
          type="button"
          variant="text"
          size="icon"
          onClick={() => {
            removePromoCode();
            setCode("");
            setError(null);
          }}
          className="text-moss hover:text-red-500"
          aria-label="Remove promo code"
        >
          <X size={14} />
        </Button>
      </div>
    );
  }

  const handleApply = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setError(null);
    startTransition(async () => {
      const result = await applyPromoCode(trimmed);
      if (!result.ok) {
        setError(result.error);
        trackCouponInvalid(trimmed, result.error);
      } else {
        setCode("");
        trackApplyCoupon({
          code: result.appliedCode.code,
          discount: result.appliedCode.discount,
          discountType: result.appliedCode.discountType,
          scope: result.appliedCode.scope,
        });
      }
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <FormInput
          name="promo_code_input"
          placeholder="Enter promo code"
          value={code}
          onChange={(e) =>
            setCode(
              e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9%_-]/g, "")
                .slice(0, PROMO_CODE_MAX_LENGTH),
            )
          }
          maxLength={PROMO_CODE_MAX_LENGTH}
          onClear={() => setCode("")}
          clearable
          startIcon={<Tag size={13} />}
          className="font-mono tracking-widest uppercase"
          wrapperClassName="flex-1"
          state={error ? "error" : "default"}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
        />
        <Button
          as="button"
          type="button"
          variant="outline"
          size="md"
          onClick={handleApply}
          disabled={isPending || code.trim().length === 0}
        >
          {isPending ? "Applying…" : "Apply"}
        </Button>
      </div>
      {error && <p className="font-body text-2xs text-red-500 px-1">{error}</p>}
    </div>
  );
}
