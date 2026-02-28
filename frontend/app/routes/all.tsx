import { useRef } from "react";
import { useLoaderData, useNavigation, useSearchParams } from "react-router";
import type { Route } from "./+types/all";
import { ChevronDownIcon, LayoutList } from "lucide-react";
import { getCases, type ColumnsMap } from "~/api/case";
import { DateRangeFilter } from "~/components/home/DateRangeFilter";
import { FilterField } from "~/components/home/FilterField";
import HomeTable from "~/components/home/HomeTable";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DAIL Assistant - All Cases" },
    { name: "description", content: "Browse all cases" },
  ];
}

export type DateRangeValue = { startDate: string | null; endDate: string | null };

function paramsToFilterState(
  params: URLSearchParams,
  columnKeys: string[],
  dateColumnKeys: string[]
): {
  selectedByColumn: Record<string, string[]>;
  dateRangesByColumn: Record<string, DateRangeValue>;
} {
  const selectedByColumn: Record<string, string[]> = {};
  for (const key of columnKeys) {
    const val = params.get(key);
    selectedByColumn[key] = val ? val.split(",").map((s) => s.trim()).filter(Boolean) : [];
  }
  const dateRangesByColumn: Record<string, DateRangeValue> = {};
  for (const key of dateColumnKeys) {
    dateRangesByColumn[key] = {
      startDate: params.get(`${key}_start`) ?? null,
      endDate: params.get(`${key}_end`) ?? null,
    };
  }
  return { selectedByColumn, dateRangesByColumn };
}

function filterStateToParams(
  selectedByColumn: Record<string, string[]>,
  dateRangesByColumn: Record<string, DateRangeValue>
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

export async function loader({
  request,
}: Route.LoaderArgs): Promise<{
  cases: Array<Record<string, unknown>>;
  columns: ColumnsMap;
  date_columns: string[];
  casesError: string | null;
}> {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.toString();
    const data = await getCases(query ? url.searchParams : undefined);
    return {
      cases: data.cases,
      columns: data.columns ?? {},
      date_columns: data.date_columns ?? [],
      casesError: null,
    };
  } catch {
    return {
      cases: [],
      columns: {},
      date_columns: [],
      casesError: "Failed to load cases.",
    };
  }
}

export default function AllCasesPage() {
  const loaderData = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  const initialFilterMetaRef = useRef<{
    columns: ColumnsMap;
    date_columns: string[];
  } | null>(null);

  const loaderColumns = loaderData.columns ?? {};
  const loaderDateColumns = loaderData.date_columns ?? [];
  if (
    initialFilterMetaRef.current === null &&
    (Object.keys(loaderColumns).length > 0 || loaderDateColumns.length > 0)
  ) {
    initialFilterMetaRef.current = {
      columns: loaderColumns,
      date_columns: loaderDateColumns,
    };
  }

  const columns = initialFilterMetaRef.current?.columns ?? loaderData.columns;
  const date_columns =
    initialFilterMetaRef.current?.date_columns ?? loaderData.date_columns;
  const cases = loaderData.cases;
  const casesError = loaderData.casesError;

  const columnKeys = Object.keys(columns);
  const { selectedByColumn, dateRangesByColumn } = paramsToFilterState(
    searchParams,
    columnKeys,
    date_columns
  );

  const handleColumnSelectionChange = (columnKey: string) => (
    selected: string[]
  ) => {
    const next = { ...selectedByColumn, [columnKey]: selected };
    setSearchParams(filterStateToParams(next, dateRangesByColumn));
  };

  const handleDateRangeChange = (columnKey: string) => (
    startDate: string | null,
    endDate: string | null
  ) => {
    const next = {
      ...dateRangesByColumn,
      [columnKey]: { startDate, endDate },
    };
    setSearchParams(filterStateToParams(selectedByColumn, next));
  };

  return (
    <div className="flex w-full max-w-full flex-1 flex-col gap-6 px-4 md:px-24">
      <div className="flex items-center gap-2">
        <LayoutList className="size-7 text-primary" aria-hidden />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          All Cases
        </h1>
      </div>
      {isLoading ? (
        <div className="flex min-h-[200px] w-full items-center justify-center">
          <Spinner className="size-8" />
        </div>
      ) : (
        <>
          {casesError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {casesError}
            </div>
          )}
          {(Object.keys(columns).length > 0 || date_columns.length > 0) && (
            <Collapsible className="rounded-md border">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-4 py-3 [&[data-state=open]>svg]:rotate-180"
                >
                  Filters
                  <ChevronDownIcon
                    className="size-4 shrink-0 opacity-50 transition-transform"
                    aria-hidden
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-wrap gap-2 border-t px-4 py-3">
                  {date_columns.map((columnKey) => {
                    const range = dateRangesByColumn[columnKey] ?? {
                      startDate: null,
                      endDate: null,
                    };
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
              </CollapsibleContent>
            </Collapsible>
          )}
          <HomeTable
            data={cases}
            linkColumnKey="Record_Number"
          />
        </>
      )}
    </div>
  );
}
