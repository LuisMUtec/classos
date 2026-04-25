"use client";

import * as React from "react";
import { GraduationCapIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import { TutorChatPanel } from "@/components/chat/TutorChatPanel";

interface CourseOption {
  id: string;
  name: string;
  subject: string;
}

interface StudentChatShellProps {
  courses: CourseOption[];
}

const STORAGE_KEY = "classos:student:lastCourseId";

const SUBJECT_LABEL: Record<string, string> = {
  cs_python: "CS · Python",
  math_algebra: "Mate · Álgebra",
  math_calculus: "Mate · Cálculo",
};

/**
 * AI-first student entry. No catalog: la selección de curso es un paso
 * mínimo dentro del shell del chat. Si el estudiante ya tiene un curso
 * recordado en localStorage, salta directo al tutor.
 */
export function StudentChatShell({ courses }: StudentChatShellProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    if (courses.length === 1) {
      setSelectedId(courses[0].id);
      setHydrated(true);
      return;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && courses.some((c) => c.id === stored)) {
        setSelectedId(stored);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [courses]);

  const selected = React.useMemo(
    () => courses.find((c) => c.id === selectedId) ?? null,
    [courses, selectedId],
  );

  const choose = (id: string) => {
    setSelectedId(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  };

  const clear = () => {
    setSelectedId(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  if (!hydrated) {
    return (
      <section className="flex h-[calc(100svh-11rem)] items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground shadow-xs">
        Cargando…
      </section>
    );
  }

  if (courses.length === 0) {
    return (
      <section className="flex h-[calc(100svh-11rem)] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-10 text-center shadow-xs">
        <IconBadge tone="primary" size="lg">
          <GraduationCapIcon />
        </IconBadge>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold">Aún no hay cursos publicados</p>
          <p className="max-w-sm text-balance text-sm text-muted-foreground">
            Pídele a tu docente el enlace o el código del curso. Una vez creado, vas a
            poder chatear con el tutor IA aquí.
          </p>
        </div>
      </section>
    );
  }

  if (!selected) {
    return (
      <section className="flex h-[calc(100svh-11rem)] flex-col items-center justify-center gap-5 rounded-xl border bg-card p-10 text-center shadow-xs">
        <IconBadge tone="primary" size="lg">
          <SparklesIcon />
        </IconBadge>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold">¿En qué curso vas a trabajar?</p>
          <p className="max-w-sm text-balance text-sm text-muted-foreground">
            El tutor IA va a anclar todas sus respuestas al material de este curso.
            Lo recordamos en este dispositivo.
          </p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-2">
          {courses.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => choose(c.id)}
              className="group/sg flex w-full items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <span className="flex flex-col">
                <span className="font-medium">{c.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {SUBJECT_LABEL[c.subject] ?? c.subject}
                </span>
              </span>
              <span className="text-xs text-muted-foreground transition-colors group-hover/sg:text-primary">
                Empezar →
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {courses.length > 1 ? (
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={clear}>
            Cambiar de curso
          </Button>
        </div>
      ) : null}
      <TutorChatPanel courseId={selected.id} courseName={selected.name} />
    </div>
  );
}
