import type { TeacherPackage } from '../../../lib/markdown';
import { CommonErrorsList } from './CommonErrorsList';
import { ExtensionsChips } from './ExtensionsChips';
import { HintsAccordion } from './HintsAccordion';
import { ProblemHero } from './ProblemHero';
import { RubricTable } from './RubricTable';
import { SectionHeader, StudentSection } from './StudentSection';
import { SolutionPanel } from './SolutionPanel';

interface Props {
  pkg: TeacherPackage;
  topic: string;
}

export function TeacherPackageView({ pkg, topic }: Props) {
  const { solution, rubric, commonErrors, progressiveHints, extensions } = pkg;
  const { problem, decision } = solution;

  if (!decision.accepted || !decision.solutionCode || !decision.tests || !decision.execution) {
    return <div className="text-[#DC2626]">TeacherPackage incompleto</div>;
  }

  return (
    <div className="px-8 py-8 max-w-[1100px]" data-testid="teacher-package">
      <ProblemHero title={problem.title} iterationCount={solution.iterationCount} topic={topic} />

      <StudentSection problem={problem} />

      <section>
        <SectionHeader label="Para el profe" tag="PROFE" />
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
          <div className="space-y-8">
            <SolutionPanel
              solutionCode={decision.solutionCode}
              tests={decision.tests}
              execution={decision.execution}
            />
            <RubricTable rubric={rubric} />
          </div>
          <div className="space-y-8">
            <CommonErrorsList errors={commonErrors} />
            <HintsAccordion hints={progressiveHints} />
            <ExtensionsChips extensions={extensions} />
          </div>
        </div>
      </section>
    </div>
  );
}
