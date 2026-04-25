import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const iconBadgeVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-md border [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        primary:
          "border-primary/20 bg-primary/10 text-primary [.dark_&]:bg-primary/15",
        accent:
          "border-accent/30 bg-accent/15 text-accent-foreground [.dark_&]:text-accent",
        success:
          "border-success/25 bg-success/10 text-success",
        muted: "border-border bg-muted text-muted-foreground",
      },
      size: {
        sm: "size-7 [&_svg]:size-3.5",
        md: "size-9 [&_svg]:size-4",
        lg: "size-11 [&_svg]:size-5",
      },
    },
    defaultVariants: { tone: "primary", size: "md" },
  },
);

interface IconBadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof iconBadgeVariants> {}

function IconBadge({ className, tone, size, ...props }: IconBadgeProps) {
  return (
    <span
      data-slot="icon-badge"
      className={cn(iconBadgeVariants({ tone, size }), className)}
      {...props}
    />
  );
}

export { IconBadge, iconBadgeVariants };
