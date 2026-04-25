import * as React from "react";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { IconBadge } from "@/components/ui/icon-badge";

interface StatCardProps extends React.ComponentProps<"div"> {
  label: string;
  value: string | number;
  hint?: string;
  delta?: { value: string; tone?: "positive" | "neutral" | "negative" };
  icon?: React.ReactNode;
  href?: string;
  external?: boolean;
}

function StatCard({
  label,
  value,
  hint,
  delta,
  icon,
  href,
  external,
  className,
  ...props
}: StatCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        {icon && <IconBadge size="md">{icon}</IconBadge>}
        {href && (
          <span className="text-muted-foreground transition-colors group-hover/card:text-foreground">
            {external ? (
              <ArrowUpRightIcon className="size-4" />
            ) : (
              <ArrowRightIcon className="size-4" />
            )}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p
          data-tabular
          className="text-2xl font-semibold tracking-tight text-foreground"
        >
          {value}
        </p>
        {(hint || delta) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {delta && (
              <span
                className={cn(
                  "rounded px-1 py-px font-medium",
                  delta.tone === "positive" &&
                    "bg-success/10 text-success",
                  delta.tone === "negative" &&
                    "bg-destructive/10 text-destructive",
                  (!delta.tone || delta.tone === "neutral") &&
                    "bg-muted text-muted-foreground",
                )}
              >
                {delta.value}
              </span>
            )}
            {hint && <span className="text-muted-foreground">{hint}</span>}
          </div>
        )}
      </div>
    </>
  );

  const cls = cn(
    "group/card flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs transition-colors",
    href && "hover:border-primary/30 hover:bg-card",
    className,
  );

  if (href) {
    if (external) {
      return (
        <a
          data-slot="stat-card"
          href={href}
          target="_blank"
          rel="noreferrer"
          className={cls}
          {...(props as React.ComponentProps<"a">)}
        >
          {body}
        </a>
      );
    }
    return (
      <Link data-slot="stat-card" href={href} className={cls}>
        {body}
      </Link>
    );
  }

  return (
    <div data-slot="stat-card" className={cls} {...props}>
      {body}
    </div>
  );
}

export { StatCard };
