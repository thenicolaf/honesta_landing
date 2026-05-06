import { PromoSlider } from "@/sections";
import { getPromoSliderProducts } from "@/lib/promoSliderProducts";
import { cn } from "@/shared/utils/cn";

interface PromoSliderSectionProps {
  /** Hide this product from the slider — pass on the product detail page. */
  excludeId?: string;
  /** Override the eyebrow line. Default: "Top picks & deals" (home variant). */
  kicker?: string;
  /** Override the heading. Default: "Best Offers" (home variant). */
  title?: string;
  /** Set false to drop the `id="promo"` anchor (avoids duplicate ids when embedded outside the home page). */
  withAnchor?: boolean;
  /** Extra classes merged into the header wrapper — e.g. "text-left" on the product page. */
  headerClassName?: string;
  /** Origin marker for product links — controls the "Back to …" label on the product detail page. */
  from?: string;
  /** Full back URL forwarded to nested product links — preserves filter state through chained navigation. */
  backHref?: string;
}

export async function PromoSliderSection({
  excludeId,
  kicker = "Top picks & deals",
  title = "Best Offers",
  withAnchor = true,
  headerClassName,
  from,
  backHref,
}: PromoSliderSectionProps = {}) {
  const products = await getPromoSliderProducts(10, { excludeId });
  if (products.length === 0) return null;

  return (
    <section
      {...(withAnchor ? { id: "promo" } : {})}
      className="bg-cream py-20 md:py-28"
    >
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">
        <div className={cn("mb-10 text-center", headerClassName)}>
          <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-4">
            {kicker}
          </p>
          <h2
            className="font-display font-semibold text-heading leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            {title}
          </h2>
        </div>

        <PromoSlider products={products} from={from} backHref={backHref} />
      </div>
    </section>
  );
}
