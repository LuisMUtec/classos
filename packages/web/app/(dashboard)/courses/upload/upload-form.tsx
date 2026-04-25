"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { CheckCircle2Icon, Loader2Icon, UploadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface LessonOption {
  id: string;
  title: string;
  order: number;
  courseName: string;
  courseSubject: string;
}

type Status =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "registering" }
  | { kind: "done"; materialId: string; title: string }
  | { kind: "error"; message: string };

export function UploadMaterialForm({ lessons }: { lessons: LessonOption[] }) {
  const router = useRouter();
  const titleId = useId();
  const lessonId = useId();
  const fileId = useId();

  const [title, setTitle] = useState("");
  const [lesson, setLesson] = useState<string>(lessons[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !lesson) return;

    const finalTitle = title.trim() || file.name;

    setStatus({ kind: "uploading" });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch("/api/materials/upload", { method: "POST", body: fd });
      if (!upRes.ok) {
        const j = await upRes.json().catch(() => ({}));
        throw new Error(j.error ?? `upload failed: ${upRes.status}`);
      }
      const upJson = await upRes.json();

      setStatus({ kind: "registering" });
      const regRes = await fetch("/api/materials", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lesson_id: lesson,
          title: finalTitle,
          mime: upJson.mime,
          file_path: upJson.file_path,
          file_url: upJson.file_url,
          content_md: upJson.content_md ?? "",
          size_bytes: upJson.size_bytes,
        }),
      });
      if (!regRes.ok) {
        const j = await regRes.json().catch(() => ({}));
        throw new Error(j.message ?? `register failed: ${regRes.status}`);
      }
      const regJson = await regRes.json();
      setStatus({ kind: "done", materialId: regJson.material_id, title: regJson.title });

      // Reset form (keep lesson selection so the teacher can add several in a row)
      setTitle("");
      setFile(null);
      const fileInput = document.getElementById(fileId) as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      router.refresh();
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const busy = status.kind === "uploading" || status.kind === "registering";

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={lessonId}>Lección</Label>
        <select
          id={lessonId}
          value={lesson}
          onChange={(e) => setLesson(e.target.value)}
          required
          className="h-9 rounded-md border bg-background px-3 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.courseName} · #{l.order} {l.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={titleId}>Título (opcional)</Label>
        <Input
          id={titleId}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Apuntes recursión clase 3"
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground">
          Si lo dejás vacío usamos el nombre del archivo.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fileId}>Archivo</Label>
        <Input
          id={fileId}
          type="file"
          accept=".md,.markdown,.txt,.pdf,.png,.jpg,.jpeg,.json,.yaml,.yml"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
        <p className="text-xs text-muted-foreground">
          .md/.txt indexan su contenido (hasta 50KB). PDFs e imágenes solo se almacenan; la
          ingesta de texto vendrá después.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy || !file || !lesson}>
          {busy ? <Loader2Icon className="size-4 animate-spin" /> : <UploadIcon className="size-4" />}
          {status.kind === "uploading"
            ? "Subiendo archivo…"
            : status.kind === "registering"
            ? "Registrando…"
            : "Subir"}
        </Button>

        {status.kind === "done" ? (
          <span className="flex items-center gap-1.5 text-sm text-success-foreground">
            <CheckCircle2Icon className="size-4" />
            «{status.title}» guardado.
          </span>
        ) : null}
        {status.kind === "error" ? (
          <span className="text-sm text-destructive">Error: {status.message}</span>
        ) : null}
      </div>
    </form>
  );
}
