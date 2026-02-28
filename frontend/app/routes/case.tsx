import React from "react";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DAIL Assistant - Single Case" },
    { name: "description", content: "Welcome to DAIL Assistant!" },
  ];
}

function SingleCasePage() {
  return <div>SingleCasePage</div>;
}

export default SingleCasePage;
