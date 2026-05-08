import { Suspense } from "react";
import { ToastFromUrl } from "@/shared/ui";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { getInventoryRows } from "@/lib/inventoryDb";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { InventoryPageInner } from "@/pages_flow/panel/inventory/InventoryPage";
import { InventorySkeleton } from "@/pages_flow/panel/inventory/InventorySkeleton";

async function InventoryContent() {
  const rows = await getInventoryRows();
  return (
    <SearchParamsFilterProvider
      keys={["search", "status", "sortKey", "sortDir", "page", "pageSize"]}
    >
      <InventoryPageInner rows={rows} />
    </SearchParamsFilterProvider>
  );
}

export default function AdminInventoryPage() {
  return (
    <>
      <ToastFromUrl />
      <AdminPageHeader title="Inventory" label="Admin Panel" />

      <Suspense fallback={<InventorySkeleton />}>
        <InventoryContent />
      </Suspense>
    </>
  );
}
