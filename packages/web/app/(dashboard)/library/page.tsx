import { ArchiveIcon, KeyRoundIcon } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RunCard } from "@/components/library/RunCard";
import { listRuns } from "@/lib/runs";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const configured = isSupabaseConfigured();
  const runs = configured ? await listRuns({ limit: 50 }) : [];

  return (
    <>
      <PageHeader
        eyebrow="Trabajo"
        title="Library"
        description="Runs persistidos. Cualquier docente del workspace los puede consultar y reusar."
        actions={<Badge variant="secondary">{runs.length} run{runs.length === 1 ? "" : "s"}</Badge>}
      />

      {!configured ? (
        <Card className="flex items-start gap-3 border-warning/40 bg-warning/5 p-4">
          <KeyRoundIcon className="mt-0.5 size-5 shrink-0 text-warning-foreground" />
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-medium">Supabase no configurado</p>
            <p className="text-muted-foreground">
              Agrega <code className="font-mono text-foreground">NEXT_PUBLIC_SUPABASE_URL</code>
              {" "}y{" "}
              <code className="font-mono text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
              {" "}a <code className="font-mono text-foreground">packages/web/.env.local</code>.
              La migración del esquema vive en <code className="font-mono text-foreground">supabase/migrations/</code>.
            </p>
          </div>
        </Card>
      ) : runs.length === 0 ? (
        <EmptyState
          icon={<ArchiveIcon />}
          title="Sin runs guardados"
          description="Genera un ejercicio (con demo mode desactivado) y aparecerá aquí."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {runs.map((r) => (
            <RunCard key={r.id} run={r} />
          ))}
        </div>
      )}
    </>
  );
}
