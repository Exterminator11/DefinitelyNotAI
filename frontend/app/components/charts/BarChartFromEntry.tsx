import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { ChartDataEntry } from "~/types/dashboard";

const BAR_CHART_TOP_N = 20;

const barChartConfig = {
  value: {
    label: "Count",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function buildBarChartData(
  entry: ChartDataEntry,
): Array<{ name: string; value: number }> {
  const { labels, data } = entry;
  const combined = labels.map((name, i) => ({ name, value: data[i] ?? 0 }));
  const sorted = [...combined].sort((a, b) => b.value - a.value);
  return sorted.slice(0, BAR_CHART_TOP_N);
}

export interface BarChartFromEntryProps {
  entry: ChartDataEntry;
  title?: string;
}

export function BarChartFromEntry({ entry, title }: BarChartFromEntryProps) {
  const chartData = useMemo(() => buildBarChartData(entry), [entry]);
  if (chartData.length === 0) return null;
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ChartContainer config={barChartConfig} className="min-h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                value.length > 20 ? `${value.slice(0, 17)}...` : value
              }
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
