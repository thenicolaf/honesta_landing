import { getProductFormOptions } from "@/lib/productsDb";
import { CreateProductPage } from "@/pages_flow/panel/products/CreateProductPage";

export default async function Page() {
  const options = await getProductFormOptions();
  return <CreateProductPage options={options} />;
}
