export interface ChartDataEntry {
  labels: string[];
  data: number[];
}

export interface FilingTrends {
  labels: string[];
  data: number[];
}

export interface LitigationVelocityDistribution {
  labels: string[];
  data: number[];
}

export interface LitigationVelocity {
  average_days: number;
  min_days: number;
  max_days: number;
  distribution: LitigationVelocityDistribution;
}

export interface Staleness {
  active: number;
  stale: number;
  stale_percentage: number;
}

export interface LifecycleSummary {
  total_cases: number;
  earliest_filing: string | null;
  latest_activity: string | null;
  cases_with_dates: number;
}

export interface TemporalData {
  filing_trends?: FilingTrends;
  litigation_velocity?: LitigationVelocity;
  staleness?: Staleness;
  lifecycle_summary?: LifecycleSummary;
}

export interface DashboardResponse {
  chart_data: Record<string, ChartDataEntry>;
  temporal_data?: TemporalData;
}
