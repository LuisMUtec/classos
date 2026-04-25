import {
  HouseIcon,
  MessageSquareIcon,
  BotIcon,
  Settings2Icon,
  WorkflowIcon,
  ActivityIcon,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  external?: boolean;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      {
        label: "Overview",
        href: "/overview",
        icon: HouseIcon,
        description: "Resumen del proyecto",
      },
    ],
  },
  {
    label: "Inteligencia",
    items: [
      {
        label: "Chat",
        href: "/chat",
        icon: MessageSquareIcon,
        description: "Conversa con un agente IA",
      },
      {
        label: "Agents",
        href: "/agents",
        icon: BotIcon,
        description: "Agents y workflows Mastra",
      },
      {
        label: "Studio",
        href: "http://localhost:4112",
        icon: WorkflowIcon,
        description: "Mastra Studio",
        external: true,
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        label: "Activity",
        href: "/activity",
        icon: ActivityIcon,
        description: "Logs y eventos",
        badge: "Soon",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings2Icon,
        description: "Tema, providers, env",
      },
    ],
  },
];

// Flat helper for breadcrumbs / page header lookups.
export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);
