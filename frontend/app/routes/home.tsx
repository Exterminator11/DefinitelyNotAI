import type { Route } from "./+types/home";
import HomeHeader from "~/components/home/HomeHeader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DAIL Assistant" },
    { name: "description", content: "Welcome to DAIL Assistant!" },
  ];
}

export default function Home() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0 ">
        <HomeHeader />
      </div>
    </main>
  );
}
