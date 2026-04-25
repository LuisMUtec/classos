"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ExternalLinkIcon,
} from "lucide-react";

import { BrandMark } from "@/components/dashboard/BrandMark";
import { RoleSwitcher } from "@/components/dashboard/RoleSwitcher";
import { useRole } from "@/components/dashboard/RoleProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAdvancedSection, getNavForRole, type NavSection } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const { role } = useRole();
  const sections = getNavForRole(role);
  const advanced = getAdvancedSection();

  return (
    <aside className="hidden shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:w-64 md:flex-col">
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-3.5">
        <BrandMark />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold">ClassOS</span>
          <span className="truncate text-[11px] text-sidebar-foreground/60">
            {role === "teacher" ? "vista profesor" : "vista alumno"}
          </span>
        </div>
      </div>

      <div className="border-b border-sidebar-border px-3.5 py-2.5">
        <RoleSwitcher size="sm" className="w-full justify-between" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section, i) => (
          <NavGroup key={`role-${i}`} section={section} pathname={pathname} />
        ))}

        <AdvancedGroup section={advanced} pathname={pathname} />
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors hover:bg-sidebar-accent/60"
          aria-label="Account menu"
        >
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary/15 text-[11px] font-semibold text-primary">
              {role === "teacher" ? "P" : "A"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-medium">
              {role === "teacher" ? "Prof. demo" : "Alumno demo"}
            </p>
            <p className="truncate text-[10px] text-sidebar-foreground/55">
              {role === "teacher" ? "profesor@classos.demo" : "alumno@classos.demo"}
            </p>
          </div>
          <ChevronsUpDownIcon className="size-3.5 text-sidebar-foreground/45" />
        </button>
      </div>
    </aside>
  );
}

interface GroupProps {
  section: NavSection;
  pathname: string | null;
}

function NavGroup({ section, pathname }: GroupProps) {
  return (
    <div className="mb-3">
      {section.label && (
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/45">
          {section.label}
        </p>
      )}
      <ul className="flex flex-col gap-0.5">
        {section.items.map((item) => (
          <NavItemRow key={`${section.label ?? "_"}-${item.href}`} item={item} pathname={pathname} />
        ))}
      </ul>
    </div>
  );
}

function AdvancedGroup({ section, pathname }: GroupProps) {
  const containsActive = section.items.some(
    (item) =>
      !item.external &&
      (pathname === item.href || pathname?.startsWith(item.href + "/")),
  );
  const [open, setOpen] = React.useState<boolean>(containsActive);

  React.useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  return (
    <div className="mb-2 mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group/adv flex w-full items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/45 transition-colors hover:text-sidebar-foreground"
      >
        <span>{section.label}</span>
        <ChevronDownIcon
          className={cn(
            "ml-auto size-3 transition-transform",
            open ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>
      {open && (
        <ul className="mt-1 flex flex-col gap-0.5">
          {section.items.map((item) => (
            <NavItemRow key={`adv-${item.href}`} item={item} pathname={pathname} />
          ))}
        </ul>
      )}
    </div>
  );
}

function NavItemRow({
  item,
  pathname,
}: {
  item: NavSection["items"][number];
  pathname: string | null;
}) {
  const Icon = item.icon;
  const active = item.external
    ? false
    : pathname === item.href || pathname?.startsWith(item.href + "/");

  const cls = cn(
    "group/nav relative flex h-8 items-center gap-2.5 rounded-md pl-3 pr-2 text-sm transition-colors",
    active
      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
      : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60",
  );

  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-1 left-0 w-0.5 rounded-r-full bg-sidebar-primary transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          active
            ? "text-sidebar-primary"
            : "text-sidebar-foreground/55 group-hover/nav:text-sidebar-foreground",
        )}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <Badge
          variant="outline"
          className="h-4 px-1 text-[9px] font-medium uppercase tracking-wider"
        >
          {item.badge}
        </Badge>
      )}
      {item.external && (
        <ExternalLinkIcon className="size-3 text-sidebar-foreground/40" />
      )}
    </>
  );

  return (
    <li>
      {item.external ? (
        <a href={item.href} target="_blank" rel="noreferrer" className={cls}>
          {content}
        </a>
      ) : (
        <Link href={item.href} className={cls}>
          {content}
        </Link>
      )}
    </li>
  );
}
