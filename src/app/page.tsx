"use client";

import { useState } from "react";

type Agent = {
  name: string;
  output: string;
};

type Mode = "demo" | "live";

export default function Home() {
  const [task, setTask] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [finalResult, setFinalResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("demo");
  const [completedMode, setCompletedMode] = useState<Mode | null>(null);

  async function handleAnalyze() {
    if (!task.trim()) {
      setError("Please enter a developer task.");
      return;
    }

    setLoading(true);
    setError("");
    setAgents([]);
    setFinalResult("");
    setCompletedMode(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: task.trim(),
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setAgents(data.agents || []);
      setFinalResult(data.finalResult || "");
      setCompletedMode(data.mode || mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function tryExample() {
    setTask(
      "Build a file upload feature that allows users to upload PDF documents and view their upload history.",
    );

    setError("");
    setAgents([]);
    setFinalResult("");
    setCompletedMode(null);
  }

  function clearResults() {
    setTask("");
    setAgents([]);
    setFinalResult("");
    setError("");
    setCompletedMode(null);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Agentic Workflows Hackathon
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            AI Developer Task Reviewer
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Turn ambiguous software development tasks into reliable,
            developer-ready implementation plans.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-400">
            <span>Research</span>
            <span>→</span>
            <span>Analysis</span>
            <span>→</span>
            <span>Verification</span>
            <span>→</span>
            <span>Final</span>
          </div>
        </header>

        {/* Agent architecture */}
        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <AgentCard
            number="01"
            title="Research Agent"
            description="Extracts requirements, context, risks and missing information."
          />

          <AgentCard
            number="02"
            title="Analysis Agent"
            description="Converts research into a practical implementation strategy."
          />

          <AgentCard
            number="03"
            title="Verification Agent"
            description="Checks assumptions, omissions, contradictions and edge cases."
          />

          <AgentCard
            number="04"
            title="Final Solution Agent"
            description="Produces the final developer-ready implementation plan."
          />
        </section>

        {/* Input */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Developer Task</h2>

              <p className="mt-1 text-sm text-slate-400">
                Describe the software feature or engineering problem you want
                the agents to review.
              </p>
            </div>

            <button
              type="button"
              onClick={tryExample}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Try an example
            </button>
          </div>

          <textarea
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder="Example: Build a file upload feature that allows users to upload PDF documents and view their upload history."
            className="min-h-44 w-full resize-y rounded-2xl border border-slate-700 bg-slate-950 p-5 text-white outline-none transition placeholder:text-slate-600 focus:border-slate-400"
          />

          {/* Mode selector */}
          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="mb-3">
              <p className="text-sm font-semibold">Execution Mode</p>

              <p className="mt-1 text-xs text-slate-500">
                Demo mode is deterministic and does not use Gemini API quota.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("demo")}
                className={`rounded-xl border p-4 text-left transition ${
                  mode === "demo"
                    ? "border-white bg-white text-slate-950"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Demo Mode</span>

                  {mode === "demo" && (
                    <span className="text-xs font-bold">SELECTED</span>
                  )}
                </div>

                <p
                  className={`mt-2 text-xs ${
                    mode === "demo" ? "text-slate-600" : "text-slate-500"
                  }`}
                >
                  Local deterministic workflow. Best for judging and
                  reproducibility.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode("live")}
                className={`rounded-xl border p-4 text-left transition ${
                  mode === "live"
                    ? "border-white bg-white text-slate-950"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Live Gemini</span>

                  {mode === "live" && (
                    <span className="text-xs font-bold">SELECTED</span>
                  )}
                </div>

                <p
                  className={`mt-2 text-xs ${
                    mode === "live" ? "text-slate-600" : "text-slate-500"
                  }`}
                >
                  Runs the four agents using the configured Gemini API.
                </p>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-4">
              <p className="text-sm font-semibold text-red-300">
                Analysis could not be completed
              </p>

              <p className="mt-1 text-sm text-red-400">{error}</p>

              {mode === "live" && (
                <p className="mt-2 text-xs text-red-500">
                  You can switch to Demo Mode to run the workflow without
                  consuming Gemini quota.
                </p>
              )}
            </div>
          )}

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={clearResults}
              disabled={loading}
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white disabled:opacity-50"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Agents are working..." : "Analyze Task"}
            </button>
          </div>
        </section>

        {/* Running state */}
        {loading && (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 animate-pulse rounded-full bg-white" />

              <h2 className="font-semibold">Running agent workflow...</h2>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Research → Analysis → Verification → Final
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Mode: {mode === "demo" ? "Deterministic Demo" : "Live Gemini"}
            </p>
          </section>
        )}

        {/* Completed mode */}
        {completedMode && !loading && (
          <div className="mt-8 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-5 py-3">
            <span className="text-sm text-slate-400">Workflow completed</span>

            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold">
              {completedMode === "demo" ? "DEMO MODE" : "LIVE GEMINI"}
            </span>
          </div>
        )}

        {/* Agents */}
        {agents.length > 0 && (
          <section className="mt-8">
            <div className="mb-5">
              <h2 className="text-2xl font-bold">Agent Workflow</h2>

              <p className="mt-1 text-sm text-slate-500">
                Each stage receives the relevant output from the previous stage.
              </p>
            </div>

            <div className="space-y-4">
              {agents.map((agent, index) => (
                <div
                  key={`${agent.name}-${index}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-950">
                      {index + 1}
                    </div>

                    <div>
                      <h3 className="font-semibold">{agent.name}</h3>

                      <p className="text-xs text-slate-500">Complete</p>
                    </div>
                  </div>

                  <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {agent.output}
                  </pre>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Final result */}
        {finalResult && (
          <section className="mt-8 rounded-3xl border border-slate-700 bg-white p-6 text-slate-950 shadow-2xl sm:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Final Output
                </p>

                <h2 className="mt-1 text-2xl font-bold">Implementation Plan</h2>
              </div>

              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold">
                VERIFIED
              </span>
            </div>

            <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {finalResult}
            </pre>
          </section>
        )}

        <footer className="mt-12 pb-8 text-center text-xs text-slate-600">
          AI Developer Task Reviewer · Agentic Workflows Hackathon
        </footer>
      </div>
    </main>
  );
}

function AgentCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-slate-500">
          {number}
        </span>

        <span className="h-2 w-2 rounded-full bg-white" />
      </div>

      <h2 className="font-semibold">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
