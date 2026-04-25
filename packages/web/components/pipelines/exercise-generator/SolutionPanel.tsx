import type { TestCase, ExecutionResult } from '../../../lib/markdown';
import { CodeBlock } from '../../CodeBlock';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { SubLabel } from './StudentSection';

interface Props {
  solutionCode: string;
  tests: TestCase[];
  execution: ExecutionResult;
}

export function SolutionPanel({ solutionCode, tests, execution }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <SubLabel>Solución de referencia</SubLabel>
          <Badge className="text-[11px] font-mono rounded-md px-2.5 py-1 bg-foreground text-[#10B981] inline-flex items-center gap-2">
            <span className="font-bold">✓ sandbox</span>
            <span>exit {execution.exitCode}</span>
            <span>·</span>
            <span>{execution.durationMs}ms</span>
          </Badge>
        </div>
        <CodeBlock code={solutionCode} />
      </div>

      <div>
        <SubLabel>Tests que pasaron ({tests.length})</SubLabel>
        <div className="space-y-2">
          {tests.map((t, i) => (
            <Card key={i} className="rounded-md border border-border bg-card gap-0 p-0">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                <Badge className="text-[10px] font-bold rounded-full bg-[#10B981] text-white px-1.5 py-0.5">
                  ✓
                </Badge>
                <span className="text-[12px] text-foreground font-medium">{t.description}</span>
              </div>
              <div className="p-2">
                <CodeBlock code={t.code} small />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
