const BASE_URL = "http://localhost:3000";

const task =
  "Add Stripe subscriptions to our Next.js SaaS application. Users should be able to upgrade, downgrade, and cancel their subscription.";

type Agent = {
  name: string;
  output: string;
};

type AnalyzeResponse = {
  success?: boolean;
  mode?: "demo" | "live";
  task?: string;
  agents?: Agent[];
  finalResult?: string;
  error?: string;
};

type EvaluationCheck = {
  name: string;
  passed: boolean;
};

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
  } catch {
    console.error("❌ Could not connect to the application.");
    console.error("");
    console.error("Make sure the development server is running:");
    console.error("");
    console.error("npm run dev");
    console.error("");
    process.exit(1);
  }

  let data: AnalyzeResponse;

  try {
    data = (await response.json()) as AnalyzeResponse;
  } catch {
    console.error("❌ API returned invalid JSON.");
    process.exit(1);
  }

  if (!response.ok) {
    console.error("❌ API request failed.");
    console.error(`HTTP ${response.status}`);
    console.error(data.error ?? data);
    process.exit(1);
  }

  const checks: EvaluationCheck[] = [
    {
      name: "API request succeeded",
      passed: data.success === true,
    },
    {
      name: "Demo mode is active",
      passed: data.mode === "demo",
    },
    {
      name: "Four agents executed",
      passed: Array.isArray(data.agents) && data.agents.length === 4,
    },
    {
      name: "Research Agent exists",
      passed: data.agents?.[0]?.name === "Research Agent",
    },
    {
      name: "Analysis Agent exists",
      passed: data.agents?.[1]?.name === "Analysis Agent",
    },
    {
      name: "Verification Agent exists",
      passed: data.agents?.[2]?.name === "Verification Agent",
    },
    {
      name: "Final Agent exists",
      passed: data.agents?.[3]?.name === "Final Agent",
    },
    {
      name: "Final result exists",
      passed:
        typeof data.finalResult === "string" &&
        data.finalResult.trim().length > 0,
    },
  ];

  console.log("Evaluation Results:");
  console.log("");

  for (const check of checks) {
    console.log(`${check.passed ? "✅" : "❌"} ${check.name}`);
  }

  const failed = checks.filter((check) => !check.passed);

  console.log("");
  console.log("----------------------------------------");

  if (failed.length > 0) {
    console.log(`❌ Evaluation failed: ${failed.length} check(s) failed.`);

    process.exit(1);
  }

  console.log("✅ All evaluation checks passed.");
  console.log("----------------------------------------");
  console.log("");
}

main().catch((error: unknown) => {
  console.error("❌ Unexpected evaluation error:");
  console.error(error);
  process.exit(1);
});
