export interface TestCase {
  description: string;
  code: string;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface ExecutionResult {
  exitCode: number;
  durationMs: number;
}

export interface ProblemStatement {
  title: string;
  story: string;
  ioSpec: string;
  functionSignature: string;
  examples: Example[];
  constraints: string[];
}

export interface Decision {
  accepted: boolean;
  solutionCode?: string;
  tests?: TestCase[];
  execution?: ExecutionResult;
}

export interface Solution {
  problem: ProblemStatement;
  decision: Decision;
  iterationCount: number;
}

export interface RubricCriterion {
  criterion: string;
  levels: { excelente: string; aceptable: string; insuficiente: string };
}

export interface CommonError {
  error: string;
  whyHappens: string;
  howToGuide: string;
}

export interface ProgressiveHint {
  level: string;
  hint: string;
}

export interface TeacherPackage {
  solution: Solution;
  rubric: RubricCriterion[];
  commonErrors: CommonError[];
  progressiveHints: ProgressiveHint[];
  extensions: string[];
}

export function renderTeacherPackageMarkdown(pkg: TeacherPackage): string {
  const { solution, rubric, commonErrors, progressiveHints, extensions } = pkg;
  const { problem, decision } = solution;

  if (!decision.accepted || !decision.tests || !decision.execution || !decision.solutionCode) {
    throw new Error('TeacherPackage incompleto: decision no aceptado o sin código');
  }

  const examples = problem.examples
    .map(
      (e, i) =>
        `**Ejemplo ${i + 1}** — input: \`${e.input}\` → output: \`${e.output}\`${
          e.explanation ? `  \n  _${e.explanation}_` : ''
        }`,
    )
    .join('\n\n');

  const constraints = problem.constraints.map((c) => `- ${c}`).join('\n');

  const tests = decision.tests
    .map((t, i) => `${i + 1}. **${t.description}**\n   \`\`\`python\n   ${t.code}\n   \`\`\``)
    .join('\n');

  const rubricRows = rubric
    .map(
      (c) =>
        `| ${c.criterion} | ${c.levels.excelente} | ${c.levels.aceptable} | ${c.levels.insuficiente} |`,
    )
    .join('\n');

  const errors = commonErrors
    .map(
      (e, i) =>
        `${i + 1}. **${e.error}**\n   - _Por qué pasa:_ ${e.whyHappens}\n   - _Cómo guiar:_ ${e.howToGuide}`,
    )
    .join('\n\n');

  const hints = progressiveHints.map((h) => `- **${h.level}** — ${h.hint}`).join('\n');
  const ext = extensions.map((e) => `- ${e}`).join('\n');

  return `# ${problem.title}

> Generado por edhack multi-agent pipeline · iteraciones del loop validador: **${solution.iterationCount}**

---

## [ALUMNO]

### Contexto
${problem.story}

### Especificación
${problem.ioSpec}

### Firma de la función
\`\`\`python
${problem.functionSignature}
\`\`\`

### Ejemplos
${examples}

### Restricciones
${constraints}

---

## [PROFE]

### Solución de referencia (validada por ejecución, exit ${decision.execution.exitCode}, ${decision.execution.durationMs}ms)
\`\`\`python
${decision.solutionCode}
\`\`\`

### Tests que pasaron
${tests}

### Rúbrica
| Criterio | Excelente | Aceptable | Insuficiente |
|---|---|---|---|
${rubricRows}

### Errores comunes esperados
${errors}

### Pistas progresivas (no spoilear)
${hints}

### Extensiones (alumnos rápidos)
${ext}
`;
}
