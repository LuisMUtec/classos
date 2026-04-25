import { spawn } from 'node:child_process';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Verifier, VerificationResult } from '@edhack/contracts';

const BANNED_IMPORTS = new Set([
  'os',
  'subprocess',
  'socket',
  'requests',
  'urllib',
  'http',
  'ftplib',
  'sys',
  'importlib',
  'shutil',
  'pathlib',
  'pickle',
  'multiprocessing',
  'threading',
  'ctypes',
]);

const BANNED_BUILTINS = ['__import__', 'eval', 'exec', 'open', 'compile'];

const MAX_OUTPUT_BYTES = 64_000;

type CodeValidation = { ok: true } | { ok: false; reason: string };

function validateStudentCode(code: string): CodeValidation {
  for (const raw of code.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const importMatch = line.match(/^import\s+([\w.,\s]+)/);
    if (importMatch) {
      const modules = importMatch[1]
        .split(',')
        .map((m) => m.trim().split(/\s+as\s+/)[0].split('.')[0]);
      for (const mod of modules) {
        if (BANNED_IMPORTS.has(mod)) return { ok: false, reason: `import bloqueado: ${mod}` };
      }
    }

    const fromMatch = line.match(/^from\s+([\w.]+)\s+import/);
    if (fromMatch) {
      const root = fromMatch[1].split('.')[0];
      if (BANNED_IMPORTS.has(root)) return { ok: false, reason: `from-import bloqueado: ${root}` };
    }

    for (const builtin of BANNED_BUILTINS) {
      const re = new RegExp(`\\b${builtin}\\s*\\(`);
      if (re.test(line)) return { ok: false, reason: `builtin bloqueado: ${builtin}` };
    }
  }
  return { ok: true };
}

interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

async function runPytest(cwd: string, timeoutMs: number): Promise<RunResult> {
  const pythonBin = process.env.PYTHON_BIN ?? 'python3';

  return await new Promise<RunResult>((resolve) => {
    const child = spawn(
      pythonBin,
      ['-m', 'pytest', '-q', '--tb=short', '--no-header', 'test_solution.py'],
      {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { PATH: process.env.PATH ?? '', PYTHONIOENCODING: 'utf-8', PYTHONDONTWRITEBYTECODE: '1' },
      },
    );

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const killTimer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > MAX_OUTPUT_BYTES) child.kill('SIGKILL');
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > MAX_OUTPUT_BYTES) child.kill('SIGKILL');
    });

    child.on('close', (code) => {
      clearTimeout(killTimer);
      resolve({ exitCode: code ?? -1, stdout, stderr, timedOut });
    });

    child.on('error', (err) => {
      clearTimeout(killTimer);
      resolve({
        exitCode: -1,
        stdout,
        stderr: stderr + `\n[verifier] spawn error: ${err.message}`,
        timedOut: false,
      });
    });
  });
}

function summarizeFailure(stdout: string, stderr: string): string {
  // pytest -q typical failure block:
  //   FAILED test_solution.py::test_x - AssertionError: ...
  // Extract those lines first.
  const failedLines = stdout
    .split('\n')
    .filter((l) => l.startsWith('FAILED ') || l.startsWith('ERROR '))
    .slice(0, 5);

  if (failedLines.length > 0) return failedLines.join('\n');

  // Collection / syntax errors land on stderr or as `=== ERRORS ===` blocks.
  const tail = (stderr || stdout).trim().split('\n').slice(-20).join('\n');
  return tail || 'Tests failed (sin output legible).';
}

export const pythonTestsVerifier: Verifier<'python_tests'> = {
  kind: 'python_tests',
  async verify(spec, studentAnswer): Promise<VerificationResult> {
    const validation = validateStudentCode(studentAnswer);
    if (!validation.ok) {
      return {
        passed: false,
        feedback: `Tu código usa algo bloqueado por el sandbox: ${validation.reason}.`,
        diagnostics: { reason: 'sandbox_validation', detail: validation.reason },
      };
    }

    const dir = await mkdtemp(join(tmpdir(), 'classos-pyverify-'));
    try {
      const setup = spec.setup ? `${spec.setup}\n\n` : '';
      await writeFile(join(dir, 'solution.py'), setup + studentAnswer, 'utf8');
      await writeFile(join(dir, 'test_solution.py'), spec.tests, 'utf8');

      const run = await runPytest(dir, spec.timeout_ms);

      if (run.timedOut) {
        return {
          passed: false,
          feedback: `Tu solución excedió el límite de ${spec.timeout_ms}ms. Probable loop infinito o recursión sin caso base.`,
          diagnostics: { reason: 'timeout', exitCode: run.exitCode },
        };
      }

      if (run.exitCode === 0) {
        return {
          passed: true,
          feedback: 'Todos los tests pasaron.',
          diagnostics: { exitCode: 0, stdout: run.stdout.slice(-2000) },
        };
      }

      return {
        passed: false,
        feedback: summarizeFailure(run.stdout, run.stderr),
        diagnostics: {
          exitCode: run.exitCode,
          stdout: run.stdout.slice(-2000),
          stderr: run.stderr.slice(-2000),
        },
      };
    } finally {
      rm(dir, { recursive: true, force: true }).catch(() => {});
    }
  },
};
