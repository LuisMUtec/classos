import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { TutorChatPanel } from "@/components/chat/TutorChatPanel";
import { Badge } from "@/components/ui/badge";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

async function loadCourse(courseId: string) {
  if (!isSupabaseConfigured()) return null;
  const c = getSupabase();
  const { data, error } = await c
    .from("courses")
    .select("id, name, subject")
    .eq("id", courseId)
    .maybeSingle();
  if (error || !data) return null;
  return data as { id: string; name: string; subject: string };
}

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await loadCourse(courseId);
  if (!course) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Estudiante"
        title={course.name}
        description="Chatea con el tutor. Las respuestas vienen ancladas al material del docente."
        actions={
          <>
            <Badge variant="outline">agent · tutor</Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              MCP in-process
            </Badge>
          </>
        }
      />
      <TutorChatPanel courseId={course.id} courseName={course.name} />
    </>
  );
}
