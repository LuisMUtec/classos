import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { mastra } from '../mastra/index.js';
import { renderTeacherPackageMarkdown } from '../mastra/render/markdown.js';
import { TeacherInputSchema, type Topic } from '../mastra/schemas/index.js';

function parseArgs(): { topic: Topic; durationMinutes: number; demoMode: boolean } {
  const args = process.argv.slice(2);
  const positional = args.filter((a) => !a.startsWith('--'));
  const flags = args.filter((a) => a.startsWith('--'));
  const topic = (positional[0] ?? 'recursion') as Topic;
  const duration = Number(positional[1] ?? 45);
  const demoMode = flags.includes('--demo');
  return { topic, durationMinutes: duration, demoMode };
}

async function main() {
  const { topic, durationMinutes, demoMode } = parseArgs();
  const input = TeacherInputSchema.parse({
    topic,
    level: 'intro-universitario',
    durationMinutes,
    constraints: [],
    demoMode,
  });

  console.log(
    `\n🎓 Generando ejercicio: tema=${topic}, duración=${durationMinutes}min${demoMode ? ' [DEMO MODE: rechazo intencional iter 1]' : ''}\n`,
  );

  const wf = mastra.getWorkflow('exerciseGenerator');
  const run = await wf.createRun();
  const result = await run.start({ inputData: input });

  if (result.status !== 'success') {
    console.error('Workflow falló:', result.status);
    if ('error' in result) console.error(result.error);
    process.exit(1);
  }

  const teacherPackage = result.result;
  const markdown = renderTeacherPackageMarkdown(teacherPackage);

  const outDir = join(process.cwd(), 'output');
  await mkdir(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const file = join(outDir, `${topic}-${stamp}.md`);
  await writeFile(file, markdown, 'utf8');

  console.log(`\n✅ Ejercicio generado en ${teacherPackage.solution.iterationCount} iteración(es) del loop validador.`);
  console.log(`📄 Archivo: ${file}`);
  console.log(`\n--- preview ---\n`);
  console.log(markdown.slice(0, 800) + '\n...\n');
}

main().catch((err) => {
  console.error('FAIL:', err);
  process.exit(1);
});
