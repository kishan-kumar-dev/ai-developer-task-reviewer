import { askAI } from "./gemini";

export type BaselineResult = {
  name: string;
  output: string;
};

export async function baselineAgent(
  task: string,
): Promise<BaselineResult> {
  const output = await askAI(
    `
You are a general-purpose software development assistant.

Review the developer task and provide a concise implementation plan.

Return:

1. Requirements
2. Implementation Steps
3. Risks

Use only information supported by the original task.

Do not invent specific technologies, APIs, databases, authentication systems,
or business rules unless they are explicitly stated.

Do not perform multi-agent reasoning.
Do not verify another agent's work.
`,
    task,
  );

  return {
    name: "Simple Baseline",
    output,
  };
}