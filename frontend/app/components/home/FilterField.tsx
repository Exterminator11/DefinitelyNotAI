"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

function formatColumnLabel(key: string): string {
  const withoutSuffix = key.replace(/_[Tt]ext$/, "")
  return withoutSuffix.replace(/_/g, " ")
}

export interface FilterFieldProps {
  columnKey: string
  columnLabel: string
  options: { labels: string[]; data: number[] }
  selected: string[]
  onSelectedChange: (selected: string[]) => void
}

export function FilterField({
  columnKey,
  columnLabel,
  options,
  selected,
  onSelectedChange,
}: FilterFieldProps) {
  const [open, setOpen] = React.useState(false)
  const displayLabel = columnLabel || formatColumnLabel(columnKey)
  const { labels, data } = options

  const toggleValue = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((s) => s !== value)
      : [...selected, value]
    onSelectedChange(next)
  }

  if (labels.length === 0) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full min-w-[180px] justify-between font-normal"
        >
          <span className="truncate">
            {selected.length === 0
              ? displayLabel
              : `${displayLabel} (${selected.length} selected)`}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {labels.map((value, i) => {
                const count = data[i] ?? 0
                const isSelected = selected.includes(value)
                return (
                  <CommandItem
                    key={`${columnKey}-${value}-${i}`}
                    value={`${value} (${count})`}
                    onSelect={() => toggleValue(value)}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input"
                      )}
                    >
                      {isSelected ? <CheckIcon className="size-3" /> : null}
                    </span>
                    {value} ({count})
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
