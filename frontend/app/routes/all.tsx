import { useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/all";
import { LayoutList } from "lucide-react";
import { getCases } from "~/api/case";
import HomeTable from "~/components/home/HomeTable";
import { Spinner } from "~/components/ui/spinner";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DAIL Assistant - All Cases" },
    { name: "description", content: "Browse all cases" },
  ];
}

export async function loader(): Promise<{
  cases: Awaited<ReturnType<typeof getCases>>;
  casesError: string | null;
}> {
  try {
    const cases = await getCases();
    return { cases, casesError: null };
  } catch {
    return { cases: [], casesError: "Failed to load cases." };
  }
}

export default function AllCasesPage() {
  const { cases, casesError } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

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
          <HomeTable
            data={cases}
            linkColumnKey="Record_Number"
          />
        </>
      )}
    </div>
  );
}
