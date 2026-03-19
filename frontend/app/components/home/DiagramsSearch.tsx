"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getDiagramsFilters, getDiagramsStats } from "~/api/diagrams";
import { getDashboard } from "~/api/home";
import { getCases } from "~/api/case";
import type { DashboardResponse } from "~/types/dashboard";
import type { ColumnsMap } from "~/api/case";
import { DateRangeFilter } from "~/components/home/DateRangeFilter";
import { FilterField } from "~/components/home/FilterField";
import HomeCharts from "~/components/home/HomeCharts";
import HomeTable from "~/components/home/HomeTable";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";

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

const emptyDateRange: DateRangeValue = { startDate: null, endDate: null };

interface DiagramsSearchProps {
  onHasResults?: (hasResults: boolean) => void;
}

export default function DiagramsSearch({ onHasResults }: DiagramsSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [columns, setColumns] = useState<ColumnsMap>({});
  const [dateColumns, setDateColumns] = useState<string[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [filtersError, setFiltersError] = useState<string | null>(null);
  const fetchStartedRef = useRef(false);

  const [selectedByColumn, setSelectedByColumn] = useState<
    Record<string, string[]>
  >({});
  const [dateRangesByColumn, setDateRangesByColumn] = useState<
    Record<string, DateRangeValue>
  >({});
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [cases, setCases] = useState<Array<Record<string, unknown>>>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || filtersLoaded || fetchStartedRef.current) return;
    fetchStartedRef.current = true;

    let cancelled = false;
    async function fetchFilters() {
      setFiltersLoading(true);
      setFiltersError(null);
      try {
        const data = await getDiagramsFilters();
        if (cancelled) return;
        setColumns(data.columns ?? {});
        setDateColumns(data.date_columns ?? []);

        const colInit: Record<string, string[]> = {};
        for (const key of Object.keys(data.columns ?? {})) colInit[key] = [];
        setSelectedByColumn(colInit);

        const dateInit: Record<string, DateRangeValue> = {};
        for (const key of data.date_columns ?? [])
          dateInit[key] = { ...emptyDateRange };
        setDateRangesByColumn(dateInit);

        setFiltersLoaded(true);
      } catch {
        if (!cancelled) {
          setFiltersError("Failed to load filters.");
          fetchStartedRef.current = false;
        }
      } finally {
        if (!cancelled) setFiltersLoading(false);
      }
    }
    fetchFilters();
    return () => {
      cancelled = true;
    };
  }, [isOpen, filtersLoaded]);

  const columnKeys = Object.keys(columns);

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
      const [chartData, casesData] = await Promise.all([
        hasFilters ? getDiagramsStats(params) : getDashboard(),
        getCases(hasFilters ? params : undefined),
      ]);
      if (
        !chartData ||
        typeof chartData !== "object" ||
        !("chart_data" in chartData)
      ) {
        setStatsError("Server did not return diagram data. Try again.");
        setStats(null);
      } else {
        setStats(chartData as DashboardResponse);
      }
      const fetchedCases = casesData.cases ?? [];
      setCases(fetchedCases);
      onHasResults?.(true);
    } catch {
      setStatsError("Failed to load results.");
      setStats(null);
      setCases([]);
      onHasResults?.(false);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger className="group cursor-pointer gap-2 text-sm text-muted-foreground hover:text-foreground">
        Do you want to use advanced search filters?
        <ChevronDown className="size-4 transition-transform" />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4 flex flex-col gap-4">
        {filtersLoading && (
          <div className="flex items-center justify-center py-6">
            <Spinner className="size-6" />
          </div>
        )}

        {filtersError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {filtersError}
          </div>
        )}

        {filtersLoaded && (
          <>
            {(columnKeys.length > 0 || dateColumns.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {dateColumns.map((columnKey) => {
                  const range =
                    dateRangesByColumn[columnKey] ?? emptyDateRange;
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

            <Button
              onClick={handleProcess}
              disabled={statsLoading}
              className="self-start"
            >
              {statsLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="size-4" />
                  Processing…
                </span>
              ) : (
                "Process"
              )}
            </Button>
          </>
        )}

        {statsError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {statsError}
          </div>
        )}

        {stats && !statsLoading && (
          <div className="mt-2">
            {stats.temporal_data?.lifecycle_summary?.total_cases === 0 ? (
              <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center text-muted-foreground">
                No cases match the selected filters. Try different filter values
                or clear filters and click Process for all results.
              </div>
            ) : (
              <HomeCharts data={stats} />
            )}
          </div>
        )}

        {cases.length > 0 && !statsLoading && (
          <div className="mt-2">
            <HomeTable data={cases} linkColumnKey="Record_Number" />
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
