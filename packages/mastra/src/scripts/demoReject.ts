/**
 * Demo runner — fuerza el escenario de rechazo para mostrar el loop C→B en pitch.
 *
 * Cómo funciona:
 *   - Inyecta un ProblemStatement deliberadamente inconsistente (constraints contradictorios + ejemplo que viola spec)
 *   - El Solver-Validator real lo recibe y NATURALMENTE lo rechaza con feedback concreto
 *   - El Designer real recibe el feedback y rescribe en iter 2
 *   - El Solver ahora acepta
 *   - Reviewer + render como siempre
 *
 * Honesto: en slides decimos "para garantizar la visibilidad del loop, el demo input
 * incluye un problema deliberadamente inconsistente. El sistema funciona igual con inputs reales."
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { mastra } from '../mastra/index.js';
import { renderTeacherPackageMarkdown } from '../mastra/render/markdown.js';

async function main() {
  console.log('\n🎬 DEMO MODE — escenario forzado para mostrar loop de validación\n');

  const wf = mastra.getWorkflow('exerciseGenerator');
  const run = await wf.createRun();
  const result = await run.start({
    inputData: {
      topic: 'recursion',
      level: 'intro-universitario',
      durationMinutes: 45,
      constraints: [],
      demoMode: true,
    },
  });

  if (result.status !== 'success') {
    console.error('\n❌ Workflow falló:', result.status);
    if ('error' in result) console.error(result.error);
    process.exit(1);
  }

  const teacherPackage = result.result;
  const markdown = renderTeacherPackageMarkdown(teacherPackage);

  const outDir = join(process.cwd(), 'output');
  await mkdir(outDir, { recursive: true });
  const file = join(outDir, `demo-reject.md`);
  await writeFile(file, markdown, 'utf8');

  console.log(`\n✅ Pipeline completó en ${teacherPackage.solution.iterationCount} iteración(es).`);
  if (teacherPackage.solution.iterationCount > 1) {
    console.log(`   ↳ El Solver-Validator rechazó iter 1 y forzó al Designer a corregir.`);
  } else {
    console.log(`   ⚠️  Iter 1 aceptó. Para forzar rechazo, ajustar Solver para ser más estricto.`);
  }
  console.log(`📄 Archivo: ${file}`);
}

main().catch((err) => {
  console.error('FAIL:', err);
  process.exit(1);
});
