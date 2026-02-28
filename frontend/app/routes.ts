import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("all", "routes/all.tsx"),
  route("chat", "routes/chat.tsx"),
  route("diagrams", "routes/diagrams.tsx"),
  route("case/:id", "routes/case.tsx"),
  route("*", "routes/$.tsx"),
] satisfies RouteConfig;
