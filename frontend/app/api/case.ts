import { getRequest } from "./baseApi";

export const getCase = async (caseId: string) => {
  return getRequest(`/cases/${caseId}`);
};
