import { spawn } from 'node:child_process';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ExecutionResult } from '../schemas/index.js';

const BANNED_IMPORTS = [
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
];

const BANNED_BUILTINS = ['__import__', 'eval', 'exec', 'open', 'compile'];

export type SandboxValidation =
  | { ok: true }
  | { ok: false; reason: string };

export function validatePythonCode(code: string): SandboxValidation {
  const lines = code.split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith('#')) continue;

    // import X / import X as Y / import X, Y
    const importMatch = line.match(/^import\s+([\w.,\s]+)/);
    if (importMatch) {
      const modules = importMatch[1]
        .split(',')
        .map((m) => m.trim().split(/\s+as\s+/)[0].split('.')[0]);
      for (const mod of modules) {
        if (BANNED_IMPORTS.includes(mod)) {
          return { ok: false, reason: `import bloqueado: ${mod}` };
        }
      }
    }

    // from X import Y
    const fromMatch = line.match(/^from\s+([\w.]+)\s+import/);
    if (fromMatch) {
      const root = fromMatch[1].split('.')[0];
      if (BANNED_IMPORTS.includes(root)) {
        return { ok: false, reason: `from-import bloqueado: ${root}` };
      }
    }

    for (const builtin of BANNED_BUILTINS) {
      const re = new RegExp(`\\b${builtin}\\s*\\(`);
      if (re.test(line)) {
        return { ok: false, reason: `builtin bloqueado: ${builtin}` };
      }
    }
  }
  return { ok: true };
}

export type RunOptions = {
  timeoutMs?: number;
  pythonBin?: string;
};

export async function runPython(
  code: string,
  options: RunOptions = {},
): Promise<ExecutionResult> {
  const timeoutMs = options.timeoutMs ?? 5000;
  const pythonBin = options.pythonBin ?? 'python3';

  const validation = validatePythonCode(code);
  if (!validation.ok) {
    return {
      exitCode: -1,
      stdout: '',
      stderr: `[sandbox] ${validation.reason}`,
      timedOut: false,
      durationMs: 0,
    };
  }

  const dir = await mkdtemp(join(tmpdir(), 'edhack-sandbox-'));
  const file = join(dir, 'solution.py');
  await writeFile(file, code, 'utf8');

  const start = Date.now();
  return await new Promise<ExecutionResult>((resolve) => {
    const child = spawn(pythonBin, [file], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { PATH: process.env.PATH ?? '', PYTHONIOENCODING: 'utf-8' },
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const killTimer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > 64_000) child.kill('SIGKILL');
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 64_000) child.kill('SIGKILL');
    });

    child.on('close', (code) => {
      clearTimeout(killTimer);
      const durationMs = Date.now() - start;
      rm(dir, { recursive: true, force: true }).catch(() => {});
      resolve({
        exitCode: code ?? -1,
        stdout,
        stderr,
        timedOut,
        durationMs,
      });
    });

    child.on('error', (err) => {
      clearTimeout(killTimer);
      rm(dir, { recursive: true, force: true }).catch(() => {});
      resolve({
        exitCode: -1,
        stdout,
        stderr: stderr + `\n[sandbox] spawn error: ${err.message}`,
        timedOut: false,
        durationMs: Date.now() - start,
      });
    });
  });
}
