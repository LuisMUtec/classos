import { MastraClient } from '@mastra/client-js';
import { renderTeacherPackageMarkdown, type TeacherPackage } from '../../../../lib/markdown';
import { saveRun, type NewRun } from '../../../../lib/runs';

export const runtime = 'nodejs';
export const maxDuration = 300;

const MASTRA_URL = process.env.MASTRA_URL ?? 'http://localhost:4111';

interface PipelineMetadata {
  iterationCount: number;
  topic: string | null;
  title: string | null;
  execExitCode: number | null;
  execDurationMs: number | null;
}

interface PipelineHandler {
  workflowId: string;
  buildInputData: (body: Record<string, unknown>) => Record<string, unknown>;
  finalStepName: string;
  /** Builds the `done` event payload (e.g. adds rendered markdown). */
  postProcess?: (output: unknown) => Record<string, unknown>;
  /** Skip persistence when this returns false (e.g. demo runs). Default: true. */
  shouldPersist?: (body: Record<string, unknown>) => boolean;
  /** Pull denormalized columns out of the final result for fast list/filter. */
  extractMetadata: (output: unknown) => PipelineMetadata;
}

const PIPELINE_HANDLERS: Record<string, PipelineHandler> = {
  exerciseGenerator: {
    workflowId: 'exerciseGenerator',
    buildInputData: (body) => ({
      topic: String(body.topic ?? 'recursion'),
      level: 'intro-universitario',
      durationMinutes: Number(body.durationMinutes ?? 45),
      constraints: [],
      demoMode: Boolean(body.demoMode),
    }),
    finalStepName: 'reviewer',
    postProcess: (output) => ({
      teacherPackage: output,
      markdown: renderTeacherPackageMarkdown(output as TeacherPackage),
    }),
    shouldPersist: (body) => !body.demoMode,
    extractMetadata: (output) => {
      const pkg = output as TeacherPackage;
      return {
        iterationCount: pkg.solution.iterationCount,
        topic: null, // filled by route handler from input body
        title: pkg.solution.problem.title,
        execExitCode: pkg.solution.decision.execution?.exitCode ?? null,
        execDurationMs: pkg.solution.decision.execution?.durationMs ?? null,
      };
    },
  },
  debuggingTutor: {
    workflowId: 'debuggingTutor',
    buildInputData: (body) => ({
      buggyCode: String(body.buggyCode ?? ''),
      expectedBehavior: String(body.expectedBehavior ?? ''),
    }),
    finalStepName: 'verifier',
    extractMetadata: (output) => {
      const r = output as {
        iterationCount?: number;
        bugReport?: { line?: number };
        verification?: { applicationProof?: { exitCode?: number; durationMs?: number } };
      };
      return {
        iterationCount: r.iterationCount ?? 1,
        topic: null,
        title: r.bugReport?.line ? `Bug en línea ${r.bugReport.line}` : 'Debug session',
        execExitCode: r.verification?.applicationProof?.exitCode ?? null,
        execDurationMs: r.verification?.applicationProof?.durationMs ?? null,
      };
    },
  },
};

interface RouteContext {
  params: Promise<{ pipelineId: string }>;
}

export async function POST(req: Request, ctx: RouteContext) {
  const { pipelineId } = await ctx.params;
  const handler = PIPELINE_HANDLERS[pipelineId];

  if (!handler) {
    return new Response(JSON.stringify({ error: `pipeline desconocido: ${pipelineId}` }), {
      status: 404,
    });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const startedAt = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (event: string, data: unknown) => {
        controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const client = new MastraClient({ baseUrl: MASTRA_URL });
        const wf = client.getWorkflow(handler.workflowId);
        const run = await wf.createRun();

        send('start', { pipelineId, runId: run.runId });

        const inputData = handler.buildInputData(body);
        const wfStream = await run.stream({ inputData });
        const reader = wfStream.getReader();

        let finalOutput: unknown = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          send('chunk', value);
          const c = value as {
            type?: string;
            payload?: { stepName?: string; output?: unknown };
          };
          if (c?.type === 'workflow-step-result' && c.payload?.stepName === handler.finalStepName) {
            finalOutput = c.payload.output;
          }
        }

        if (!finalOutput) {
          send('error', { message: 'workflow terminó sin output del step final' });
          return;
        }

        const donePayload = handler.postProcess
          ? handler.postProcess(finalOutput)
          : { result: finalOutput };

        let savedRunId: string | null = null;
        const persist = handler.shouldPersist ? handler.shouldPersist(body) : true;
        if (persist) {
          const meta = handler.extractMetadata(finalOutput);
          const newRun: NewRun = {
            pipeline_id: pipelineId,
            mastra_run_id: run.runId,
            input: body,
            result: finalOutput as Record<string, unknown>,
            markdown: typeof donePayload.markdown === 'string' ? donePayload.markdown : null,
            iteration_count: meta.iterationCount,
            exec_exit_code: meta.execExitCode,
            exec_duration_ms: meta.execDurationMs,
            elapsed_ms: Date.now() - startedAt,
            topic: typeof body.topic === 'string' ? body.topic : meta.topic,
            title: meta.title,
          };
          const saved = await saveRun(newRun);
          savedRunId = saved?.id ?? null;
        }

        send('done', { ...donePayload, runId: run.runId, savedRunId });
      } catch (err) {
        send('error', { message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
