"use client";

import { useRouter } from "next/navigation";
import { GraduationCapIcon, PresentationIcon } from "lucide-react";

import { useRole, type Role } from "@/components/dashboard/RoleProvider";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{
  value: Role;
  label: string;
  icon: typeof GraduationCapIcon;
  home: string;
}> = [
  { value: "teacher", label: "Profesor", icon: PresentationIcon, home: "/overview" },
  { value: "student", label: "Alumno", icon: GraduationCapIcon, home: "/student" },
];

interface RoleSwitcherProps {
  size?: "sm" | "md";
  className?: string;
}

export function RoleSwitcher({ size = "md", className }: RoleSwitcherProps) {
  const { role, setRole, ready } = useRole();
  const router = useRouter();
  const dims = size === "sm"
    ? "h-7 text-[11px] px-2 gap-1"
    : "h-8 text-xs px-2.5 gap-1.5";

  return (
    <div
      role="radiogroup"
      aria-label="Vista demo: alterna profesor o alumno"
      className={cn(
        "inline-flex items-center rounded-full border border-border/70 bg-muted/40 p-0.5 shadow-xs",
        !ready && "opacity-60",
        className,
      )}
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = role === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={!ready}
            onClick={() => {
              if (active) return;
              setRole(opt.value);
              router.push(opt.home);
            }}
            className={cn(
              "inline-flex items-center rounded-full font-medium transition-colors",
              dims,
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className={size === "sm" ? "size-3" : "size-3.5"} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
