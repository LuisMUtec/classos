import {
  HouseIcon,
  MessageSquareIcon,
  BotIcon,
  Settings2Icon,
  WorkflowIcon,
  ArchiveIcon,
  PlayIcon,
  GraduationCapIcon,
  BookOpenIcon,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/components/dashboard/RoleProvider";

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

const TEACHER_SECTIONS: NavSection[] = [
  {
    items: [
      {
        label: "Inicio",
        href: "/overview",
        icon: HouseIcon,
        description: "Resumen del workspace docente",
      },
    ],
  },
  {
    label: "Mi clase",
    items: [
      {
        label: "Mis cursos",
        href: "/courses",
        icon: BookOpenIcon,
        description: "Cursos creados — lecciones y ejercicios",
      },
      {
        label: "Crear con IA",
        href: "/chat",
        icon: MessageSquareIcon,
        description: "Autoría conversacional",
      },
    ],
  },
];

const STUDENT_SECTIONS: NavSection[] = [
  {
    label: "Aprender",
    items: [
      {
        label: "Tutor IA",
        href: "/student",
        icon: GraduationCapIcon,
        description: "Chat con el tutor — usa el material del docente vía MCP",
      },
    ],
  },
];

const ADVANCED_SECTION: NavSection = {
  label: "Avanzado",
  items: [
    {
      label: "Pipelines",
      href: "/pipelines",
      icon: PlayIcon,
      description: "Workflows multi-agent",
    },
    {
      label: "Library",
      href: "/library",
      icon: ArchiveIcon,
      description: "Runs guardados",
    },
    {
      label: "Agents",
      href: "/agents",
      icon: BotIcon,
      description: "Inspeccionar agents Mastra",
    },
    {
      label: "Mastra Studio",
      href: "http://localhost:4111",
      icon: WorkflowIcon,
      description: "Replay + tracing",
      external: true,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings2Icon,
      description: "Tema, providers, env",
    },
  ],
};

export function getNavForRole(role: Role): NavSection[] {
  return role === "teacher" ? TEACHER_SECTIONS : STUDENT_SECTIONS;
}

export function getAdvancedSection(): NavSection {
  return ADVANCED_SECTION;
}

// Flat helper for breadcrumbs / page header lookups across both roles + advanced.
export const NAV_ITEMS: NavItem[] = [
  ...TEACHER_SECTIONS.flatMap((s) => s.items),
  ...STUDENT_SECTIONS.flatMap((s) => s.items),
  ...ADVANCED_SECTION.items,
];
