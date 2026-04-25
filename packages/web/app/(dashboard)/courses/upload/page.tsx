import Link from "next/link";
import { ArrowLeftIcon, BookOpenIcon, UploadIcon } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

import { UploadMaterialForm, type LessonOption } from "./upload-form";

export const dynamic = "force-dynamic";

async function loadLessons(): Promise<{ lessons: LessonOption[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { lessons: [], error: "Supabase no configurado" };
  }
  try {
    const c = getSupabase();
    const { data, error } = await c
      .from("lessons")
      .select('id, title, "order", course:courses(name, subject)')
      .order("course_id", { ascending: true })
      .order("order", { ascending: true });
    if (error) throw error;

    const lessons: LessonOption[] = ((data ?? []) as unknown as Array<{
      id: string;
      title: string;
      order: number;
      course: { name: string; subject: string } | null;
    }>).map((row) => ({
      id: row.id,
      title: row.title,
      order: row.order,
      courseName: row.course?.name ?? "—",
      courseSubject: row.course?.subject ?? "",
    }));

    return { lessons, error: null };
  } catch (err) {
    return { lessons: [], error: err instanceof Error ? err.message : String(err) };
  }
}

export default async function UploadMaterialPage() {
  const { lessons, error } = await loadLessons();

  return (
    <>
      <PageHeader
        eyebrow="Trabajo · Material"
        title="Subir material"
        description="Adjuntá un archivo (PDF, MD, TXT, imagen) y vinculalo a una lección. Para .md/.txt se indexa el contenido para que el tutor lo cite."
        actions={
          <Button asChild size="sm" variant="ghost">
            <Link href="/courses">
              <ArrowLeftIcon className="size-4" />
              Volver a cursos
            </Link>
          </Button>
        }
      />

      {error ? (
        <Card className="border-warning/40 bg-warning/5 p-4 text-sm">
          <p className="font-medium">No se pudieron cargar las lecciones</p>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      ) : lessons.length === 0 ? (
        <EmptyState
          icon={<BookOpenIcon />}
          title="Aún no hay lecciones"
          description="Crea un curso y al menos una lección antes de adjuntar materiales."
        />
      ) : (
        <Card className="max-w-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <UploadIcon className="size-4 text-primary" />
            <h2 className="text-base font-semibold">Nuevo material</h2>
          </div>
          <UploadMaterialForm lessons={lessons} />
        </Card>
      )}
    </>
  );
}
