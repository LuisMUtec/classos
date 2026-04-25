import {
  ArrowRightIcon,
  BotIcon,
  MessageSquareIcon,
  WorkflowIcon,
  SparklesIcon,
  KeyRoundIcon,
  CodeIcon,
  TerminalIcon,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/ui/stat-card";
import { IconBadge } from "@/components/ui/icon-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: CodeIcon,
    title: "Crea una ruta",
    body: (
      <>
        Añade <code>app/(dashboard)/mi-feature/page.tsx</code>. El layout aplica
        sidebar y topbar automáticamente.
      </>
    ),
  },
  {
    icon: TerminalIcon,
    title: "Regístrala en navegación",
    body: (
      <>
        Edita <code>lib/nav.ts</code> y añade la entrada en una sección.
        Aparece al instante con su icono.
      </>
    ),
  },
  {
    icon: SparklesIcon,
    title: "Conecta IA",
    body: (
      <>
        Llama a <code>useChat()</code> con <code>/api/chat</code> para chat, o
        invoca workflows Mastra desde una API route.
      </>
    ),
  },
];

export default function OverviewPage() {
  return (
    <>
      {/* Brand glow hero */}
      <div className="relative -mx-4 -mt-4 px-4 pt-4 md:-mx-8 md:-mt-8 md:px-8 md:pt-8">
        <div
          aria-hidden="true"
          className="brand-glow pointer-events-none absolute inset-x-0 top-0 h-72"
        />
        <PageHeader
          eyebrow="Workspace"
          title="Bienvenido de vuelta"
          description="Tu baseline está listo. Empieza explorando un agent, ejecutando un workflow, o creando una pestaña nueva."
          actions={
            <>
              <Button variant="outline" asChild>
                <Link href="/agents">
                  <BotIcon /> Ver agents
                </Link>
              </Button>
              <Button asChild>
                <Link href="/chat">
                  <MessageSquareIcon /> Probar chat
                </Link>
              </Button>
            </>
          }
        />
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Agents activos"
          value={2}
          hint="vs. la semana pasada"
          delta={{ value: "+1", tone: "positive" }}
          icon={<BotIcon />}
          href="/agents"
        />
        <StatCard
          label="Workflows"
          value={1}
          hint="listos para ejecutar"
          icon={<WorkflowIcon />}
          href="/agents"
        />
        <StatCard
          label="Provider"
          value="OpenRouter"
          hint="gemini-2.5-flash"
          icon={<KeyRoundIcon />}
          href="/settings"
        />
        <StatCard
          label="Mastra Studio"
          value=":4112"
          hint="REST + Studio UI"
          icon={<WorkflowIcon />}
          href="http://localhost:4112"
          external
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <article className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs">
          <header className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <Badge variant="outline" className="w-fit">
                Quick start
              </Badge>
              <h2 className="text-base font-semibold tracking-tight">
                Cómo agregar una pestaña
              </h2>
              <p className="text-sm text-muted-foreground">
                Tres pasos. Sin tocar el shell.
              </p>
            </div>
          </header>
          <ol className="flex flex-col gap-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={i} className="flex items-start gap-3">
                  <IconBadge tone="primary" size="md">
                    <Icon />
                  </IconBadge>
                  <div className="flex flex-col gap-0.5 pt-0.5">
                    <p className="text-sm font-medium">
                      {String(i + 1).padStart(2, "0")} · {step.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </article>

        <article className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-xs">
          <header className="flex flex-col gap-1">
            <h2 className="text-base font-semibold tracking-tight">Atajos</h2>
            <p className="text-sm text-muted-foreground">
              Áreas comunes para extender.
            </p>
          </header>
          <div className="flex flex-col gap-2">
            <ShortcutRow
              icon={<MessageSquareIcon />}
              label="Probar el chat"
              hint="Streaming Mastra → useChat"
              href="/chat"
            />
            <ShortcutRow
              icon={<BotIcon />}
              label="Inspeccionar agents"
              hint="Lista en vivo"
              href="/agents"
            />
            <ShortcutRow
              icon={<WorkflowIcon />}
              label="Mastra Studio"
              hint="Replay + tracing"
              href="http://localhost:4112"
              external
            />
          </div>
        </article>
      </section>
    </>
  );
}

function ShortcutRow({
  icon,
  label,
  hint,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  href: string;
  external?: boolean;
}) {
  const cls =
    "group/row flex items-center gap-3 rounded-lg border border-transparent p-2.5 text-sm transition-colors hover:border-border hover:bg-muted/40";
  const inner = (
    <>
      <IconBadge tone="muted" size="sm">
        {icon}
      </IconBadge>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{hint}</p>
      </div>
      <ArrowRightIcon className="size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover/row:translate-x-0 group-hover/row:opacity-100" />
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
