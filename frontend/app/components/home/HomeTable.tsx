import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const CASE_SNUG_COLUMN_KEY = "Case_snug";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 10;
const MAX_CELL_TEXT_LENGTH = 100;

export interface HomeTableProps {
  data: Array<Record<string, unknown>>;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  /** When set, use this column's value (string or number) for row link to /case/:id. When unset, use Case_snug/case_snug. */
  linkColumnKey?: string;
}

function getColumns(data: Array<Record<string, unknown>>): string[] {
  if (data.length === 0) return [];
  const keySet = new Set<string>();
  for (const row of data) {
    for (const key of Object.keys(row)) {
      keySet.add(key);
    }
  }
  const firstRowKeys = Object.keys(data[0] ?? {});
  const ordered = [...firstRowKeys];
  for (const key of keySet) {
    if (!ordered.includes(key)) ordered.push(key);
  }
  return ordered;
}

function formatColumnLabel(key: string): string {
  const withoutSuffix = key.replace(/_[Tt]ext$/, "");
  return withoutSuffix.replace(/_/g, " ");
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const str = String(value);
    if (str.length > MAX_CELL_TEXT_LENGTH) {
      return `${str.slice(0, MAX_CELL_TEXT_LENGTH)}…`;
    }
    return str;
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? "[]" : `[${value.length} items]`;
  }
  if (typeof value === "object") {
    return Object.keys(value).length === 0 ? "{}" : "[Object]";
  }
  const str = String(value);
  if (str.length > MAX_CELL_TEXT_LENGTH) {
    return `${str.slice(0, MAX_CELL_TEXT_LENGTH)}…`;
  }
  return str;
}

function getCaseSnugColumnKey(columns: string[]): string | null {
  const key = columns.find(
    (c) => c === CASE_SNUG_COLUMN_KEY || c === "case_snug"
  );
  return key ?? null;
}

function getLinkColumnKey(
  columns: string[],
  linkColumnKey?: string
): string | null {
  if (linkColumnKey != null) {
    const key = columns.find(
      (c) => c === linkColumnKey || c.toLowerCase() === linkColumnKey.toLowerCase()
    );
    return key ?? null;
  }
  return getCaseSnugColumnKey(columns);
}

function getLinkValue(row: Record<string, unknown>, linkKey: string | null): string | null {
  if (linkKey == null) return null;
  const value = row[linkKey];
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number") return String(value);
  return null;
}

function HomeTable({
  data,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  defaultPageSize,
  linkColumnKey,
}: HomeTableProps) {
  const navigate = useNavigate();
  const initialPageSize =
    defaultPageSize && pageSizeOptions.includes(defaultPageSize)
      ? defaultPageSize
      : pageSizeOptions[0] ?? DEFAULT_PAGE_SIZE;

  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);

  const columns = useMemo(() => getColumns(data), [data]);
  const resolvedLinkKey = useMemo(
    () => getLinkColumnKey(columns, linkColumnKey),
    [columns, linkColumnKey]
  );
  const totalRows = data.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const clampedPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startRow = (clampedPage - 1) * pageSize;
  const endRow = Math.min(startRow + pageSize, totalRows);
  const paginatedRows = useMemo(
    () => data.slice(startRow, endRow),
    [data, startRow, endRow]
  );

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(event.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const goToPrevious = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const goToNext = () => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  };

  const displayPage = totalRows === 0 ? 0 : clampedPage;
  const rangeStart = totalRows === 0 ? 0 : startRow + 1;
  const rangeEnd = totalRows === 0 ? 0 : endRow;

  if (data.length === 0) {
    return (
      <div className="w-full space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>No data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <label htmlFor="home-table-page-size" className="whitespace-nowrap">
            Rows per page:
          </label>
          <select
            id="home-table-page-size"
            value={pageSize}
            onChange={handlePageSizeChange}
            className={cn(
              "h-9 rounded-md border border-input bg-background px-3 py-1 text-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {rangeStart}–{rangeEnd} of {totalRows}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={displayPage <= 1}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={displayPage >= totalPages}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((key) => (
              <TableHead key={key}>{formatColumnLabel(key)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedRows.map((row, rowIndex) => {
            const caseId = getLinkValue(row, resolvedLinkKey);
            const isClickable = caseId != null;

            return (
              <TableRow
                key={startRow + rowIndex}
                className={cn(isClickable && "cursor-pointer")}
                onClick={
                  isClickable
                    ? () => navigate(`/case/${caseId}`)
                    : undefined
                }
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={
                  isClickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/case/${caseId}`);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((key) => (
                  <TableCell key={key}>
                    {formatCellValue(row[key])}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default HomeTable;
