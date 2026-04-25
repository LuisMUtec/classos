import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { supabase } from '../../supabase.js';

/**
 * Registra un material ya subido (a Supabase Storage por la API route
 * `POST /api/materials/upload`) y lo vincula a una lección.
 *
 * El docente sube el archivo desde el chat (input file → fetch a la route);
 * la route devuelve { file_path, file_url, mime, size_bytes, content_md } y
 * el assistant llama esta tool para persistir la metadata.
 *
 * Por ahora content_md ya viene extraído (texto plano para .md/.txt;
 * placeholder para PDFs hasta que pluguemos un parser).
 */
export const uploadMaterialTool = createTool({
  id: 'uploadMaterial',
  description:
    'Vincula un archivo ya subido a Supabase Storage con una lección. Recibe el resultado del endpoint ' +
    '/api/materials/upload (file_path, mime, content_md). Úsala cuando el docente adjunta un archivo en el chat ' +
    'y pide ingerirlo en una lección.',
  inputSchema: z.object({
    lesson_id: z.string().uuid(),
    title: z.string().min(1).describe('Título visible del material; usa el filename si el docente no dio uno.'),
    mime: z.string().describe('MIME type, p.ej. "text/markdown", "application/pdf".'),
    file_path: z.string().describe('Path en el bucket "materials" (devuelto por /api/materials/upload).'),
    file_url: z.string().url().optional().describe('URL pública o firmada (opcional).'),
    content_md: z
      .string()
      .default('')
      .describe('Texto extraído en markdown. Vacío si todavía no hay parser para ese mime.'),
    size_bytes: z.number().int().nonnegative().optional(),
  }),
  outputSchema: z.object({
    material_id: z.string().uuid(),
    lesson_id: z.string().uuid(),
    title: z.string(),
    chars_indexed: z.number().int().nonnegative(),
  }),
  execute: async ({ lesson_id, title, mime, file_path, file_url, content_md, size_bytes }) => {
    const { data, error } = await supabase()
      .from('materials')
      .insert({
        lesson_id,
        title,
        mime,
        file_path,
        file_url: file_url ?? null,
        content_md,
        size_bytes: size_bytes ?? null,
      })
      .select('id, lesson_id, title, content_md')
      .single();
    if (error || !data) {
      throw new Error(`uploadMaterial: ${error?.message ?? 'no row'}`);
    }
    return {
      material_id: data.id as string,
      lesson_id: data.lesson_id as string,
      title: data.title as string,
      chars_indexed: ((data.content_md as string) ?? '').length,
    };
  },
});
