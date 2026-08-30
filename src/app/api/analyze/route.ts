import { NextRequest, NextResponse } from "next/server";

import {
  researchAgent,
  analysisAgent,
  verificationAgent,
  finalAgent,
} from "@/lib/agents";

import { GeminiRateLimitError } from "@/lib/gemini";
import { getDemoAnalysis } from "@/lib/demo";

export async function POST(request: NextRequest) {
  try {
    // --------------------------------------------------
    // Parse request body
    // --------------------------------------------------

    let body: {
      task?: unknown;
      mode?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // Validate task
    // --------------------------------------------------

    if (!body.task || typeof body.task !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Task is required.",
        },
        { status: 400 },
      );
    }

    const trimmedTask = body.task.trim();

    if (!trimmedTask) {
      return NextResponse.json(
        {
          success: false,
          error: "Task cannot be empty.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // Determine execution mode
    // --------------------------------------------------

    const mode = body.mode === "live" ? "live" : "demo";

    // --------------------------------------------------
    // DEMO MODE
    //
    // Deterministic local workflow.
    // Does NOT consume Gemini API quota.
    // --------------------------------------------------

    if (mode === "demo") {
      const demo = getDemoAnalysis(trimmedTask);

      return NextResponse.json({
        success: true,
        mode: "demo",
        task: trimmedTask,
        agents: demo.agents,
        finalResult: demo.finalResult,
        message:
          "Demo mode — results are generated locally without consuming Gemini API quota.",
      });
    }

    // --------------------------------------------------
    // LIVE GEMINI MODE
    // --------------------------------------------------

    const research = await researchAgent(trimmedTask);

    const analysis = await analysisAgent(trimmedTask, research.output);

    const verification = await verificationAgent(trimmedTask, analysis.output);

    const final = await finalAgent(
      trimmedTask,
      research.output,
      analysis.output,
      verification.output,
    );

    // --------------------------------------------------
    // Final response
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      mode: "live",
      task: trimmedTask,
      agents: [research, analysis, verification, final],
      finalResult: final.output,
    });
  } catch (error: unknown) {
    console.error("Analyze API error:", error);

    // --------------------------------------------------
    // Gemini quota/rate-limit error
    // --------------------------------------------------

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

    // --------------------------------------------------
    // Generic error
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown server error.",
      },
      { status: 500 },
    );
  }
}
