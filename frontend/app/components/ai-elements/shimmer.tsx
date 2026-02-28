"use client";

import type { HTMLAttributes } from "react";

import { cn } from "~/lib/utils";

export interface TextShimmerProps extends HTMLAttributes<HTMLSpanElement> {
  children: string;
  duration?: number;
  spread?: number;
}

export const Shimmer = ({
  children,
  className,
  ...props
}: TextShimmerProps) => (
  <span
    className={cn(
      "inline-block animate-pulse text-muted-foreground",
      className
    )}
    {...props}
  >
    {children}
  </span>
);
