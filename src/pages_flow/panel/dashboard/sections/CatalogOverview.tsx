import { Package, LayoutGrid, Archive, AlertTriangle, Star, Sparkles, Tag } from "lucide-react";
import { StatCard, SectionHeading } from "../ui";
import { getProductStats, getCategoriesCount, getOnPromotionProductsCount } from "../queries";

export async function CatalogOverview() {
  const [products, categoriesTotal, onPromotion] = await Promise.all([
    getProductStats(),
    getCategoriesCount(),
    getOnPromotionProductsCount(),
  ]);

  let published = 0;
  let draft = 0;
  let archived = 0;
  let outOfStock = 0;
  let bestSellers = 0;
  let newProducts = 0;

  for (const p of products) {
    if (p.status === "published") published++;
    else if (p.status === "draft") draft++;
    else if (p.status === "archived") archived++;
    if (p.in_stock === false) outOfStock++;
    if (p.mark === "best_seller") bestSellers++;
    else if (p.mark === "new") newProducts++;
  }

  return (
    <>
      <SectionHeading>Catalog</SectionHeading>
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Package className="w-5 h-5" />}
          label="Published"
          value={published}
          sub={<p className="font-body text-2xs text-earth/40">of {products.length} total</p>}
        />
        <StatCard icon={<Package className="w-5 h-5" />} label="Draft" value={draft} />
        <StatCard icon={<LayoutGrid className="w-5 h-5" />} label="Categories" value={categoriesTotal} />
        <StatCard
          icon={<Archive className="w-5 h-5" />}
          label="Archived"
          value={archived}
          className={archived > 0 ? "border-earth/20" : undefined}
        />
        <StatCard icon={<Star className="w-5 h-5" />} label="Best Sellers" value={bestSellers} />
        <StatCard icon={<Sparkles className="w-5 h-5" />} label="New" value={newProducts} />
        <StatCard icon={<Tag className="w-5 h-5" />} label="On Promotion" value={onPromotion} />
        {outOfStock > 0 && (
          <StatCard
            icon={<AlertTriangle className="w-5 h-5" />}
            label="Out of Stock"
            value={outOfStock}
            className="border-red-200"
          />
        )}
      </section>
    </>
  );
}
