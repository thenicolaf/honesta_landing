import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { getAllMovements, getInventoryRows } from "@/lib/inventoryDb";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { HistoryPageInner } from "@/pages_flow/panel/inventory/history/HistoryPage";
import { HistorySkeleton } from "@/pages_flow/panel/inventory/history/HistorySkeleton";

const FILTER_KEYS = [
  "search",
  "reason",
  "product",
  "sortKey",
  "sortDir",
  "page",
  "pageSize",
];
const MULTI_KEYS = ["reason", "product"];

async function HistoryContent() {
  const [movements, inventory] = await Promise.all([
    getAllMovements(1000),
    getInventoryRows(),
  ]);
  const productOptions = inventory
    .map((r) => ({ value: r.product_id, label: r.product_title }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <SearchParamsFilterProvider keys={FILTER_KEYS} multiKeys={MULTI_KEYS}>
      <HistoryPageInner
        movements={movements}
        productOptions={productOptions}
      />
    </SearchParamsFilterProvider>
  );
}

export default function AdminInventoryHistoryPage() {
  return (
    <>
      <div className="mb-6">
        <Button
          href="/panel/inventory"
          variant="outline"
          size="sm"
          startIcon={<ArrowLeft size={14} />}
        >
          Back to inventory
        </Button>
      </div>

      <AdminPageHeader title="Movements history" label="Admin Panel" />

      <Suspense fallback={<HistorySkeleton />}>
        <HistoryContent />
      </Suspense>
    </>
  );
}
