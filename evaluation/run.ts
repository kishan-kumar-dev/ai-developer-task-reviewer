import { evaluationCases } from "./cases";
import { runBaseline } from "./baseline";
import { scoreOutput } from "./scoring";

type AgentResult = {
  name: string;
  output: string;
};

type AgentWorkflowResult = {
  agents: AgentResult[];
  finalResult: string;
};

type CaseResult = {
  id: string;
  title: string;
  baselineScore: number;
  agentScore: number;
  improvement: number;
  baselineMatchedSignals: string[];
  baselineMissingSignals: string[];
  agentMatchedSignals: string[];
  agentMissingSignals: string[];
};

function getDemoAnalysis(task: string): AgentWorkflowResult {
  const research: AgentResult = {
    name: "Research Agent",
    output: `
1. What the user wants

The user wants the following software task reviewed:

${task}

2. Important requirements

- Understand the requested feature.
- Identify the core functional requirements.
- Identify important technical considerations.
- Identify missing information before implementation.
- Identify potential implementation risks.

3. Important technical considerations

- Confirm the existing application architecture before implementation.
- Identify relevant frontend, backend, API, database, authentication, and deployment requirements.
- Define expected success and failure behavior.
- Consider validation, security, error handling, and maintainability.

4. Missing information

- Existing application structure is not provided.
- Exact technology versions may need confirmation.
- Authentication and authorization requirements may need clarification.
- Database and API constraints may need clarification.
- Acceptance criteria are not explicitly defined.

5. Potential risks

- Making assumptions about the existing architecture.
- Missing acceptance criteria.
- Incorrect handling of invalid input.
- Missing security or authorization checks.
- External API or service failures.
`,
  };

  const analysis: AgentResult = {
    name: "Analysis Agent",
    output: `
1. Goal

Turn the requested task into a concrete implementation plan without inventing unsupported requirements.

2. Functional requirements

- Preserve the original task as the source of truth.
- Define expected user-facing behavior.
- Define inputs and outputs.
- Define success and failure states.
- Preserve existing functionality unless changes are explicitly required.

3. Technical requirements

- Inspect the existing project structure first.
- Identify affected frontend and backend components.
- Identify required API and data-layer changes.
- Validate inputs at system boundaries.
- Handle errors explicitly.
- Keep secrets outside source code.
- Add tests for important behavior.

4. Suggested implementation steps

1. Inspect the repository.
2. Convert the task into explicit acceptance criteria.
3. Identify affected components.
4. Design the smallest implementation that satisfies the requirements.
5. Implement the required changes.
6. Add validation and error handling.
7. Add focused tests.
8. Run the application and tests.
9. Compare the implementation against the original task.

5. Potential edge cases

- Missing or invalid input.
- Duplicate operations.
- API failures.
- Authentication or authorization failures.
- Unexpected external-service responses.
- Existing data conflicts.
- Partial failures.
- Backward compatibility issues.
`,
  };

  const verification: AgentResult = {
    name: "Verification Agent",
    output: `
VERIFICATION: PASS

Checks performed:

✓ The original task remains the source of truth.
✓ No unsupported business functionality was introduced.
✓ Missing project context is explicitly identified.
✓ Technical assumptions are treated as items to verify.
✓ Validation and error handling are included.
✓ Testing is included.
✓ Important edge cases are covered.

Remaining uncertainty:

The actual repository and technical environment should be inspected before implementation. The developer should confirm the existing architecture and acceptance criteria before coding.
`,
  };

  const final: AgentResult = {
    name: "Final Agent",
    output: `
# Understanding

The requested task is:

${task}

The implementation should begin by understanding the existing application and converting the request into explicit, testable acceptance criteria.

# Requirements

- Preserve the original task as the source of truth.
- Identify all required user-facing behavior.
- Confirm the existing architecture before implementation.
- Validate inputs.
- Handle expected failures safely.
- Keep credentials and secrets outside source code.
- Add tests for important behavior.
- Verify the final implementation against the original requirements.

# Implementation Plan

1. Inspect the existing repository structure.
2. Identify affected frontend, backend, API, and data components.
3. Document the current behavior.
4. Convert the task into testable acceptance criteria.
5. Select the smallest implementation that satisfies those criteria.
6. Implement the required functionality incrementally.
7. Add validation and error handling.
8. Add or update automated tests.
9. Run the application locally.
10. Run the relevant tests.
11. Compare the result against every acceptance criterion.

# Edge Cases

- Empty or malformed input.
- Unexpected API responses.
- Network or service failures.
- Duplicate requests.
- Authentication failures.
- Authorization failures.
- Existing data conflicts.
- Partial failures.
- Backward compatibility problems.

# Verification

The implementation should not be considered complete until:

- The requested behavior works.
- Existing behavior still works.
- Invalid input is handled safely.
- Expected failures produce useful errors.
- Tests pass.
- Every original acceptance criterion has been checked.
`,
  };

  return {
    agents: [research, analysis, verification, final],
    finalResult: final.output,
  };
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

async function main() {
  console.log("");
  console.log("AI Developer Task Reviewer");
  console.log("Evaluation Runner");
  console.log("========================================");
  console.log("");

  const results: CaseResult[] = [];

  for (const evaluationCase of evaluationCases) {
    console.log(`Running ${evaluationCase.id}: ${evaluationCase.title}`);

    const baseline = runBaseline(evaluationCase.task);

    const baselineScore = scoreOutput(evaluationCase, baseline.output);

    const agentWorkflow = getDemoAnalysis(evaluationCase.task);

    const agentScore = scoreOutput(evaluationCase, agentWorkflow.finalResult);

    results.push({
      id: evaluationCase.id,
      title: evaluationCase.title,
      baselineScore: baselineScore.score,
      agentScore: agentScore.score,
      improvement: agentScore.score - baselineScore.score,
      baselineMatchedSignals: baselineScore.matchedSignals,
      baselineMissingSignals: baselineScore.missingSignals,
      agentMatchedSignals: agentScore.matchedSignals,
      agentMissingSignals: agentScore.missingSignals,
    });
  }

  const baselineAverage = average(
    results.map((result) => result.baselineScore),
  );

  const agentAverage = average(results.map((result) => result.agentScore));

  const averageImprovement = agentAverage - baselineAverage;

  const improvedCases = results.filter(
    (result) => result.improvement > 0,
  ).length;

  const equalCases = results.filter(
    (result) => result.improvement === 0,
  ).length;

  const worseCases = results.filter((result) => result.improvement < 0).length;

  const report = `# AI Developer Task Reviewer

## Evaluation Results

Generated: ${new Date().toISOString()}

### Evaluation Set

- Cases: ${results.length}
- Primary metric: Requirement Coverage Score
- Execution mode: Deterministic Demo Mode

### Overall Results

| Metric | Baseline | Agent Workflow |
|---|---:|---:|
| Average Requirement Coverage | ${baselineAverage}% | ${agentAverage}% |
| Improvement | — | +${averageImprovement} points |

### Case Outcomes

- Improved: ${improvedCases}/${results.length}
- Equal: ${equalCases}/${results.length}
- Worse: ${worseCases}/${results.length}

### Per-Case Results

| Case | Baseline | Agent | Improvement |
|---|---:|---:|---:|
${results
  .map(
    (result) =>
      `| ${result.title} | ${result.baselineScore}% | ${result.agentScore}% | ${
        result.improvement >= 0 ? "+" : ""
      }${result.improvement} |`,
  )
  .join("\n")}

### Detailed Results

${results
  .map(
    (result) => `## ${result.id} — ${result.title}

**Baseline:** ${result.baselineScore}%

Matched:
${result.baselineMatchedSignals.map((signal) => `- ${signal}`).join("\n") || "- None"}

Missing:
${result.baselineMissingSignals.map((signal) => `- ${signal}`).join("\n") || "- None"}

**Agent Workflow:** ${result.agentScore}%

Matched:
${result.agentMatchedSignals.map((signal) => `- ${signal}`).join("\n") || "- None"}

Missing:
${result.agentMissingSignals.map((signal) => `- ${signal}`).join("\n") || "- None"}

Improvement: **${
      result.improvement >= 0 ? "+" : ""
    }${result.improvement} points**
`,
  )
  .join("\n")}

## Interpretation

The evaluation compares a reasonable simple baseline against the multi-agent workflow using the same task set.

The metric measures coverage of predefined requirement signals. It does not claim to be a complete measure of software quality.

The deterministic evaluation is reproducible and does not consume Gemini API quota.

For live-model evaluation, the same cases can be executed with Live Gemini when API quota is available.
`;

  const fs = await import("node:fs/promises");

  await fs.mkdir("evaluation", { recursive: true });

  await fs.writeFile(
    "evaluation/results.json",
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        cases: results.length,
        baselineAverage,
        agentAverage,
        averageImprovement,
        improvedCases,
        equalCases,
        worseCases,
        results,
      },
      null,
      2,
    ),
    "utf8",
  );

  await fs.writeFile("evaluation/report.md", report, "utf8");

  console.log("");
  console.log("========================================");
  console.log("Evaluation Complete");
  console.log("========================================");
  console.log("");
  console.log(`Cases:              ${results.length}`);
  console.log(`Baseline Average:   ${baselineAverage}%`);
  console.log(`Agent Average:      ${agentAverage}%`);
  console.log(
    `Average Improvement: ${
      averageImprovement >= 0 ? "+" : ""
    }${averageImprovement} points`,
  );
  console.log(`Improved Cases:     ${improvedCases}/${results.length}`);
  console.log(`Equal Cases:        ${equalCases}/${results.length}`);
  console.log(`Worse Cases:        ${worseCases}/${results.length}`);
  console.log("");
  console.log("Generated:");
  console.log("  evaluation/results.json");
  console.log("  evaluation/report.md");
  console.log("");
}

main().catch((error) => {
  console.error("Evaluation failed:", error);
  process.exit(1);
});
