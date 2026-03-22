import { notFound } from "next/navigation";
import { getAdminProductById } from "@/lib/productsDb";
import { ProductDetailPage } from "@/pages_flow/panel/products/ProductDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getAdminProductById(id);

  if (!product) notFound();

  return <ProductDetailPage product={product} />;
}
