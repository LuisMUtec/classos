import { BotIcon, WorkflowIcon, ExternalLinkIcon, AlertTriangleIcon } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { mastraClient, MASTRA_URL } from "@/lib/mastra";

export const dynamic = "force-dynamic";

interface MastraEntity {
  name: string;
  instructions?: string;
  description?: string;
}

async function loadMastra() {
  try {
    const [agentsRes, workflowsRes] = await Promise.all([
      mastraClient.listAgents(),
      mastraClient.listWorkflows(),
    ]);
    return {
      agents: agentsRes as Record<string, MastraEntity>,
      workflows: workflowsRes as Record<string, MastraEntity>,
      error: null as string | null,
    };
  } catch (err) {
    return {
      agents: {},
      workflows: {},
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export default async function AgentsPage() {
  const { agents, workflows, error } = await loadMastra();
  const agentEntries = Object.entries(agents);
  const workflowEntries = Object.entries(workflows);

  return (
    <>
      <PageHeader
        eyebrow="Inteligencia"
        title="Agents & Workflows"
        description="Listado en vivo del servidor Mastra. Estos son los building-blocks de IA disponibles para tus pestañas."
        actions={
          <>
            <Badge variant="outline" className="font-mono text-[11px]">
              {MASTRA_URL}
            </Badge>
            <Button variant="outline" asChild>
              <a href={MASTRA_URL} target="_blank" rel="noreferrer">
                <ExternalLinkIcon /> Studio
              </a>
            </Button>
          </>
        }
      />

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-destructive">
              No se pudo conectar a Mastra
            </p>
            <p className="text-sm text-muted-foreground">
              ¿Está corriendo <code>pnpm dev:mastra</code>? Detalle:
            </p>
            <pre className="mt-1 overflow-x-auto rounded-md bg-background p-2 text-xs text-muted-foreground">
              {error}
            </pre>
          </div>
        </div>
      )}

      <Section
        title="Agents"
        icon={<BotIcon />}
        count={agentEntries.length}
        empty={
          !error && (
            <EmptyState
              icon={<BotIcon />}
              title="No hay agents registrados"
              description="Define uno en mastra/src/mastra/agents/ y regístralo en index.ts."
            />
          )
        }
      >
        {agentEntries.map(([id, agent]) => (
          <EntityCard
            key={id}
            id={id}
            description={agent.instructions ?? "—"}
            tone="primary"
            icon={<BotIcon />}
            studioPath={`/agents/${id}`}
          />
        ))}
      </Section>

      <Section
        title="Workflows"
        icon={<WorkflowIcon />}
        count={workflowEntries.length}
        empty={
          !error && (
            <EmptyState
              icon={<WorkflowIcon />}
              title="No hay workflows registrados"
              description="Define uno en mastra/src/mastra/workflows/ y regístralo en index.ts."
            />
          )
        }
      >
        {workflowEntries.map(([id, wf]) => (
          <EntityCard
            key={id}
            id={id}
            description={wf.description ?? "—"}
            tone="accent"
            icon={<WorkflowIcon />}
            studioPath={`/workflows/${id}`}
          />
        ))}
      </Section>
    </>
  );
}

function Section({
  title,
  icon,
  count,
  empty,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  empty?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-2">
        <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
        <h2 className="text-sm font-semibold">{title}</h2>
        <Badge variant="secondary" className="h-5">
          {count}
        </Badge>
      </header>
      {count === 0 ? (
        empty
      ) : (
        <div className="grid gap-3 md:grid-cols-2">{children}</div>
      )}
    </section>
  );
}

function EntityCard({
  id,
  description,
  tone,
  icon,
  studioPath,
}: {
  id: string;
  description: string;
  tone: "primary" | "accent";
  icon: React.ReactNode;
  studioPath: string;
}) {
  const cleanDesc = description.replace(/\s+/g, " ").trim();
  return (
    <article className="group/ent flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30">
      <header className="flex items-start gap-3">
        <IconBadge tone={tone} size="md">
          {icon}
        </IconBadge>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="font-mono text-sm font-medium">{id}</h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {cleanDesc}
          </p>
        </div>
      </header>
      <footer className="flex items-center justify-between gap-2 border-t pt-3">
        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
          ready
        </Badge>
        <Link
          href={`${MASTRA_URL}${studioPath}` as string}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Open in Studio
          <ExternalLinkIcon className="size-3" />
        </Link>
      </footer>
    </article>
  );
}
