import { GraduationCapIcon } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StudentChatShell } from "@/components/chat/StudentChatShell";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

interface CourseOption {
  id: string;
  name: string;
  subject: string;
}

async function loadCourses(): Promise<{ courses: CourseOption[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { courses: [], error: "Supabase no configurado" };
  }
  try {
    const c = getSupabase();
    const { data, error } = await c
      .from("courses")
      .select("id, name, subject")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { courses: (data ?? []) as CourseOption[], error: null };
  } catch (err) {
    return {
      courses: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export default async function StudentPage() {
  const { courses, error } = await loadCourses();

  return (
    <>
      <PageHeader
        eyebrow="Alumno"
        title="Tutor IA"
        description="Chatea con el tutor del curso. Las respuestas se anclan en el material que dejó tu docente vía MCP — no es conocimiento genérico del modelo."
        actions={
          <>
            <Badge variant="outline">agent · tutor</Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              MCP
            </Badge>
          </>
        }
      />

      {error ? (
        <EmptyState
          icon={<GraduationCapIcon />}
          title="No se pudo cargar"
          description={error}
        />
      ) : (
        <StudentChatShell courses={courses} />
      )}
    </>
  );
}
