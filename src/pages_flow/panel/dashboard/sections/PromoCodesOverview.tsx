import { Ticket } from "lucide-react";
import { Card, Badge, CopyText } from "@/shared/ui";
import { formatAed, formatDateTime } from "@/shared/ui/Table";
import { SectionHeading } from "../ui";
import { getActivePromoCodesForDashboard } from "../queries";

export async function PromoCodesOverview() {
  const codes = await getActivePromoCodesForDashboard();

  if (codes.length === 0) return null;

  return (
    <>
      <SectionHeading>Promo Codes</SectionHeading>
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {codes.map((c) => {
          const discountLabel =
            c.discount_type === "percentage"
              ? `${c.discount_value}% off`
              : `${formatAed(c.discount_value)} off`;
          const scopeLabel =
            c.scope === "cart"
              ? "Cart-wide"
              : `${c.product_count} product${c.product_count !== 1 ? "s" : ""}`;
          const usageLabel =
            c.max_uses != null
              ? `Used ${c.used_count} / ${c.max_uses}`
              : `${c.used_count} redemption${c.used_count !== 1 ? "s" : ""}`;
          const perUserLabel =
            c.max_uses_per_user != null ? ` · max ${c.max_uses_per_user}/user` : "";

          return (
            <Card key={c.id}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-xl bg-orange/8 p-2.5 text-orange shrink-0">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <CopyText
                    text={c.code}
                    className="font-body font-bold text-base text-earth tracking-wider min-w-0"
                  >
                    <span className="truncate">{c.code}</span>
                  </CopyText>
                </div>
                <Badge
                  variant={c.status === "active" ? "natural" : "warm"}
                  size="xs"
                  className="shrink-0"
                >
                  {c.status === "active" ? "Active" : "Scheduled"}
                </Badge>
              </div>

              <div className="flex flex-col gap-1">
                <p className="font-body text-sm text-earth">
                  {discountLabel}
                  <span className="text-earth/50"> · {scopeLabel}</span>
                </p>

                {c.min_order_amount != null && (
                  <p className="font-body text-2xs text-earth/50">
                    Min order {formatAed(c.min_order_amount)}
                  </p>
                )}

                <p className="font-body text-2xs text-earth/50">
                  {usageLabel}
                  {perUserLabel}
                </p>

                {c.user_count > 0 && (
                  <p className="font-body text-2xs text-earth/50">
                    Targeted to {c.user_count} user{c.user_count !== 1 ? "s" : ""}
                  </p>
                )}

                {c.stack_with_promotions && (
                  <div className="mt-1">
                    <Badge variant="outline" size="xs">
                      Stacks with promotions
                    </Badge>
                  </div>
                )}

                <p className="font-body text-xs text-earth/30 mt-1">
                  {formatDateTime(c.starts_at)} – {formatDateTime(c.ends_at)}
                </p>
              </div>
            </Card>
          );
        })}
      </section>
    </>
  );
}
