import { mastra } from '../mastra/index.js';

async function main() {
  const wf = mastra.getWorkflow('exerciseGenerator');
  const run = await wf.createRun();
  const result = await run.start({
    inputData: {
      topic: 'recursion',
      level: 'intro-universitario',
      durationMinutes: 45,
      constraints: [],
    },
  });

  console.log('=== WORKFLOW STATUS ===');
  console.log(result.status);
  console.log('\n=== RESULT ===');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error('FAIL:', err);
  process.exit(1);
});
