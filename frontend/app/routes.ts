import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("case/:id", "routes/case.tsx"),
] satisfies RouteConfig;
