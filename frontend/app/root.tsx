import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import HomeHeader from "./components/home/HomeHeader";
import { TooltipProvider } from "./components/ui/tooltip";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <TooltipProvider>
          <main className="flex flex-col items-center justify-center w-full min-h-screen">
            <HomeHeader />
            <div className="flex-1 flex flex-col items-center gap-16 min-h-0 w-full py-6">
              {children}
            </div>
          </main>
        </TooltipProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center w-full px-4 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-8xl font-bold tracking-tight text-foreground md:text-9xl">
          {message}
        </h1>
        <p className="text-muted-foreground text-lg">{details}</p>
        {stack && (
          <pre className="mt-6 w-full max-w-2xl overflow-x-auto rounded-lg border border-border bg-muted/30 p-4 text-left text-xs">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </main>
  );
}
