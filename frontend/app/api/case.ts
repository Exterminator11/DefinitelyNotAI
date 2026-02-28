import { getRequest } from "./baseApi";

export type ColumnsMap = Record<
  string,
  { labels: string[]; data: number[] }
>;

export type GetCasesResponse = {
  cases: Array<Record<string, unknown>>;
  columns: ColumnsMap;
  date_columns: string[];
};

export async function getCases(): Promise<GetCasesResponse> {
  const response = await getRequest<GetCasesResponse | Array<Record<string, unknown>>>("/cases");
  if (Array.isArray(response)) {
    return { cases: response, columns: {}, date_columns: [] };
  }
  return {
    cases: response.cases,
    columns: response.columns,
    date_columns: response.date_columns ?? [],
  };
}

export const getCase = async (caseId: string) => {
  return getRequest(`/case/${caseId}`);
};
