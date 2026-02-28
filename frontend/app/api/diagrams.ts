import { getRequest } from "./baseApi";
import type { ColumnsMap } from "./case";
import type { DashboardResponse } from "~/types/dashboard";

export type GetDiagramsFiltersResponse = {
  columns: ColumnsMap;
  date_columns: string[];
};

export async function getDiagramsFilters(): Promise<GetDiagramsFiltersResponse> {
  const response = await getRequest<GetDiagramsFiltersResponse>("/diagrams");
  return {
    columns: response.columns ?? {},
    date_columns: response.date_columns ?? [],
  };
}

export async function getDiagramsStats(
  searchParams: URLSearchParams | string,
): Promise<DashboardResponse> {
  const params =
    typeof searchParams === "string"
      ? new URLSearchParams(searchParams)
      : searchParams;
  const query = params.toString();
  if (!query) {
    return getRequest<DashboardResponse>("/diagrams");
  }
  const paramsObj = Object.fromEntries(params.entries());
  return getRequest<DashboardResponse>("/diagrams", { params: paramsObj });
}
