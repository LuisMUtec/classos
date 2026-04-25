import type {
  Decision,
  ProblemStatement,
  TeacherPackage,
} from './markdown';

export type StepState = 'pending' | 'running' | 'success' | 'rejected';

export interface ScenarioCandidate {
  title: string;
  context: string;
  rationale: string;
  estimatedFitMinutes: number;
}

export interface ResearcherSlot {
  state: StepState;
  candidates?: ScenarioCandidate[];
  selected?: ScenarioCandidate;
}

export interface DesignerSolverIteration {
  iter: number;
  state: StepState;
  problem?: ProblemStatement;
  decision?: Decision & {
    rejectionReason?: string;
    feedbackForDesigner?: string;
    attemptedSolution?: string;
    failedExecution?: { exitCode: number; durationMs: number };
  };
}

export interface DesignerSolverSlot {
  state: StepState;
  iterations: DesignerSolverIteration[];
}

export interface ReviewerSlot {
  state: StepState;
}

export interface PipelineState {
  researcher: ResearcherSlot;
  designerSolver: DesignerSolverSlot;
  reviewer: ReviewerSlot;
  finalPackage?: TeacherPackage;
  startedAt?: number;
  finishedAt?: number;
}

export const initialPipelineState: PipelineState = {
  researcher: { state: 'pending' },
  designerSolver: { state: 'pending', iterations: [] },
  reviewer: { state: 'pending' },
};

interface ChunkPayload {
  type?: string;
  payload?: {
    stepName?: string;
    id?: string;
    status?: string;
    output?: unknown;
    payload?: { iterationCount?: number };
  };
}

interface ResearcherOutput {
  selectedScenario?: ScenarioCandidate;
  allCandidates?: { candidates: ScenarioCandidate[] };
}

interface DesignerSolverOutput {
  problem?: ProblemStatement;
  decision?: DesignerSolverIteration['decision'];
  iterationCount?: number;
  accepted?: boolean;
}

export function reducePipeline(state: PipelineState, raw: unknown): PipelineState {
  const c = raw as ChunkPayload;
  const t = c?.type;
  const p = c?.payload ?? {};
  const stepId = p.stepName ?? p.id;

  if (t === 'workflow-step-start') {
    if (stepId === 'researcher') {
      return { ...state, researcher: { ...state.researcher, state: 'running' } };
    }
    if (stepId === 'designer-solver') {
      const nextIter = (p.payload?.iterationCount ?? state.designerSolver.iterations.length) + 1;
      const exists = state.designerSolver.iterations.find((i) => i.iter === nextIter);
      const iterations = exists
        ? state.designerSolver.iterations
        : [...state.designerSolver.iterations, { iter: nextIter, state: 'running' as StepState }];
      return {
        ...state,
        designerSolver: { state: 'running', iterations },
      };
    }
    if (stepId === 'reviewer') {
      return { ...state, reviewer: { state: 'running' } };
    }
  }

  if (t === 'workflow-step-result') {
    if (stepId === 'researcher') {
      const out = p.output as ResearcherOutput | undefined;
      return {
        ...state,
        researcher: {
          state: 'success',
          selected: out?.selectedScenario,
          candidates: out?.allCandidates?.candidates,
        },
      };
    }
    if (stepId === 'designer-solver') {
      const out = p.output as DesignerSolverOutput | undefined;
      const iter = out?.iterationCount ?? state.designerSolver.iterations.length;
      const accepted = out?.decision?.accepted === true;
      const iterations = state.designerSolver.iterations.map((i) =>
        i.iter === iter
          ? {
              ...i,
              state: (accepted ? 'success' : 'rejected') as StepState,
              problem: out?.problem,
              decision: out?.decision,
            }
          : i,
      );
      return {
        ...state,
        designerSolver: {
          state: accepted ? 'success' : state.designerSolver.state,
          iterations,
        },
      };
    }
    if (stepId === 'reviewer') {
      const out = p.output as TeacherPackage | undefined;
      return {
        ...state,
        reviewer: { state: 'success' },
        finalPackage: out,
      };
    }
  }

  return state;
}
