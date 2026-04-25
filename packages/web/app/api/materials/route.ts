import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const runtime = "nodejs";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

const Body = z.object({
  lesson_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  mime: z.string().min(1),
  file_path: z.string().min(1),
  file_url: z.string().url().nullish(),
  content_md: z.string().default(""),
  size_bytes: z.number().int().nonnegative().nullish(),
});

/**
 * POST /api/materials — registers an already-uploaded file (from
 * /api/materials/upload) as a row in `public.materials`, linked to a lesson.
 *
 * Used by the direct authoring UI (/courses/upload). The Mastra `uploadMaterial`
 * tool covers the chat flow with the same effect.
 */
export async function POST(req: Request) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "invalid_body", message: err instanceof Error ? err.message : String(err) },
      { status: 400 },
    );
  }

  const c = adminClient();
  const { data, error } = await c
    .from("materials")
    .insert({
      lesson_id: parsed.lesson_id,
      title: parsed.title,
      mime: parsed.mime,
      file_path: parsed.file_path,
      file_url: parsed.file_url ?? null,
      content_md: parsed.content_md,
      size_bytes: parsed.size_bytes ?? null,
    })
    .select("id, lesson_id, title")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "insert_failed", message: error?.message ?? "no row returned" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    material_id: data.id,
    lesson_id: data.lesson_id,
    title: data.title,
  });
}
