import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 60;

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

const TEXT_LIKE_MIME = /^text\/|application\/(json|x-yaml|yaml|x-markdown|markdown)/;

/**
 * POST /api/materials/upload — multipart/form-data
 *  - file: el binario
 *  - lesson_id (opcional, solo metadata; uploadMaterial tool lo persiste)
 *
 * Devuelve { file_path, file_url, mime, size_bytes, content_md }.
 * No persiste fila en `materials` — eso lo hace la tool de Mastra para que el
 * assistant tenga la chance de elegir título y confirmar al docente.
 */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "expected multipart/form-data" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing 'file'" }, { status: 400 });
  }

  const c = adminClient();
  const ext = file.name.includes(".") ? file.name.split(".").pop()! : "bin";
  const objectPath = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: upErr } = await c.storage.from("materials").upload(objectPath, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (upErr) {
    return NextResponse.json({ error: `storage upload: ${upErr.message}` }, { status: 500 });
  }

  const { data: pub } = c.storage.from("materials").getPublicUrl(objectPath);

  // Extracción de texto: trivial para text/* y markdown; placeholder para
  // binarios. Cuando se conecte un parser PDF, va aquí.
  let content_md = "";
  if (TEXT_LIKE_MIME.test(file.type) || /\.(md|markdown|txt)$/i.test(file.name)) {
    content_md = new TextDecoder().decode(bytes).slice(0, 50_000);
  }

  return NextResponse.json({
    file_path: objectPath,
    file_url: pub.publicUrl,
    mime: file.type || "application/octet-stream",
    size_bytes: bytes.byteLength,
    content_md,
  });
}
