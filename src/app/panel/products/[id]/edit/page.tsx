import { notFound } from "next/navigation";
import { getAdminProductById, getProductFormOptions } from "@/lib/productsDb";
import { EditProductPage } from "@/pages_flow/panel/products/EditProductPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, options] = await Promise.all([
    getAdminProductById(id),
    getProductFormOptions(),
  ]);

  if (!product) notFound();

  return <EditProductPage product={product} options={options} />;
}
