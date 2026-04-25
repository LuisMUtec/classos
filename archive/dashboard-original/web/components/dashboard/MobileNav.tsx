"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ExternalLinkIcon, MenuIcon, XIcon } from "lucide-react";

import { BrandMark } from "@/components/dashboard/BrandMark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NAV_SECTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

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
              <span className="text-sm font-semibold">Dashboard</span>
            </div>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Cerrar menú">
                <XIcon />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="mt-2 flex flex-col">
            {NAV_SECTIONS.map((section, i) => (
              <div key={i} className="mb-3">
                {section.label && (
                  <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/45">
                    {section.label}
                  </p>
                )}
                <ul className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = item.external
                      ? false
                      : pathname === item.href ||
                        pathname?.startsWith(item.href + "/");
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
                      <li key={item.href}>
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
                  })}
                </ul>
              </div>
            ))}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
