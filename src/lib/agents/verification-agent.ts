import type {
  AgentTrace,
  Requirement,
  RequirementFinding,
  VerificationResult,
} from "../types.js";

export async function runVerificationAgent(
  requirements: Requirement[],
  findings: RequirementFinding[],
): Promise<VerificationResult> {
  const startedAt = new Date().toISOString();

  const issues: string[] = [];

  const verifiedFindings = findings.map((finding) => {
    const requirement = requirements.find(
      (item) => item.id === finding.requirementId,
    );

    if (!requirement) {
      issues.push(
        `Finding ${finding.requirementId} does not map to a known requirement.`,
      );

      return {
        ...finding,
        status: "missing" as const,
        confidence: 0.2,
        reasoning:
          "Finding could not be mapped to a normalized requirement.",
      };
    }

    if (
      finding.status === "complete" &&
      finding.evidence.length === 0
    ) {
      issues.push(
        `${requirement.id} was marked complete without repository evidence.`,
      );

      return {
        ...finding,
        status: "partial" as const,
        confidence: Math.min(finding.confidence, 0.4),
        reasoning:
          "A complete status requires concrete repository evidence.",
      };
    }

    if (
      finding.status === "complete" &&
      finding.evidence.length < 2 &&
      requirement.priority === "critical"
    ) {
      issues.push(
        `${requirement.id} is critical but has limited independent evidence.`,
      );

      return {
        ...finding,
        status: "partial" as const,
        confidence: Math.min(finding.confidence, 0.7),
        reasoning:
          "Critical requirements require stronger independent evidence.",
      };
    }

    return finding;
  });

  const trace: AgentTrace = {
    agent: "verification-agent",
    startedAt,
    completedAt: new Date().toISOString(),

    inputSummary:
      `${requirements.length} requirements and ` +
      `${findings.length} implementation findings`,

    actions: [
      "Read normalized requirements",
      "Read implementation findings",
      "Checked requirement-to-finding mappings",
      "Checked evidence presence",
      "Applied stricter validation to critical requirements",
      "Rejected unsupported complete claims",
    ],

    findings: [
      `Verified ${verifiedFindings.length} findings.`,
      `Detected ${issues.length} verification issues.`,
    ],

    retries: 0,
  };

  return {
    findings: verifiedFindings,
    issues,
    trace,
  };
}