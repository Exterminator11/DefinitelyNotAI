import { useState } from "react";
import { useLoaderData, useNavigation } from "react-router";
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

export async function loader(): Promise<{
  cases: Array<Record<string, unknown>>;
  columns: ColumnsMap;
  date_columns: string[];
  casesError: string | null;
}> {
  try {
    const { cases, columns, date_columns } = await getCases();
    return { cases, columns, date_columns, casesError: null };
  } catch {
    return {
      cases: [],
      columns: {},
      date_columns: [],
      casesError: "Failed to load cases.",
    };
  }
}

export type DateRangeValue = { startDate: string | null; endDate: string | null };

export default function AllCasesPage() {
  const { cases, columns, date_columns, casesError } =
    useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const [selectedByColumn, setSelectedByColumn] = useState<
    Record<string, string[]>
  >({});
  const [dateRangesByColumn, setDateRangesByColumn] = useState<
    Record<string, DateRangeValue>
  >({});

  const handleColumnSelectionChange = (columnKey: string) => (
    selected: string[]
  ) => {
    setSelectedByColumn((prev) => ({ ...prev, [columnKey]: selected }));
  };

  const handleDateRangeChange = (columnKey: string) => (
    startDate: string | null,
    endDate: string | null
  ) => {
    setDateRangesByColumn((prev) => ({
      ...prev,
      [columnKey]: { startDate, endDate },
    }));
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
