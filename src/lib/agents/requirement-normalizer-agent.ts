import type {
  AgentTrace,
  Requirement,
} from "../types.js";

import type {
  TaskResearchResult,
} from "./task-research-agent.js";

export interface RequirementAnalysis {
  requirements: Requirement[];
  trace: AgentTrace;
}

export async function runRequirementNormalizerAgent(
  research: TaskResearchResult,
): Promise<RequirementAnalysis> {
  const startedAt = new Date().toISOString();

  const requirements = research.requirements
    .filter(
      (requirement) =>
        requirement &&
        typeof requirement.title === "string" &&
        typeof requirement.description === "string",
    )
    .map((requirement, index) => ({
      ...requirement,

      id:
        requirement.id?.trim() ||
        `REQ-${String(index + 1).padStart(3, "0")}`,

      title: requirement.title.trim(),

      description: requirement.description.trim(),

      acceptanceCriteria: Array.isArray(
        requirement.acceptanceCriteria,
      )
        ? requirement.acceptanceCriteria
            .filter(
              (criterion): criterion is string =>
                typeof criterion === "string" &&
                criterion.trim().length > 0,
            )
            .map((criterion) => criterion.trim())
        : [],
    }));

  return {
    requirements,

    trace: {
      agent: "requirement-normalizer-agent",
      startedAt,
      completedAt: new Date().toISOString(),

      inputSummary:
        `${research.requirements.length} research requirements`,

      actions: [
        "Read Research Agent output",
        "Normalized requirement identifiers",
        "Validated titles and descriptions",
        "Validated acceptance criteria",
        "Prepared requirements for implementation verification",
      ],

      findings: [
        `Normalized ${requirements.length} requirements.`,
        "Preserved requirement priorities.",
        "Preserved acceptance criteria.",
        "Separated requirement extraction from implementation verification.",
      ],

      retries: 0,
    },
  };
}