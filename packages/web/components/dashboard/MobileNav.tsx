"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  ChevronDownIcon,
  ExternalLinkIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";

import { BrandMark } from "@/components/dashboard/BrandMark";
import { RoleSwitcher } from "@/components/dashboard/RoleSwitcher";
import { useRole } from "@/components/dashboard/RoleProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAdvancedSection, getNavForRole, type NavSection } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const { role } = useRole();
  const sections = getNavForRole(role);
  const advanced = getAdvancedSection();

  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Abrir menú"
        >
          <MenuIcon />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-2 border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left">
          <DialogPrimitive.Title className="sr-only">Navegación</DialogPrimitive.Title>
          <div className="flex h-10 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <span className="text-sm font-semibold">ClassOS</span>
            </div>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Cerrar menú">
                <XIcon />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="px-1 pt-1">
            <RoleSwitcher size="sm" className="w-full justify-between" />
          </div>
          <div className="mt-2 flex flex-col">
            {sections.map((section, i) => (
              <NavGroup key={`role-${i}`} section={section} pathname={pathname} />
            ))}
            <AdvancedGroup section={advanced} pathname={pathname} />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
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
        className="flex w-full items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/45 transition-colors hover:text-sidebar-foreground"
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
    "flex h-9 items-center gap-2.5 rounded-md px-3 text-sm",
    active
      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
      : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60",
  );
  const inner = (
    <>
      <Icon className="size-4 shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <Badge variant="outline" className="h-4 px-1 text-[9px] uppercase tracking-wider">
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
          {inner}
        </a>
      ) : (
        <Link href={item.href} className={cls}>
          {inner}
        </Link>
      )}
    </li>
  );
}
