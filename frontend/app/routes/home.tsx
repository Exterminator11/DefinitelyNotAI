import { useState } from "react";
import { useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/home";
import { getDashboard } from "~/api/home";
import HomeCharts from "~/components/home/HomeCharts";
import HomePrompt from "~/components/home/HomePrompt";
import DiagramsSearch from "~/components/home/DiagramsSearch";
import { Spinner } from "~/components/ui/spinner";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DAIL Assistant" },
    { name: "description", content: "Welcome to DAIL Assistant!" },
  ];
}

export async function loader(): Promise<{
  dashboard: Awaited<ReturnType<typeof getDashboard>> | null;
  dashboardError: string | null;
}> {
  try {
    const dashboard = await getDashboard();
    return { dashboard, dashboardError: null };
  } catch {
    return { dashboard: null, dashboardError: "Failed to load dashboard." };
  }
}

export default function Home() {
  const { dashboard, dashboardError } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const [hasSearchResults, setHasSearchResults] = useState(false);

  return (
    <div className="flex w-full max-w-full flex-1 flex-col gap-10 px-4 md:px-24">
      <HomePrompt />
      <DiagramsSearch onHasResults={setHasSearchResults} />
      {!hasSearchResults &&
        (isLoading ? (
          <div className="flex min-h-[200px] w-full items-center justify-center">
            <Spinner className="size-8" />
          </div>
        ) : (
          <>
            {dashboardError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {dashboardError}
              </div>
            )}
            <HomeCharts data={dashboard} />
          </>
        ))}
    </div>
  );
}
