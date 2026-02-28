import type { Route } from "./+types/home";
import HomePrompt from "~/components/home/HomePrompt";
import HomeTable from "~/components/home/HomeTable";
import { MOCK_CASES } from "~/mocks/case";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DAIL Assistant" },
    { name: "description", content: "Welcome to DAIL Assistant!" },
  ];
}

export default function Home() {
  return (
    <div className="flex w-full max-w-full flex-1 flex-col gap-10 px-4 md:px-24">
      <HomePrompt />
      <div className="space-y-6">
        <div className="text-2xl font-bold">Home</div>
        <HomeTable
          data={MOCK_CASES as unknown as Array<Record<string, unknown>>}
        />
      </div>
    </div>
  );
}
