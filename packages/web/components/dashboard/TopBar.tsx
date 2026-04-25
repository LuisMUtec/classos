"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon, SearchIcon, BellIcon } from "lucide-react";

import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { useRole } from "@/components/dashboard/RoleProvider";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { NAV_ITEMS } from "@/lib/nav";

export function TopBar() {
  const pathname = usePathname();
  const { role } = useRole();
  const homeHref = role === "teacher" ? "/overview" : "/student";
  const homeLabel = role === "teacher" ? "Profesor" : "Alumno";
  const current = NAV_ITEMS.find(
    (item) =>
      !item.external &&
      (pathname === item.href || pathname?.startsWith(item.href + "/")),
  );
  const showCrumb = pathname !== homeHref;

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/80 bg-background/85 px-3 backdrop-blur-md md:px-5">
      <MobileNav />

      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
        <Link
          href={homeHref}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          {homeLabel}
        </Link>
        {showCrumb && current && (
          <>
            <ChevronRightIcon
              aria-hidden="true"
              className="size-3.5 text-muted-foreground/60"
            />
            <span className="truncate font-medium text-foreground">
              {current.label}
            </span>
          </>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          className="hidden h-8 items-center gap-2 rounded-md border border-border/80 bg-muted/40 px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted md:inline-flex"
          aria-label="Buscar"
        >
          <SearchIcon className="size-3.5" />
          <span>Buscar…</span>
          <span className="ml-2 flex items-center gap-0.5">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notificaciones"
          className="relative"
        >
          <BellIcon />
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent"
          />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
