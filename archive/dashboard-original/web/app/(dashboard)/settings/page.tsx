import { CheckIcon, CircleAlertIcon, KeyRoundIcon, NetworkIcon, PaletteIcon } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { IconBadge } from "@/components/ui/icon-badge";
import { ThemePreview } from "@/components/dashboard/ThemePreview";

export const dynamic = "force-dynamic";

interface EnvDescriptor {
  key: string;
  group: "llm" | "network";
  label: string;
  hint: string;
  secret?: boolean;
}

const ENV: EnvDescriptor[] = [
  {
    key: "OPENROUTER_API_KEY",
    group: "llm",
    label: "OpenRouter API key",
    hint: "Mastra y la API route la usan para llamar al modelo.",
    secret: true,
  },
  {
    key: "MASTRA_URL",
    group: "network",
    label: "Mastra URL",
    hint: "Hacia dónde apunta el dashboard para hablar con el servidor Mastra.",
  },
];

export default function SettingsPage() {
  const env = ENV.map((e) => {
    const raw = process.env[e.key];
    return {
      ...e,
      set: Boolean(raw),
      display: e.secret ? (raw ? "••••••••••••" : "") : raw ?? "",
    };
  });

  const grouped = {
    llm: env.filter((e) => e.group === "llm"),
    network: env.filter((e) => e.group === "network"),
  };

  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        title="Settings"
        description="Tema visual y entorno del servidor Next.js. Los cambios de variables requieren reiniciar el dev server."
      />

      <SettingsGroup
        icon={<KeyRoundIcon />}
        title="LLM provider"
        description="Credenciales que tus agents Mastra usan para llamar al modelo."
      >
        {grouped.llm.map((e) => (
          <EnvRow key={e.key} env={e} />
        ))}
      </SettingsGroup>

      <SettingsGroup
        icon={<NetworkIcon />}
        title="Network"
        description="Endpoints y URLs internas del baseline."
      >
        {grouped.network.map((e) => (
          <EnvRow key={e.key} env={e} />
        ))}
      </SettingsGroup>

      <SettingsGroup
        icon={<PaletteIcon />}
        title="Apariencia"
        description="El tema afecta también a Mastra Studio si lo abres en un iframe."
      >
        <ThemePreview />
      </SettingsGroup>
    </>
  );
}

function SettingsGroup({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 rounded-xl border bg-card p-5 shadow-xs md:grid-cols-[260px_1fr]">
      <header className="flex flex-col gap-2">
        <IconBadge tone="muted" size="md">
          {icon}
        </IconBadge>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </header>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function EnvRow({
  env,
}: {
  env: { key: string; label: string; hint: string; set: boolean; display: string };
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <code className="font-mono text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {env.key}
          </code>
          <p className="text-sm font-medium">{env.label}</p>
        </div>
        <Badge
          variant={env.set ? "success" : "warning"}
          className="h-5 gap-1 text-[10px] uppercase"
        >
          {env.set ? <CheckIcon /> : <CircleAlertIcon />}
          {env.set ? "set" : "missing"}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{env.hint}</p>
      {env.display && (
        <code className="mt-1 truncate rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
          {env.display}
        </code>
      )}
    </div>
  );
}
