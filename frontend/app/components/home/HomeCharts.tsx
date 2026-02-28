import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type {
  DashboardResponse,
  ChartDataEntry,
  FilingTrends,
  LitigationVelocity,
  Staleness,
  LifecycleSummary,
} from "~/types/dashboard";

const BAR_CHART_TOP_N = 20;

function humanizeChartKey(key: string): string {
  return key.replace(/_/g, " ");
}

function buildBarChartData(entry: ChartDataEntry): Array<{ name: string; value: number }> {
  const { labels, data } = entry;
  const combined = labels.map((name, i) => ({ name, value: data[i] ?? 0 }));
  const sorted = [...combined].sort((a, b) => b.value - a.value);
  return sorted.slice(0, BAR_CHART_TOP_N);
}

const barChartConfig = {
  value: {
    label: "Count",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function BarChartCard({
  title,
  entry,
}: {
  title: string;
  entry: ChartDataEntry;
}) {
  const chartData = useMemo(() => buildBarChartData(entry), [entry]);
  if (chartData.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={barChartConfig} className="min-h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
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

const filingTrendsConfig = {
  count: {
    label: "Filings",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function FilingTrendsChart({ data: trends }: { data: FilingTrends }) {
  const chartData = useMemo(
    () =>
      trends.labels.map((label, i) => ({
        year: label,
        count: trends.data[i] ?? 0,
      })),
    [trends]
  );
  if (chartData.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filing trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={filingTrendsConfig} className="min-h-[250px] w-full">
          <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--color-count)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const distributionConfig = {
  value: {
    label: "Cases",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function LitigationVelocityChart({ data: velocity }: { data: LitigationVelocity }) {
  const { distribution } = velocity;
  const chartData = useMemo(
    () =>
      distribution.labels.map((name, i) => ({
        name,
        value: distribution.data[i] ?? 0,
      })),
    [distribution]
  );
  if (chartData.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Litigation velocity (distribution)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={distributionConfig} className="min-h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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

const stalenessConfig = {
  active: {
    label: "Active",
    color: "var(--chart-1)",
  },
  stale: {
    label: "Stale",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function StalenessChart({ data: staleness }: { data: Staleness }) {
  const chartData = useMemo(
    () => [
      { name: "active", value: staleness.active, fill: "var(--color-active)" },
      { name: "stale", value: staleness.stale, fill: "var(--color-stale)" },
    ],
    [staleness]
  );
  const total = staleness.active + staleness.stale;
  if (total === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Case staleness</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={stalenessConfig} className="min-h-[250px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              label={({ name, value }) =>
                `${name}: ${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`
              }
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={chartData[index].fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const CHART_MIN_HEIGHT = 250;

function formatReadableDate(dateStr: string | null | undefined): string {
  if (dateStr == null || String(dateStr).trim() === "") return "—";
  const date = new Date(dateStr.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return String(dateStr);
  const day = date.getDate();
  const ordinal =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();
  return `${month} ${day}${ordinal} ${year}`;
}

function LifecycleSummaryCards({ data: summary }: { data: LifecycleSummary }) {
  return (
    <div className="grid h-full min-h-[250px] grid-cols-2 grid-rows-2 gap-3 md:gap-4">
      <Card className="flex flex-col justify-center p-4 md:p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground md:text-sm">
          Total cases
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums md:text-3xl lg:text-4xl">
          {summary.total_cases.toLocaleString()}
        </p>
      </Card>
      <Card className="flex flex-col justify-center p-4 md:p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground md:text-sm">
          Cases with dates
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums md:text-3xl lg:text-4xl">
          {summary.cases_with_dates.toLocaleString()}
        </p>
      </Card>
      <Card className="flex flex-col justify-center p-4 md:p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground md:text-sm">
          Earliest filing
        </p>
        <p className="mt-1 text-lg font-medium md:text-xl lg:text-2xl">
          {formatReadableDate(summary.earliest_filing)}
        </p>
      </Card>
      <Card className="flex flex-col justify-center p-4 md:p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground md:text-sm">
          Latest activity
        </p>
        <p className="mt-1 text-lg font-medium md:text-xl lg:text-2xl">
          {formatReadableDate(summary.latest_activity)}
        </p>
      </Card>
    </div>
  );
}

export interface HomeChartsProps {
  data: DashboardResponse | null;
}

export default function HomeCharts({ data }: HomeChartsProps) {
  if (!data) return null;

  const chartDataEntries = Object.entries(data.chart_data ?? {});
  const temporal = data.temporal_data;
  const hasTemporal =
    temporal &&
    (temporal.filing_trends ||
      temporal.litigation_velocity ||
      temporal.staleness ||
      temporal.lifecycle_summary);
  const hasCharts = chartDataEntries.length > 0 || hasTemporal;

  if (!hasCharts) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
        No chart data available.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {temporal?.lifecycle_summary && (
          <div className="h-full min-h-[250px]">
            <LifecycleSummaryCards data={temporal.lifecycle_summary} />
          </div>
        )}
        {temporal?.filing_trends && (
          <FilingTrendsChart data={temporal.filing_trends} />
        )}
        {temporal?.litigation_velocity && (
          <LitigationVelocityChart data={temporal.litigation_velocity} />
        )}
        {temporal?.staleness && (
          <StalenessChart data={temporal.staleness} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {chartDataEntries.map(([key, entry]) => (
          <BarChartCard
            key={key}
            title={humanizeChartKey(key)}
            entry={entry}
          />
        ))}
      </div>
    </div>
  );
}
