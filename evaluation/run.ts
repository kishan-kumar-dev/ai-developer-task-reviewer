import { evaluationCases } from "./cases";
import { runBaseline } from "./baseline";
import { scoreOutput } from "./scoring";

type AgentResult = {
  agent: string;
  startedAt?: string;
  completedAt?: string;
  inputSummary?: string;
  actions?: string[];
  findings?: string[];
  retries?: number;
};

type AgentWorkflowResult = {
  success: boolean;
  mode?: string;
  requirements?: unknown[];
  findings?: unknown[];
  agents?: AgentResult[];
  finalResult?: {
    summary?: string;
    strengths?: string[];
    gaps?: string[];
    risks?: string[];
    recommendations?: string[];
    overallAssessment?: string;
  };
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
  requirements: number;
  findings: number;
  agents: number;
};

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

async function runRealDemoWorkflow(task: string): Promise<AgentWorkflowResult> {
  const response = await fetch("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task,
      mode: "demo",
    }),
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `API request failed with status ${response.status}: ${text}`,
    );
  }

  return (await response.json()) as AgentWorkflowResult;
}

async function main() {
  console.log("");
  console.log("AI Developer Task Reviewer");
  console.log("Evaluation Runner");
  console.log("========================================");
  console.log("");
  console.log("Using actual /api/analyze endpoint");
  console.log("Execution mode: Deterministic Demo Mode");
  console.log("");

  const results: CaseResult[] = [];

  for (const evaluationCase of evaluationCases) {
    console.log(`Running ${evaluationCase.id}: ${evaluationCase.title}`);

    const baseline = runBaseline(evaluationCase.task);

    const baselineScore = scoreOutput(evaluationCase, baseline.output);

    const agentWorkflow = await runRealDemoWorkflow(evaluationCase.task);

    if (!agentWorkflow.success) {
      throw new Error(
        `Workflow failed for ${evaluationCase.id}: ${JSON.stringify(
          agentWorkflow,
        )}`,
      );
    }

    const finalResultText = [
      agentWorkflow.finalResult?.summary ?? "",
      ...(agentWorkflow.finalResult?.strengths ?? []),
      ...(agentWorkflow.finalResult?.gaps ?? []),
      ...(agentWorkflow.finalResult?.risks ?? []),
      ...(agentWorkflow.finalResult?.recommendations ?? []),
      agentWorkflow.finalResult?.overallAssessment ?? "",
    ].join("\n");

    const agentScore = scoreOutput(evaluationCase, finalResultText);

    const requirementsCount = agentWorkflow.requirements?.length ?? 0;

    const findingsCount = agentWorkflow.findings?.length ?? 0;

    const agentsCount = agentWorkflow.agents?.length ?? 0;

    console.log(`  Requirements: ${requirementsCount}`);

    console.log(`  Findings:     ${findingsCount}`);

    console.log(`  Agents:       ${agentsCount}`);

    console.log(`  Baseline:     ${baselineScore.score}%`);

    console.log(`  Agent:        ${agentScore.score}%`);

    console.log(
      `  Improvement:  ${
        agentScore.score - baselineScore.score >= 0 ? "+" : ""
      }${agentScore.score - baselineScore.score}`,
    );

    if (agentsCount !== 5) {
      throw new Error(
        `${evaluationCase.id} expected 5 agents but received ${agentsCount}.`,
      );
    }

    if (requirementsCount === 0) {
      throw new Error(
        `${evaluationCase.id} returned zero normalized requirements.`,
      );
    }

    if (findingsCount === 0) {
      throw new Error(`${evaluationCase.id} returned zero findings.`);
    }

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
      requirements: requirementsCount,
      findings: findingsCount,
      agents: agentsCount,
    });

    console.log("");
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

  const totalRequirements = results.reduce(
    (sum, result) => sum + result.requirements,
    0,
  );

  const totalFindings = results.reduce(
    (sum, result) => sum + result.findings,
    0,
  );

  const totalAgents = results.reduce((sum, result) => sum + result.agents, 0);

  const report = `# AI Developer Task Reviewer

## Evaluation Results

Generated: ${new Date().toISOString()}

### Evaluation Set

- Cases: ${results.length}
- Primary metric: Requirement Coverage Score
- Execution mode: Deterministic Demo Mode
- Workflow source: Actual \`/api/analyze\` endpoint

### Workflow Validation

| Metric | Result |
|---|---:|
| Evaluation Cases | ${results.length} |
| Total Requirements | ${totalRequirements} |
| Total Findings | ${totalFindings} |
| Total Agent Executions | ${totalAgents} |
| Expected Agents Per Case | 5 |

### Overall Results

| Metric | Baseline | Agent Workflow |
|---|---:|---:|
| Average Requirement Coverage | ${baselineAverage}% | ${agentAverage}% |
| Improvement | — | ${
    averageImprovement >= 0 ? "+" : ""
  }${averageImprovement} points |

### Case Outcomes

- Improved: ${improvedCases}/${results.length}
- Equal: ${equalCases}/${results.length}
- Worse: ${worseCases}/${results.length}

### Per-Case Results

| Case | Requirements | Findings | Agents | Baseline | Agent | Improvement |
|---|---:|---:|---:|---:|---:|---:|
${results
  .map(
    (result) =>
      `| ${result.title} | ${result.requirements} | ${result.findings} | ${result.agents} | ${result.baselineScore}% | ${result.agentScore}% | ${
        result.improvement >= 0 ? "+" : ""
      }${result.improvement} |`,
  )
  .join("\n")}

### Detailed Results

${results
  .map(
    (result) => `## ${result.id} — ${result.title}

**Requirements:** ${result.requirements}

**Findings:** ${result.findings}

**Agents:** ${result.agents}

**Baseline:** ${result.baselineScore}%

Matched:
${
  result.baselineMatchedSignals.map((signal) => `- ${signal}`).join("\n") ||
  "- None"
}

Missing:
${
  result.baselineMissingSignals.map((signal) => `- ${signal}`).join("\n") ||
  "- None"
}

**Agent Workflow:** ${result.agentScore}%

Matched:
${
  result.agentMatchedSignals.map((signal) => `- ${signal}`).join("\n") ||
  "- None"
}

Missing:
${
  result.agentMissingSignals.map((signal) => `- ${signal}`).join("\n") ||
  "- None"
}

Improvement: **${
      result.improvement >= 0 ? "+" : ""
    }${result.improvement} points**
`,
  )
  .join("\n")}

## Interpretation

The evaluation compares a reasonable simple baseline against the actual five-agent application workflow using the same task set.

The evaluation calls the application's real \`/api/analyze\` endpoint in deterministic Demo Mode.

The metric measures coverage of predefined requirement signals. It does not claim to be a complete measure of software quality.

Demo Mode is deterministic and does not consume Gemini API quota.

Live Gemini evaluation can be performed separately when Gemini API access and quota are available.
`;

  const fs = await import("node:fs/promises");

  await fs.mkdir("evaluation", { recursive: true });

  await fs.writeFile(
    "evaluation/results.json",
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        cases: results.length,
        executionMode: "demo",
        workflow: "actual-api",
        expectedAgentsPerCase: 5,
        totalRequirements,
        totalFindings,
        totalAgentExecutions: totalAgents,
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
  console.log(`Cases:               ${results.length}`);
  console.log(`Total Requirements:  ${totalRequirements}`);
  console.log(`Total Findings:      ${totalFindings}`);
  console.log(`Total Agent Runs:    ${totalAgents}`);
  console.log(`Baseline Average:    ${baselineAverage}%`);
  console.log(`Agent Average:       ${agentAverage}%`);
  console.log(
    `Average Improvement: ${
      averageImprovement >= 0 ? "+" : ""
    }${averageImprovement} points`,
  );
  console.log(`Improved Cases:      ${improvedCases}/${results.length}`);
  console.log(`Equal Cases:         ${equalCases}/${results.length}`);
  console.log(`Worse Cases:         ${worseCases}/${results.length}`);
  console.log("");
  console.log("Generated:");
  console.log("  evaluation/results.json");
  console.log("  evaluation/report.md");
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("Evaluation failed:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
