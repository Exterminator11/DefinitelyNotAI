import { getRequest } from "~/api/baseApi";
import type { DashboardResponse } from "~/types/dashboard";

const DASHBOARD_PATH = "/dashboard";

export async function getDashboard(): Promise<DashboardResponse> {
  return getRequest<DashboardResponse>(DASHBOARD_PATH);
}
