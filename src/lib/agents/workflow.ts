import type {
  AgentTrace,
  FinalReviewResult,
  RequirementFinding,
  ReviewInput,
} from "../types";

import { runTaskResearchAgent } from "./task-research-agent";
import { runRequirementNormalizerAgent } from "./requirement-normalizer-agent";
import { runRepositoryImplementationAgent } from "./implementation-agent";
import { runVerificationAgent } from "./verification-agent";
import { runFinalSolutionAgent } from "./final-solution-agent";

export interface ReviewWorkflowResult {
  requirements: ReturnType<
    typeof runRequirementNormalizerAgent
  > extends Promise<infer T>
    ? T extends { requirements: infer R }
      ? R
      : never
    : never;

  findings: RequirementFinding[];

  finalResult: FinalReviewResult;

  agents: AgentTrace[];

  trace: {
    startedAt: string;
    completedAt: string;
    agentCount: number;
  };
}

export async function runReviewWorkflow(
  input: ReviewInput,
): Promise<ReviewWorkflowResult> {
  const startedAt = new Date().toISOString();

  // --------------------------------------------------
  // 1. Research Agent
  // --------------------------------------------------

  const research = await runTaskResearchAgent(input);

  // --------------------------------------------------
  // 2. Requirement Normalizer Agent
  // --------------------------------------------------

  const normalized =
    await runRequirementNormalizerAgent(research);

  let findings: RequirementFinding[] = [];

  // --------------------------------------------------
  // 3. Implementation / Repository Agent
  //
  // Only inspect a repository when a repository path
  // has been provided.
  // --------------------------------------------------

  if (input.repositoryPath) {
    const implementation =
      await runRepositoryImplementationAgent(
        input.repositoryPath,
        normalized.requirements,
      );

    findings = implementation.findings;

    // ------------------------------------------------
    // 4. Verification Agent
    // ------------------------------------------------

    const verification =
      await runVerificationAgent(
        normalized.requirements,
        findings,
      );

    findings = verification.findings;

    // ------------------------------------------------
    // 5. Final Solution Agent
    // ------------------------------------------------

    const finalResult =
      await runFinalSolutionAgent(
        normalized.requirements,
        findings,
        verification.issues,
      );

    return {
      requirements: normalized.requirements,
      findings,
      finalResult,

      agents: [
        research.trace,
        normalized.trace,
        implementation.trace,
        verification.trace,
        finalResult.trace,
      ],

      trace: {
        startedAt,
        completedAt: new Date().toISOString(),
        agentCount: 5,
      },
    };
  }

  // --------------------------------------------------
  // No repository supplied
  //
  // We can still verify the requirements themselves,
  // but we cannot claim implementation completeness.
  // --------------------------------------------------

  const verification =
    await runVerificationAgent(
      normalized.requirements,
      findings,
    );

  const finalResult =
    await runFinalSolutionAgent(
      normalized.requirements,
      findings,
      verification.issues,
    );

  return {
    requirements: normalized.requirements,
    findings,
    finalResult,

    agents: [
      research.trace,
      normalized.trace,
      verification.trace,
      finalResult.trace,
    ],

    trace: {
      startedAt,
      completedAt: new Date().toISOString(),
      agentCount: 4,
    },
  };
}