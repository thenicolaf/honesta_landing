import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { getProfitClientData } from "../profitQueries";
import { ProfitOverviewInner } from "./ProfitOverviewInner";

const FILTER_KEYS = ["range"];

export async function ProfitOverview() {
  const data = await getProfitClientData();

  return (
    <SearchParamsFilterProvider keys={FILTER_KEYS}>
      <ProfitOverviewInner data={data} />
    </SearchParamsFilterProvider>
  );
}
