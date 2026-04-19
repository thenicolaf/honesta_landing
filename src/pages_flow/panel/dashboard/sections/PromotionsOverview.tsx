import { Tag } from "lucide-react";
import { Card, Badge } from "@/shared/ui";
import { formatDateTime } from "@/shared/ui/Table";
import { SectionHeading } from "../ui";
import { getActivePromotions } from "../queries";

export async function PromotionsOverview() {
  const data = await getActivePromotions();

  const promotions = data.map((p) => ({
    id: p.id,
    name: p.name,
    discount_type: p.discount_type,
    discount_value: Number(p.discount_value),
    ends_at: p.ends_at,
    product_count: (p.promotion_products as { product_id: string }[])?.length ?? 0,
  }));

  if (promotions.length === 0) return null;

  return (
    <>
      <SectionHeading>Active Promotions</SectionHeading>
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {promotions.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-orange/8 p-2.5 text-orange shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-body font-semibold text-sm text-earth">{p.name}</p>
                  <p className="font-body text-2xs text-earth/50 mt-0.5">
                    {p.discount_type === "percentage" ? `${p.discount_value}% off` : `AED ${p.discount_value} off`}
                    {" · "}{p.product_count} product{p.product_count !== 1 ? "s" : ""}
                  </p>
                  <p className="font-body text-xs text-earth/30 mt-1">
                    Ends {formatDateTime(p.ends_at)}
                  </p>
                </div>
              </div>
              <Badge variant="natural" size="xs">Active</Badge>
            </div>
          </Card>
        ))}
      </section>
    </>
  );
}
