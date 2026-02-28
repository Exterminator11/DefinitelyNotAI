import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DAIL Assistant" },
    { name: "description", content: "Welcome to DAIL Assistant!" },
  ];
}

export default function Home() {
  return (
    <>
      <div className="text-2xl font-bold">Home</div>
    </>
  );
}
