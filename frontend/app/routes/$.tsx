import type { LoaderFunctionArgs } from "react-router";

const CHROME_DEVTOOLS_PATH = ".well-known/appspecific/com.chrome.devtools.json";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.pathname.endsWith(CHROME_DEVTOOLS_PATH) || url.pathname.includes(".well-known/")) {
    return new Response(null, { status: 204 });
  }
  throw new Response(null, { status: 404 });
}

export default function CatchAll() {
  return null;
}
