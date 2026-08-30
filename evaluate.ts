const BASE_URL = "http://localhost:3000";

const task =
  "Add Stripe subscriptions to our Next.js SaaS application. Users should be able to upgrade, downgrade, and cancel their subscription.";

type Agent = {
  agent?: string;
  name?: string;
  output?: string;
  findings?: string[];
};

type AnalyzeResponse = {
  success?: boolean;
  mode?: "demo" | "live";
  task?: string;
  requirements?: unknown[];
  findings?: unknown[];
  agents?: Agent[];
  finalResult?: unknown;
  trace?: {
    agentCount?: number;
  };
  error?: string;
};

type EvaluationCheck = {
  name: string;
  passed: boolean;
};

function agentName(agent: Agent): string {
  return agent.agent ?? agent.name ?? "";
}

function hasAgent(agents: Agent[] | undefined, expectedName: string): boolean {
  return Boolean(agents?.some((agent) => agentName(agent) === expectedName));
}

function hasFinalResult(finalResult: unknown): boolean {
  if (!finalResult) {
    return false;
  }

  if (typeof finalResult === "string") {
    return finalResult.trim().length > 0;
  }

  if (typeof finalResult === "object") {
    return Object.keys(finalResult as object).length > 0;
  }

  return false;
}

async function main() {
  console.log("");
  console.log("========================================");
  console.log(" AI Developer Task Reviewer Evaluation");
  console.log("========================================");
  console.log("");

  console.log("Testing Demo Mode...");
  console.log("");

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task,
        mode: "demo",
      }),
    });
  } catch (error) {
    console.error("");
    console.error("❌ Could not connect to the application.");
    console.error("");
    console.error("Make sure the development server is running:");
    console.error("");
    console.error("npm run dev");
    console.error("");

    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    }

    process.exit(1);
  }

  let data: AnalyzeResponse;

  try {
    data = (await response.json()) as AnalyzeResponse;
  } catch {
    console.error("");
    console.error("❌ API returned invalid JSON.");
    console.error(`HTTP status: ${response.status}`);
    process.exit(1);
  }

  const checks: EvaluationCheck[] = [];

  checks.push({
    name: "API request succeeded",
    passed: response.ok && data.success === true,
  });

  checks.push({
    name: "Demo mode is active",
    passed: data.mode === "demo",
  });

  const agents = data.agents ?? [];

  checks.push({
    name: "Five agents executed",
    passed: agents.length === 5,
  });

  checks.push({
    name: "Research Agent exists",
    passed: hasAgent(agents, "Research Agent"),
  });

  checks.push({
    name: "Requirement Normalizer Agent exists",
    passed: hasAgent(agents, "Requirement Normalizer"),
  });

  checks.push({
    name: "Implementation Agent exists",
    passed: hasAgent(agents, "Implementation Agent"),
  });

  checks.push({
    name: "Verification Agent exists",
    passed: hasAgent(agents, "Verification Agent"),
  });

  checks.push({
    name: "Final Solution Agent exists",
    passed: hasAgent(agents, "Final Solution Agent"),
  });

  checks.push({
    name: "Requirements exist",
    passed: Array.isArray(data.requirements) && data.requirements.length > 0,
  });

  checks.push({
    name: "Findings exist",
    passed: Array.isArray(data.findings) && data.findings.length > 0,
  });

  checks.push({
    name: "Final result exists",
    passed: hasFinalResult(data.finalResult),
  });

  checks.push({
    name: "Workflow trace reports five agents",
    passed: data.trace?.agentCount === 5,
  });

  console.log("Evaluation Results:");
  console.log("");

  for (const check of checks) {
    console.log(`${check.passed ? "✅" : "❌"} ${check.name}`);
  }

  const failures = checks.filter((check) => !check.passed);

  console.log("");
  console.log("----------------------------------------");

  if (failures.length === 0) {
    console.log("✅ All evaluation checks passed.");
    console.log("----------------------------------------");
    console.log("");

    console.log("Workflow:");
    console.log("  1. Research Agent");
    console.log("  2. Requirement Normalizer");
    console.log("  3. Implementation Agent");
    console.log("  4. Verification Agent");
    console.log("  5. Final Solution Agent");
    console.log("");

    console.log(`Requirements: ${data.requirements?.length ?? 0}`);

    console.log(`Findings:     ${data.findings?.length ?? 0}`);

    console.log(`Agents:       ${data.agents?.length ?? 0}`);

    console.log("");
    process.exit(0);
  }

  console.log(`❌ Evaluation failed: ${failures.length} check(s) failed.`);

  console.log("");

  if (data.error) {
    console.log(`API Error: ${data.error}`);
  }

  console.log("");
  process.exit(1);
}

main().catch((error) => {
  console.error("");
  console.error("Evaluation failed:");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
});
