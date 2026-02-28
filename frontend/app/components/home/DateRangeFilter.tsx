"use client"

import * as React from "react"
import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"

function formatColumnLabel(key: string): string {
  const withoutSuffix = key.replace(/_[Tt]ext$/, "")
  return withoutSuffix.replace(/_/g, " ")
}

export interface DateRangeFilterProps {
  columnKey: string
  columnLabel: string
  startDate: string | null
  endDate: string | null
  onRangeChange: (startDate: string | null, endDate: string | null) => void
  className?: string
}

export function DateRangeFilter({
  columnKey,
  columnLabel,
  startDate,
  endDate,
  onRangeChange,
  className,
}: DateRangeFilterProps) {
  const displayLabel = columnLabel || formatColumnLabel(columnKey)

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || null
    onRangeChange(value ? value : null, endDate)
  }

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || null
    onRangeChange(startDate, value ? value : null)
  }

  return (
    <div
      className={cn(
        "flex min-w-[200px] flex-col gap-2 rounded-md border bg-muted/30 px-3 py-2",
        className
      )}
    >
      <span className="text-sm font-medium text-foreground">{displayLabel}</span>
      <div className="flex flex-col gap-1.5">
        <label className="text-muted-foreground text-xs">
          From (optional)
        </label>
        <Input
          type="date"
          value={startDate ?? ""}
          onChange={handleStartChange}
          className="h-8 text-sm"
          aria-label={`${displayLabel} start date`}
        />
        <label className="text-muted-foreground text-xs">
          To (optional)
        </label>
        <Input
          type="date"
          value={endDate ?? ""}
          onChange={handleEndChange}
          className="h-8 text-sm"
          aria-label={`${displayLabel} end date`}
        />
      </div>
    </div>
  )
}
