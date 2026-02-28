import { useState } from "react";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/diagrams";
import { BarChart2 } from "lucide-react";
import { getDiagramsFilters, getDiagramsStats } from "~/api/diagrams";
import { getDashboard } from "~/api/home";
import type { DashboardResponse } from "~/types/dashboard";
import { DateRangeFilter } from "~/components/home/DateRangeFilter";
import { FilterField } from "~/components/home/FilterField";
import HomeCharts from "~/components/home/HomeCharts";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DAIL Assistant - Diagrams" },
    { name: "description", content: "View filtered statistics and diagrams" },
  ];
}

type DateRangeValue = { startDate: string | null; endDate: string | null };

function filterStateToParams(
  selectedByColumn: Record<string, string[]>,
  dateRangesByColumn: Record<string, DateRangeValue>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, values] of Object.entries(selectedByColumn)) {
    if (values.length > 0) params.set(key, values.join(","));
  }
  for (const [key, range] of Object.entries(dateRangesByColumn)) {
    if (range.startDate) params.set(`${key}_start`, range.startDate);
    if (range.endDate) params.set(`${key}_end`, range.endDate);
  }
  return params;
}

export async function loader(): Promise<{
  columns: Record<string, { labels: string[]; data: number[] }>;
  date_columns: string[];
  filtersError: string | null;
}> {
  try {
    const data = await getDiagramsFilters();
    return {
      columns: data.columns,
      date_columns: data.date_columns,
      filtersError: null,
    };
  } catch {
    return {
      columns: {},
      date_columns: [],
      filtersError: "Failed to load filters.",
    };
  }
}

const emptyDateRange: DateRangeValue = { startDate: null, endDate: null };

export default function DiagramsPage() {
  const { columns, date_columns, filtersError } =
    useLoaderData<typeof loader>();
  const columnKeys = Object.keys(columns);
  const [selectedByColumn, setSelectedByColumn] = useState<
    Record<string, string[]>
  >(() => {
    const out: Record<string, string[]> = {};
    for (const key of columnKeys) out[key] = [];
    return out;
  });
  const [dateRangesByColumn, setDateRangesByColumn] = useState<
    Record<string, DateRangeValue>
  >(() => {
    const out: Record<string, DateRangeValue> = {};
    for (const key of date_columns) out[key] = { ...emptyDateRange };
    return out;
  });
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const handleColumnSelectionChange =
    (columnKey: string) => (selected: string[]) => {
      setSelectedByColumn((prev) => ({ ...prev, [columnKey]: selected }));
    };

  const handleDateRangeChange =
    (columnKey: string) =>
    (startDate: string | null, endDate: string | null) => {
      setDateRangesByColumn((prev) => ({
        ...prev,
        [columnKey]: { startDate, endDate },
      }));
    };

  const handleProcess = async () => {
    setStatsError(null);
    setStatsLoading(true);
    try {
      const params = filterStateToParams(selectedByColumn, dateRangesByColumn);
      const hasFilters = params.toString().length > 0;
      const data = hasFilters
        ? await getDiagramsStats(params)
        : await getDashboard();
      if (!data || typeof data !== "object" || !("chart_data" in data)) {
        setStatsError("Server did not return diagram data. Try again.");
        setStats(null);
      } else {
        setStats(data as DashboardResponse);
      }
    } catch {
      setStatsError("Failed to load diagrams.");
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-full flex-1 flex-col gap-6 px-4 md:px-24">
      <div className="flex items-center gap-2">
        <BarChart2 className="size-7 text-primary" aria-hidden />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Diagrams
        </h1>
      </div>
      {filtersError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {filtersError}
        </div>
      )}
      {(columnKeys.length > 0 || date_columns.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {date_columns.map((columnKey) => {
            const range = dateRangesByColumn[columnKey] ?? emptyDateRange;
            return (
              <DateRangeFilter
                key={columnKey}
                columnKey={columnKey}
                columnLabel={columnKey}
                startDate={range.startDate}
                endDate={range.endDate}
                onRangeChange={handleDateRangeChange(columnKey)}
              />
            );
          })}
          {Object.entries(columns).map(([columnKey, options]) => (
            <FilterField
              key={columnKey}
              columnKey={columnKey}
              columnLabel={columnKey}
              options={options}
              selected={selectedByColumn[columnKey] ?? []}
              onSelectedChange={handleColumnSelectionChange(columnKey)}
            />
          ))}
        </div>
      )}
      <Button onClick={handleProcess} disabled={statsLoading}>
        {statsLoading ? (
          <span className="inline-flex items-center gap-2">
            <Spinner className="size-4" />
            Processing…
          </span>
        ) : (
          "Process"
        )}
      </Button>
      {statsError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {statsError}
        </div>
      )}
      {stats && !statsLoading && (
        <div className="mt-4">
          {stats.temporal_data?.lifecycle_summary?.total_cases === 0 ? (
            <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center text-muted-foreground">
              No cases match the selected filters. Try different filter values or clear filters and click Process for all results.
            </div>
          ) : (
            <HomeCharts data={stats} />
          )}
        </div>
      )}
    </div>
  );
}
