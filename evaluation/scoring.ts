import type { EvaluationCase } from "./cases";

export type EvaluationScore = {
  caseId: string;
  score: number;
  matchedSignals: string[];
  missingSignals: string[];
};

export function scoreOutput(
  evaluationCase: EvaluationCase,
  output: string,
): EvaluationScore {
  const normalized = output.toLowerCase();

  const matchedSignals = evaluationCase.expectedSignals.filter((signal) =>
    normalized.includes(signal.toLowerCase()),
  );

  const missingSignals = evaluationCase.expectedSignals.filter(
    (signal) => !normalized.includes(signal.toLowerCase()),
  );

  const score =
    evaluationCase.expectedSignals.length === 0
      ? 100
      : Math.round(
          (matchedSignals.length / evaluationCase.expectedSignals.length) *
            100,
        );

  return {
    caseId: evaluationCase.id,
    score,
    matchedSignals,
    missingSignals,
  };
}