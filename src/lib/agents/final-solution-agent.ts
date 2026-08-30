import type {
  AgentTrace,
  FinalReviewResult,
  Requirement,
  RequirementFinding,
} from "../types.js";

export async function runFinalSolutionAgent(
  requirements: Requirement[],
  findings: RequirementFinding[],
  verificationIssues: string[],
): Promise<FinalReviewResult> {
  const startedAt = new Date().toISOString();

  const complete = findings.filter(
    (finding) => finding.status === "complete",
  );

  const partial = findings.filter(
    (finding) => finding.status === "partial",
  );

  const missing = findings.filter(
    (finding) => finding.status === "missing",
  );

  const strengths = complete.map(
    (finding) =>
      `${finding.requirementId}: requirement has concrete implementation evidence.`,
  );

  const gaps = [
    ...partial.map(
      (finding) =>
        `${finding.requirementId}: implementation evidence is incomplete.`,
    ),
    ...missing.map(
      (finding) =>
        `${finding.requirementId}: implementation evidence was not found.`,
    ),
  ];

  const risks = [...verificationIssues];

  const recommendations = requirements
    .filter((requirement) => {
      const finding = findings.find(
        (item) => item.requirementId === requirement.id,
      );

      return (
        !finding ||
        finding.status !== "complete"
      );
    })
    .map(
      (requirement) =>
        `Address ${requirement.id}: ${requirement.title}.`,
    );

  let overallAssessment = "The repository requires additional work.";

  if (
    missing.length === 0 &&
    partial.length === 0 &&
    verificationIssues.length === 0
  ) {
    overallAssessment =
      "All normalized requirements have concrete evidence and passed verification.";
  } else if (complete.length > missing.length) {
    overallAssessment =
      "Most requirements have implementation evidence, but gaps remain.";
  }

  const summary =
    `${complete.length} complete, ` +
    `${partial.length} partial, ` +
    `${missing.length} missing requirements.`;

  const trace: AgentTrace = {
    agent: "final-solution-agent",
    startedAt,
    completedAt: new Date().toISOString(),

    inputSummary:
      `${requirements.length} requirements, ` +
      `${findings.length} findings, ` +
      `${verificationIssues.length} verification issues`,

    actions: [
      "Read verified implementation findings",
      "Separated complete, partial, and missing requirements",
      "Collected strengths",
      "Collected implementation gaps",
      "Collected verification risks",
      "Generated actionable recommendations",
    ],

    findings: [
      summary,
      `Generated ${recommendations.length} recommendations.`,
    ],

    retries: 0,
  };

  return {
    summary,
    strengths,
    gaps,
    risks,
    recommendations,
    overallAssessment,
    trace,
  };
}