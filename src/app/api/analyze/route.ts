import { NextRequest, NextResponse } from "next/server";

import { runReviewWorkflow } from "@/lib/agents/workflow";
import { GeminiRateLimitError } from "@/lib/gemini";
import { getDemoAnalysis } from "@/lib/demo";

export const runtime = "nodejs";

const DEFAULT_REPOSITORY_PATH = process.env.REPOSITORY_PATH || process.cwd();

type AnalyzeRequestBody = {
  task?: unknown;
  repositoryPath?: unknown;
  mode?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    let body: AnalyzeRequestBody;

    try {
      body = (await request.json()) as AnalyzeRequestBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
        { status: 400 },
      );
    }

    if (typeof body.task !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Task is required.",
        },
        { status: 400 },
      );
    }

    const task = body.task.trim();

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: "Task cannot be empty.",
        },
        { status: 400 },
      );
    }

    let repositoryPath = DEFAULT_REPOSITORY_PATH;

    if (typeof body.repositoryPath === "string") {
      const trimmedRepositoryPath = body.repositoryPath.trim();

      if (trimmedRepositoryPath) {
        repositoryPath = trimmedRepositoryPath;
      }
    }

    const mode = body.mode === "demo" ? "demo" : "live";

    /*
     * -------------------------------------------------------
     * DEMO MODE
     * -------------------------------------------------------
     *
     * Demo mode deliberately avoids Gemini and repository
     * inspection. It gives a deterministic result that is
     * useful for demonstrations and testing the UI.
     */

    if (mode === "demo") {
      const demo = getDemoAnalysis(task);

      return NextResponse.json({
        success: true,
        mode: "demo",
        task,
        repositoryPath,
        requirements: demo.requirements,
        findings: demo.findings,
        finalResult: demo.finalResult,
        agents: demo.agents,
        trace: demo.trace,
        message:
          "Demo mode — five-agent results are generated locally without consuming Gemini API quota.",
      });
    }

    /*
     * -------------------------------------------------------
     * LIVE FIVE-AGENT WORKFLOW
     * -------------------------------------------------------
     *
     * 1. Research Agent
     * 2. Requirement Normalizer
     * 3. Implementation Agent
     * 4. Verification Agent
     * 5. Final Solution Agent
     *
     * The repository path is passed to the workflow so the
     * Implementation Agent can inspect the candidate codebase.
     */

    const workflow = await runReviewWorkflow({
      task,
      repositoryPath,
      mode: "live",
    });

    return NextResponse.json({
      success: true,
      mode: "live",
      task,
      repositoryPath,
      requirements: workflow.requirements,
      findings: workflow.findings,
      finalResult: workflow.finalResult,
      agents: workflow.agents,
      trace: workflow.trace,
      message: "Five-agent repository review workflow completed successfully.",
    });
  } catch (error: unknown) {
    console.error("Analyze API error:", error);

    /*
     * -------------------------------------------------------
     * GEMINI RATE LIMIT / QUOTA ERROR
     * -------------------------------------------------------
     */

    if (error instanceof GeminiRateLimitError) {
      return NextResponse.json(
        {
          success: false,
          mode: "live",
          error: error.message,
          retryAfter: error.retryAfterSeconds,
          quotaExceeded: true,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(error.retryAfterSeconds),
          },
        },
      );
    }

    /*
     * -------------------------------------------------------
     * GENERIC ERROR
     * -------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
