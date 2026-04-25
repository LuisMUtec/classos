import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

import { supabase } from '../../supabase.js';

const SUBJECTS = ['cs_python', 'math_algebra', 'math_calculus'] as const;
// teacher_id placeholder until we wire real auth. Stable so e2e fixtures can
// be cleaned up by tag without colliding with other rows.
const E2E_TEACHER_ID = '00000000-0000-0000-0000-00000000e2ed';

export const createCourseTool = createTool({
  id: 'createCourse',
  description:
    'Crea un curso nuevo en la base de datos del docente. Usa esto cuando el docente pida crear un curso. ' +
    'Devuelve course_id y nombre. Después puedes proponer agregar lecciones.',
  inputSchema: z.object({
    name: z.string().min(1).describe('Nombre del curso (visible al docente y al estudiante).'),
    subject: z
      .enum(SUBJECTS)
      .default('cs_python')
      .describe('Materia. cs_python para programación; el resto para matemáticas.'),
    syllabus_md: z
      .string()
      .default('')
      .describe('Sílabo o resumen del curso en markdown. Vacío si el docente aún no lo dio.'),
  }),
  outputSchema: z.object({
    course_id: z.string().uuid(),
    name: z.string(),
    subject: z.enum(SUBJECTS),
    mcp_token: z.string(),
  }),
  execute: async ({ name, subject, syllabus_md }) => {
    const mcp_token = `class-${randomUUID()}`;
    const { data, error } = await supabase()
      .from('courses')
      .insert({
        teacher_id: E2E_TEACHER_ID,
        name,
        subject,
        syllabus_md,
        mcp_token,
      })
      .select('id, name, subject, mcp_token')
      .single();
    if (error || !data) {
      throw new Error(`createCourse: ${error?.message ?? 'no row'}`);
    }
    return {
      course_id: data.id as string,
      name: data.name as string,
      subject: data.subject as (typeof SUBJECTS)[number],
      mcp_token: data.mcp_token as string,
    };
  },
});
