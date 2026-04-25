import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    course_id?: string;
    anon_token?: string;
  };
  if (!body.course_id) {
    return NextResponse.json({ error: "course_id required" }, { status: 400 });
  }
  const c = adminClient();

  if (body.anon_token) {
    const { data } = await c
      .from("students")
      .select("id, display_name, anon_token")
      .eq("anon_token", body.anon_token)
      .eq("course_id", body.course_id)
      .maybeSingle();
    if (data) return NextResponse.json(data);
  }

  const anon_token = body.anon_token ?? `anon-${randomUUID()}`;
  const display_name = `anon-${anon_token.slice(-6)}`;
  const { data, error } = await c
    .from("students")
    .insert({ course_id: body.course_id, display_name, anon_token })
    .select("id, display_name, anon_token")
    .single();
  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "insert failed" }, { status: 500 });
  }
  return NextResponse.json(data);
}
