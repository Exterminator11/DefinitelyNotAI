import { getRequest } from "./baseApi";

export async function getCases(): Promise<Array<Record<string, unknown>>> {
  return getRequest<Array<Record<string, unknown>>>("/cases");
}

export const getCase = async (caseId: string) => {
  return getRequest(`/case/${caseId}`);
};
