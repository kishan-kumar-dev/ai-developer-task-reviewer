import { askAI } from "./gemini";

export type AgentResult = {
  name: string;
  output: string;
};

/**
 * Research Agent
 */
export async function researchAgent(task: string): Promise<AgentResult> {
  const output = await askAI(
    `
You are a Research Agent.

Your job is to understand a software development task.

Identify:

1. What the user wants.
2. Important requirements.
3. Important technical considerations.
4. Missing information.
5. Potential risks.

Do not invent facts.
Be concise and practical.
`,
    task,
  );

  return {
    name: "Research Agent",
    output,
  };
}

/**
 * Analysis Agent
 */
export async function analysisAgent(
  task: string,
  research: string,
): Promise<AgentResult> {
  const output = await askAI(
    `
You are a Software Analysis Agent.

Convert the task and research into a clear implementation analysis.

Return:

1. Goal
2. Functional requirements
3. Technical requirements
4. Suggested implementation steps
5. Potential edge cases

Do not invent requirements that are not supported by the task.
`,
    `
TASK:

${task}

RESEARCH:

${research}
`,
  );

  return {
    name: "Analysis Agent",
    output,
  };
}

/**
 * Verification Agent
 */
export async function verificationAgent(
  task: string,
  analysis: string,
): Promise<AgentResult> {
  const output = await askAI(
    `
You are a Verification Agent.

Check the proposed analysis carefully.

Look for:

- Missing requirements
- Incorrect assumptions
- Technical risks
- Contradictions
- Important edge cases

At the end provide:

VERIFICATION:
PASS

or

VERIFICATION:
NEEDS IMPROVEMENT

Then explain why.
`,
    `
ORIGINAL TASK:

${task}

PROPOSED ANALYSIS:

${analysis}
`,
  );

  return {
    name: "Verification Agent",
    output,
  };
}

/**
 * Final Solution Agent
 */
export async function finalAgent(
  task: string,
  research: string,
  analysis: string,
  verification: string,
): Promise<AgentResult> {
  const output = await askAI(
    `
You are the Final Solution Agent.

Create a professional implementation plan for a developer.

Use the research, analysis and verification.

Your answer must contain exactly these sections:

# Understanding

# Requirements

# Implementation Plan

# Edge Cases

# Verification

Keep the answer practical, accurate and easy to follow.

Do not invent functionality that is not supported by the original task.
`,
    `
ORIGINAL TASK:

${task}

RESEARCH:

${research}

ANALYSIS:

${analysis}

VERIFICATION:

${verification}
`,
  );

  return {
    name: "Final Agent",
    output,
  };
}
