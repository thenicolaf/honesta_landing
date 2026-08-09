import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumbs, Skeleton } from "@/shared/ui";
import { ProductGridSkeleton } from "@/sections/products/ProductGridSkeleton";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { ProductsSection } from "@/pages_flow/shop";
import { TrustMarks } from "@/sections";
import { getCategoryBySlug } from "@/lib/categoriesDb";
import { getPublishedProducts } from "@/lib/productsDb";
import { getCategorySeo } from "../categorySeo";
import {
  buildCategoryCollectionJsonLd,
  buildCategoryBreadcrumbJsonLd,
} from "./structured-data";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const siteUrl = process.env.PUBLIC_BASE_URL!;
  const url = `${siteUrl}/shop/${category.slug}`;
  const seo = getCategorySeo(category.slug);
  const title = seo ? seo.title : `${category.name} — HONESTA`;
  const description =
    seo?.description ||
    category.description ||
    `${category.name}. ${category.tagline}`.trim();

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "HONESTA",
      locale: "en_US",
      type: "website",
      images: [{ url: category.image_url || "/og-image.webp" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [category.image_url || "/og-image.webp"],
    },
  };
}

function ProductsSkeleton() {
  return (
    <div className="bg-cream pt-8 pb-20 md:pt-10 md:pb-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-10 flex items-center gap-3">
          <Skeleton className="h-9 grow" />
        </div>
        <ProductGridSkeleton count={6} />
      </div>
    </div>
  );
}

async function CategoryStructuredData({
  slug,
  siteUrl,
}: {
  slug: string;
  siteUrl: string;
}) {
  const [category, products] = await Promise.all([
    getCategoryBySlug(slug),
    getPublishedProducts(),
  ]);
  if (!category) return null;

  const inCategory = products.filter((p) => p.categories?.slug === slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCategoryCollectionJsonLd(category, inCategory, siteUrl),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCategoryBreadcrumbJsonLd(category, siteUrl),
          ),
        }}
      />
    </>
  );
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const siteUrl = process.env.PUBLIC_BASE_URL!;

  return (
    <main className="grow min-h-160">
      <TrustMarks />

      <section className="bg-cream pt-12 md:pt-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              { label: category.name },
            ]}
            className="mb-6"
          />

          <div className="max-w-3xl">
            <h1
              className="font-display font-bold italic text-heading leading-tight mb-3"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              {category.name}
            </h1>
            {category.tagline && (
              <p className="font-display italic text-earth/60 text-lg lg:text-xl mb-4">
                {category.tagline}
              </p>
            )}
            {category.description && (
              <p className="font-body font-light text-earth/70 text-base lg:text-lg leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <SearchParamsFilterProvider keys={["sort", "search", "mark"]}>
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsSection fixedCategory={slug} hideHeader />
        </Suspense>
      </SearchParamsFilterProvider>

      <Suspense fallback={null}>
        <CategoryStructuredData slug={slug} siteUrl={siteUrl} />
      </Suspense>
    </main>
  );
}
