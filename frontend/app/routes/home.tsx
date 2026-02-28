import type { Route } from "./+types/home";
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
    <div className="w-full max-w-full px-4 md:px-24 space-y-6">
      <div className="text-2xl font-bold">Home</div>
      <HomeTable data={MOCK_CASES as unknown as Array<Record<string, unknown>>} />
    </div>
  );
}
