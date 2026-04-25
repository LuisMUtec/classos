import {
  HouseIcon,
  MessageSquareIcon,
  BotIcon,
  Settings2Icon,
  WorkflowIcon,
  ArchiveIcon,
  PlayIcon,
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
        href: "http://localhost:4111",
        icon: WorkflowIcon,
        description: "Mastra Studio",
        external: true,
      },
    ],
  },
  {
    label: "Trabajo",
    items: [
      {
        label: "Pipelines",
        href: "/pipelines",
        icon: PlayIcon,
        description: "Multi-agent workflows",
      },
      {
        label: "Library",
        href: "/library",
        icon: ArchiveIcon,
        description: "Runs guardados",
      },
    ],
  },
  {
    label: "Sistema",
    items: [
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
