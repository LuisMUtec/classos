import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Custom brand mark — a stacked / tilted glyph suggesting layered intelligence.
 * Replaces the generic Lucide LayersIcon with something the app owns.
 */
function BrandMark({
  className,
  ...props
}: React.ComponentProps<"span"> & { className?: string }) {
  return (
    <span
      data-slot="brand-mark"
      aria-hidden="true"
      className={cn(
        "relative inline-flex size-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm ring-1 ring-primary/40",
        className,
      )}
      {...props}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="size-5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 4 L26 10 L16 16 L6 10 Z"
          fill="currentColor"
          opacity="0.95"
        />
        <path
          d="M6 16 L16 22 L26 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
        <path
          d="M6 22 L16 28 L26 22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
        />
      </svg>
    </span>
  );
}

export { BrandMark };
