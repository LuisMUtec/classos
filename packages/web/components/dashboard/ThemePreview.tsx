"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Claro", icon: SunIcon },
  { value: "dark", label: "Oscuro", icon: MoonIcon },
  { value: "system", label: "Sistema", icon: MonitorIcon },
] as const;

export function ThemePreview() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={selected}
            className={cn(
              "group/theme relative flex flex-col gap-2 rounded-lg border bg-background p-3 text-left transition-colors",
              selected
                ? "border-primary ring-2 ring-primary/30"
                : "hover:border-primary/30",
            )}
          >
            <div
              aria-hidden="true"
              className={cn(
                "flex h-16 items-end overflow-hidden rounded-md ring-1 ring-border",
                value === "light" && "bg-[oklch(0.99_0.003_280)]",
                value === "dark" && "bg-[oklch(0.15_0.012_280)]",
                value === "system" &&
                  "bg-gradient-to-r from-[oklch(0.99_0.003_280)] to-[oklch(0.15_0.012_280)]",
              )}
            >
              <div className="m-1.5 flex w-full gap-1">
                <span className="h-2 w-6 rounded-full bg-primary" />
                <span className="h-2 w-3 rounded-full bg-accent" />
                <span className="h-2 flex-1 rounded-full bg-muted-foreground/20" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Icon className="size-3.5" />
                {label}
              </span>
              {selected && (
                <CheckIcon className="size-3.5 text-primary" aria-hidden="true" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
