import Link from 'next/link';
import { listRuns } from '../../lib/runs';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { RunCard } from '../../components/library/RunCard';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const configured = isSupabaseConfigured();
  const runs = configured ? await listRuns({ limit: 50 }) : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b-4 border-foreground px-10 py-6 flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="text-[12px] text-muted-foreground font-mono px-2">
          <Link href="/">← inicio</Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Banco de ejercicios</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Runs persistidos · cualquier docente los puede ver y reusar
          </p>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{runs.length} run(s)</span>
      </header>

      <main className="px-10 py-8 max-w-[1100px] mx-auto">
        {!configured && (
          <Card className="rounded-lg border-2 border-amber-300 bg-amber-50 p-5 gap-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
              Supabase no configurado
            </div>
            <p className="text-[13px] text-amber-900 leading-relaxed">
              Falta agregar <code className="font-mono bg-card px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
              <code className="font-mono bg-card px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> a{' '}
              <code className="font-mono bg-card px-1 rounded">web/.env.local</code>. Ver{' '}
              <code className="font-mono bg-card px-1 rounded">.env.local.example</code> y la migración en{' '}
              <code className="font-mono bg-card px-1 rounded">web/migrations/0001_runs.sql</code>.
            </p>
          </Card>
        )}

        {configured && runs.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-[14px]">Sin runs todavía.</p>
            <p className="text-[12px] mt-1">
              Generá un ejercicio (con demo mode <strong>desactivado</strong>) y aparecerá acá.
            </p>
          </div>
        )}

        {runs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {runs.map((r) => (
              <RunCard key={r.id} run={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
