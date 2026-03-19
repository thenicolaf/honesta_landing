import { getDeliverySettings } from "@/lib/deliveryDb";
import { DeliverySettingsPage } from "@/pages_flow/panel/delivery/DeliverySettingsPage";

export default async function Page() {
  const settings = await getDeliverySettings();
  return <DeliverySettingsPage settings={settings} />;
}
