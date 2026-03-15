import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/productsDb";
import { mapDbProducts } from "@/sections/products/utils";
import { ProductDetailPage } from "@/pages_flow/products/ProductDetailPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const dbProduct = await getProductBySlug(id);
  if (!dbProduct) notFound();

  const [product] = mapDbProducts([dbProduct]);

  return <ProductDetailPage product={product} />;
}
