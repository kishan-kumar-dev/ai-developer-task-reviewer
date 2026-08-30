"use client";

import { FormEvent, useState } from "react";

type AgentTrace = {
  agent?: string;
  name?: string;
  startedAt?: string;
  completedAt?: string;
  inputSummary?: string;
  actions?: string[];
  findings?: string[];
  retries?: number;
};

type Requirement = {
  id?: string;
  title?: string;
  description?: string;
  priority?: "critical" | "high" | "medium" | "low" | string;
  acceptanceCriteria?: string[];
};

type Evidence = {
  source?: string;
  location?: string;
  excerpt?: string;
  explanation?: string;
};

type RequirementFinding = {
  requirementId?: string;
  status?: "complete" | "partial" | "missing" | string;
  confidence?: number;
  evidence?: Evidence[];
  reasoning?: string;
};

type ReviewResponse = {
  success?: boolean;
  mode?: "demo" | "live" | string;
  task?: string;
  repositoryPath?: string | null;
  requirements?: Requirement[];
  findings?: RequirementFinding[];
  finalResult?: string | object;
  agents?: AgentTrace[];
  trace?: {
    startedAt?: string;
    completedAt?: string;
    agentCount?: number;
  };
  message?: string;
  error?: string;
  quotaExceeded?: boolean;
};

const EXAMPLE_TASK =
  "Build an e-commerce application with authentication, product catalog, search, shopping cart, Stripe checkout, secure Stripe webhooks, PostgreSQL database, inventory management, order history, and automated tests.";

const EXAMPLE_REPOSITORY =
  "https://github.com/kishan-kumar-dev/topspeech-health-assignment";

const AGENT_LABELS = [
  {
    number: "01",
    title: "Research Agent",
    description:
      "Extracts concrete requirements, context, risks, and missing information.",
  },
  {
    number: "02",
    title: "Requirement Normalizer",
    description:
      "Converts extracted requirements into stable, testable acceptance criteria.",
  },
  {
    number: "03",
    title: "Implementation Agent",
    description:
      "Inspects the candidate repository and collects source-level implementation evidence.",
  },
  {
    number: "04",
    title: "Verification Agent",
    description:
      "Challenges unsupported claims, checks evidence, and validates critical requirements.",
  },
  {
    number: "05",
    title: "Final Solution Agent",
    description:
      "Produces the final developer-ready implementation review and recommendations.",
  },
];

function formatAgentName(value?: string) {
  if (!value) {
    return "Agent";
  }

  return value
    .replace(/[-_]/g, " ")
    .replace(/\bagent\b/gi, "Agent")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getAgentTitle(agent: AgentTrace, index: number) {
  if (agent?.name) {
    return formatAgentName(agent.name);
  }

  if (agent?.agent) {
    return formatAgentName(agent.agent);
  }

  return AGENT_LABELS[index]?.title ?? `Agent ${index + 1}`;
}

function getStatusClass(status?: string) {
  switch (status) {
    case "complete":
      return "status-complete";
    case "partial":
      return "status-partial";
    case "missing":
      return "status-missing";
    default:
      return "status-unknown";
  }
}

function getPriorityClass(priority?: string) {
  switch (priority) {
    case "critical":
      return "priority-critical";
    case "high":
      return "priority-high";
    case "medium":
      return "priority-medium";
    case "low":
      return "priority-low";
    default:
      return "priority-medium";
  }
}

function formatConfidence(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return `${Math.round(value * 100)}%`;
}

function safeFinalResult(value?: string | object) {
  if (!value) {
    return "No final solution was returned.";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function HomePage() {
  const [task, setTask] = useState("");
  const [repositoryPath, setRepositoryPath] = useState("");
  const [mode, setMode] = useState<"demo" | "live">("demo");

  const [result, setResult] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * These are intentionally calculated directly from the current result.
   * There is no need for useMemo here and this avoids the
   * react-hooks/exhaustive-deps warnings.
   */
  const requirements = result?.requirements ?? [];
  const findings = result?.findings ?? [];
  const agents = result?.agents ?? [];

  const completeCount = findings.filter(
    (item) => item.status === "complete",
  ).length;

  const partialCount = findings.filter(
    (item) => item.status === "partial",
  ).length;

  const missingCount = findings.filter(
    (item) => item.status === "missing",
  ).length;

  function useExample() {
    setTask(EXAMPLE_TASK);
    setRepositoryPath(EXAMPLE_REPOSITORY);
    setError("");
    setResult(null);
  }

  function clearAll() {
    setTask("");
    setRepositoryPath("");
    setResult(null);
    setError("");
  }

  async function analyzeTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setResult(null);

    const trimmedTask = task.trim();
    const trimmedRepository = repositoryPath.trim();

    if (!trimmedTask) {
      setError("Please describe the developer task.");
      return;
    }

    if (mode === "live" && !trimmedRepository) {
      setError(
        "Candidate Repository Path is required when Live Gemini mode is selected.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: trimmedTask,
          repositoryPath: trimmedRepository || undefined,
          mode,
        }),
      });

      const data: ReviewResponse = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.error || "The analysis request failed. Please try again.",
        );
      }

      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to analyze the task.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="background-grid" />

      <section className="hero">
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          Agentic Workflows Hackathon
        </div>

        <h1>AI Developer Task Reviewer</h1>

        <p className="hero-description">
          Turn ambiguous software development tasks into reliable,
          evidence-backed, developer-ready implementation reviews.
        </p>

        <div className="workflow-line">
          Research
          <span>→</span>
          Normalize
          <span>→</span>
          Inspect
          <span>→</span>
          Verify
          <span>→</span>
          Final Solution
        </div>
      </section>

      <section className="workflow-grid">
        {AGENT_LABELS.map((agent) => (
          <div className="workflow-card" key={agent.number}>
            <div className="workflow-number">{agent.number}</div>

            <h3>{agent.title}</h3>

            <p>{agent.description}</p>
          </div>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="section-kicker">Developer Task</div>

            <h2>
              Describe the software feature or engineering problem you want the
              agents to review.
            </h2>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={useExample}
            disabled={loading}
          >
            Try an example
          </button>
        </div>

        <form onSubmit={analyzeTask}>
          <label htmlFor="task">Developer Task</label>

          <textarea
            id="task"
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder="Please describe the developer task."
            rows={8}
            disabled={loading}
          />

          <div className="field-group">
            <label htmlFor="repositoryPath">Candidate Repository Path</label>

            <input
              id="repositoryPath"
              value={repositoryPath}
              onChange={(event) => setRepositoryPath(event.target.value)}
              placeholder="C:\path\to\candidate-repository"
              disabled={loading}
            />

            <p className="field-help">
              Required for Live Gemini repository inspection.
            </p>
          </div>

          <div className="mode-section">
            <div className="section-kicker">Execution Mode</div>

            <div className="mode-grid">
              <button
                type="button"
                className={`mode-card ${mode === "demo" ? "selected" : ""}`}
                onClick={() => setMode("demo")}
                disabled={loading}
              >
                <div className="mode-top">
                  <span>Demo Mode</span>

                  {mode === "demo" && (
                    <span className="selected-pill">SELECTED</span>
                  )}
                </div>

                <p>
                  Deterministic local workflow. Same input produces reproducible
                  results without using Gemini API quota.
                </p>
              </button>

              <button
                type="button"
                className={`mode-card ${mode === "live" ? "selected" : ""}`}
                onClick={() => setMode("live")}
                disabled={loading}
              >
                <div className="mode-top">
                  <span>Live Gemini</span>

                  {mode === "live" && (
                    <span className="selected-pill">SELECTED</span>
                  )}
                </div>

                <p>
                  Runs the full five-agent workflow and can inspect the supplied
                  candidate repository.
                </p>
              </button>
            </div>
          </div>

          {error && (
            <div className="error-box" role="alert">
              <strong>Analysis failed</strong>
              <span>{error}</span>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Running Agents..." : "Analyze Task"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={clearAll}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {result && (
        <section className="results">
          <div className="results-heading">
            <div>
              <div className="section-kicker">Review Results</div>

              <h2>Implementation Review</h2>
            </div>

            <span className="mode-badge">{result.mode || "unknown"}</span>
          </div>

          <div className="result-meta">
            <div>
              <span>Task</span>
              <strong>{result.task || task}</strong>
            </div>

            {result.repositoryPath && (
              <div>
                <span>Repository</span>
                <strong>{result.repositoryPath}</strong>
              </div>
            )}
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span>Requirements</span>
              <strong>{requirements.length}</strong>
            </div>

            <div className="stat-card complete">
              <span>Complete</span>
              <strong>{completeCount}</strong>
            </div>

            <div className="stat-card partial">
              <span>Partial</span>
              <strong>{partialCount}</strong>
            </div>

            <div className="stat-card missing">
              <span>Missing</span>
              <strong>{missingCount}</strong>
            </div>
          </div>

          <section className="result-section">
            <div className="result-section-header">
              <div>
                <div className="section-kicker">Requirements</div>
                <h3>Normalized Acceptance Criteria</h3>
              </div>

              <span>{requirements.length} requirements</span>
            </div>

            {requirements.length === 0 ? (
              <div className="empty-state">
                <strong>No normalized requirements were returned.</strong>

                <p>
                  The workflow completed, but the response did not contain
                  requirement data.
                </p>
              </div>
            ) : (
              <div className="requirements-list">
                {requirements.map((requirement, index) => {
                  const finding = findings.find(
                    (item) => item.requirementId === requirement.id,
                  );

                  return (
                    <article
                      className="requirement-card"
                      key={requirement.id || `requirement-${index}`}
                    >
                      <div className="requirement-header">
                        <div>
                          <span className="requirement-id">
                            {requirement.id ||
                              `REQ-${String(index + 1).padStart(3, "0")}`}
                          </span>

                          <h4>{requirement.title || "Untitled requirement"}</h4>
                        </div>

                        <div className="requirement-badges">
                          {requirement.priority && (
                            <span
                              className={`priority-badge ${getPriorityClass(
                                requirement.priority,
                              )}`}
                            >
                              {requirement.priority}
                            </span>
                          )}

                          {finding?.status && (
                            <span
                              className={`status-badge ${getStatusClass(
                                finding.status,
                              )}`}
                            >
                              {finding.status}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="requirement-description">
                        {requirement.description || "No description provided."}
                      </p>

                      {requirement.acceptanceCriteria &&
                        requirement.acceptanceCriteria.length > 0 && (
                          <div className="criteria">
                            <strong>Acceptance Criteria</strong>

                            <ul>
                              {requirement.acceptanceCriteria.map(
                                (criterion, criterionIndex) => (
                                  <li key={criterionIndex}>{criterion}</li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                      {finding && (
                        <div className="finding-box">
                          <div className="finding-top">
                            <strong>Implementation Evidence</strong>

                            <span>
                              Confidence: {formatConfidence(finding.confidence)}
                            </span>
                          </div>

                          {finding.reasoning && <p>{finding.reasoning}</p>}

                          {finding.evidence && finding.evidence.length > 0 && (
                            <div className="evidence-list">
                              {finding.evidence.map(
                                (evidence, evidenceIndex) => (
                                  <div
                                    className="evidence-item"
                                    key={evidenceIndex}
                                  >
                                    <div className="evidence-source">
                                      {evidence.source || "Repository source"}

                                      {evidence.location && (
                                        <span> · {evidence.location}</span>
                                      )}
                                    </div>

                                    {evidence.excerpt && (
                                      <pre>{evidence.excerpt}</pre>
                                    )}

                                    {evidence.explanation && (
                                      <p>{evidence.explanation}</p>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="result-section">
            <div className="result-section-header">
              <div>
                <div className="section-kicker">Agent Execution Trace</div>

                <h3>Five-Agent Workflow</h3>
              </div>

              <span>{result.trace?.agentCount ?? agents.length} agents</span>
            </div>

            <div className="agent-trace-list">
              {AGENT_LABELS.map((label, index) => {
                const agent = agents[index];

                return (
                  <article className="trace-card" key={label.number}>
                    <div className="trace-number">{label.number}</div>

                    <div className="trace-content">
                      <div className="trace-title-row">
                        <h4>
                          {agent ? getAgentTitle(agent, index) : label.title}
                        </h4>

                        <span>{agent?.retries ?? 0} retries</span>
                      </div>

                      <p>{agent?.inputSummary || label.description}</p>

                      {agent?.actions && agent.actions.length > 0 && (
                        <details>
                          <summary>{agent.actions.length} actions</summary>

                          <ul>
                            {agent.actions.map((action, actionIndex) => (
                              <li key={actionIndex}>{action}</li>
                            ))}
                          </ul>
                        </details>
                      )}

                      {agent?.findings && agent.findings.length > 0 && (
                        <details>
                          <summary>{agent.findings.length} findings</summary>

                          <ul>
                            {agent.findings.map((finding, findingIndex) => (
                              <li key={findingIndex}>{finding}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="final-solution">
            <div className="section-kicker">Final Solution</div>

            <h3>Developer-Ready Review</h3>

            <div className="final-content">
              <pre>{safeFinalResult(result.finalResult)}</pre>
            </div>
          </section>

          {result.message && (
            <div className="success-message">{result.message}</div>
          )}
        </section>
      )}

      <footer>AI Developer Task Reviewer · Agentic Workflows Hackathon</footer>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page-shell {
          min-height: 100vh;
          padding: 42px 24px 70px;
          color: #e8edf7;
          background:
            radial-gradient(
              circle at 50% -10%,
              rgba(99, 102, 241, 0.2),
              transparent 35%
            ),
            #070b14;
          position: relative;
          overflow: hidden;
        }

        .background-grid {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.18;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.04) 1px,
              transparent 1px
            );
          background-size: 48px 48px;
        }

        .hero,
        .workflow-grid,
        .panel,
        .results,
        footer {
          max-width: 1180px;
          margin-left: auto;
          margin-right: auto;
          position: relative;
        }

        .hero {
          text-align: center;
          padding: 40px 0 34px;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 13px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 999px;
          color: #aeb9cc;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(15, 23, 42, 0.6);
        }

        .eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #8b5cf6;
          box-shadow: 0 0 14px #8b5cf6;
        }

        h1 {
          margin: 22px 0 14px;
          font-size: clamp(38px, 6vw, 68px);
          line-height: 0.98;
          letter-spacing: -0.055em;
          color: #f8fafc;
        }

        .hero-description {
          max-width: 700px;
          margin: 0 auto;
          color: #9ba8bc;
          font-size: 17px;
          line-height: 1.7;
        }

        .workflow-line {
          margin-top: 25px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 700;
        }

        .workflow-line span {
          color: #6366f1;
        }

        .workflow-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          margin-bottom: 30px;
        }

        .workflow-card {
          padding: 20px;
          min-height: 160px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 16px;
          background: rgba(15, 23, 42, 0.72);
          backdrop-filter: blur(12px);
        }

        .workflow-number {
          color: #818cf8;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 25px;
        }

        .workflow-card h3 {
          margin: 0 0 9px;
          color: #f1f5f9;
          font-size: 15px;
        }

        .workflow-card p {
          margin: 0;
          color: #8997ad;
          font-size: 12px;
          line-height: 1.6;
        }

        .panel,
        .results {
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 22px;
          background: rgba(9, 14, 25, 0.88);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(18px);
        }

        .panel {
          padding: 30px;
        }

        .panel-header,
        .results-heading,
        .result-section-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
        }

        .section-kicker {
          color: #818cf8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .panel h2,
        .results h2 {
          max-width: 800px;
          margin: 8px 0 25px;
          font-size: 25px;
          line-height: 1.3;
          color: #f8fafc;
        }

        label {
          display: block;
          margin-bottom: 9px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 700;
        }

        textarea,
        input {
          width: 100%;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 12px;
          outline: none;
          background: #080d18;
          color: #e5e7eb;
          transition: 0.2s ease;
        }

        textarea {
          resize: vertical;
          min-height: 190px;
          padding: 16px;
          line-height: 1.6;
          font-family: inherit;
        }

        input {
          padding: 14px 15px;
        }

        textarea:focus,
        input:focus {
          border-color: rgba(129, 140, 248, 0.75);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }

        textarea:disabled,
        input:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .field-group {
          margin-top: 20px;
        }

        .field-help {
          margin: 8px 0 0;
          color: #718096;
          font-size: 12px;
        }

        .mode-section {
          margin-top: 26px;
        }

        .mode-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 10px;
        }

        .mode-card {
          text-align: left;
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 14px;
          padding: 17px;
          background: #0b111e;
          color: #dbe4f2;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .mode-card:hover {
          border-color: rgba(129, 140, 248, 0.45);
        }

        .mode-card.selected {
          border-color: rgba(129, 140, 248, 0.8);
          background: rgba(79, 70, 229, 0.09);
        }

        .mode-card:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .mode-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          font-weight: 800;
        }

        .mode-card p {
          color: #8491a6;
          line-height: 1.55;
          font-size: 12px;
          margin: 9px 0 0;
        }

        .selected-pill {
          color: #a5b4fc;
          font-size: 9px;
          letter-spacing: 0.1em;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 25px;
        }

        button {
          font-family: inherit;
        }

        .primary-button,
        .secondary-button {
          border-radius: 11px;
          padding: 12px 17px;
          cursor: pointer;
          font-weight: 800;
          font-size: 13px;
          transition: 0.2s ease;
        }

        .primary-button {
          border: 1px solid #6366f1;
          color: white;
          background: #4f46e5;
          box-shadow: 0 10px 28px rgba(79, 70, 229, 0.2);
        }

        .primary-button:hover {
          background: #6366f1;
        }

        .primary-button:disabled,
        .secondary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .secondary-button {
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #cbd5e1;
          background: rgba(15, 23, 42, 0.7);
        }

        .secondary-button:hover:not(:disabled) {
          border-color: rgba(148, 163, 184, 0.4);
        }

        .error-box {
          margin-top: 18px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          border: 1px solid rgba(248, 113, 113, 0.3);
          border-radius: 12px;
          background: rgba(127, 29, 29, 0.16);
          color: #fca5a5;
          font-size: 12px;
        }

        .results {
          margin-top: 28px;
          padding: 30px;
        }

        .results-heading {
          align-items: center;
        }

        .results-heading h2 {
          margin-bottom: 0;
        }

        .mode-badge {
          padding: 7px 11px;
          border-radius: 999px;
          border: 1px solid rgba(129, 140, 248, 0.35);
          color: #a5b4fc;
          background: rgba(79, 70, 229, 0.1);
          text-transform: uppercase;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .result-meta {
          margin-top: 25px;
          display: grid;
          gap: 10px;
        }

        .result-meta div {
          padding: 14px;
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.5);
        }

        .result-meta span {
          display: block;
          margin-bottom: 6px;
          color: #718096;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .result-meta strong {
          color: #dce5f3;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.6;
          word-break: break-word;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 14px;
        }

        .stat-card {
          padding: 18px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 14px;
          background: rgba(15, 23, 42, 0.5);
        }

        .stat-card span {
          color: #7d899d;
          font-size: 11px;
        }

        .stat-card strong {
          display: block;
          margin-top: 5px;
          color: #f8fafc;
          font-size: 28px;
        }

        .stat-card.complete strong {
          color: #34d399;
        }

        .stat-card.partial strong {
          color: #fbbf24;
        }

        .stat-card.missing strong {
          color: #f87171;
        }

        .result-section {
          margin-top: 30px;
          padding-top: 30px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }

        .result-section-header {
          align-items: center;
          margin-bottom: 16px;
        }

        .result-section-header h3,
        .final-solution h3 {
          margin: 6px 0 0;
          color: #f8fafc;
          font-size: 20px;
        }

        .result-section-header > span {
          color: #77849a;
          font-size: 11px;
        }

        .requirements-list {
          display: grid;
          gap: 12px;
        }

        .requirement-card {
          padding: 20px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 15px;
          background: rgba(13, 19, 32, 0.72);
        }

        .requirement-header {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .requirement-id {
          color: #818cf8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .requirement-card h4 {
          margin: 6px 0 0;
          color: #f1f5f9;
          font-size: 16px;
        }

        .requirement-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .priority-badge,
        .status-badge {
          height: fit-content;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .priority-critical {
          color: #fda4af;
          background: rgba(225, 29, 72, 0.12);
        }

        .priority-high {
          color: #fdba74;
          background: rgba(234, 88, 12, 0.12);
        }

        .priority-medium {
          color: #fcd34d;
          background: rgba(202, 138, 4, 0.12);
        }

        .priority-low {
          color: #93c5fd;
          background: rgba(37, 99, 235, 0.12);
        }

        .status-complete {
          color: #6ee7b7;
          background: rgba(16, 185, 129, 0.12);
        }

        .status-partial {
          color: #fcd34d;
          background: rgba(245, 158, 11, 0.12);
        }

        .status-missing {
          color: #fca5a5;
          background: rgba(239, 68, 68, 0.12);
        }

        .status-unknown {
          color: #94a3b8;
          background: rgba(148, 163, 184, 0.1);
        }

        .requirement-description {
          color: #9ba8bc;
          line-height: 1.65;
          font-size: 13px;
        }

        .criteria {
          padding: 14px;
          border-radius: 11px;
          background: rgba(2, 6, 23, 0.55);
        }

        .criteria strong {
          color: #cbd5e1;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .criteria ul {
          margin: 9px 0 0;
          padding-left: 19px;
        }

        .criteria li {
          margin: 5px 0;
          color: #8997ad;
          font-size: 12px;
          line-height: 1.5;
        }

        .finding-box {
          margin-top: 14px;
          padding: 15px;
          border: 1px solid rgba(129, 140, 248, 0.12);
          border-radius: 11px;
          background: rgba(30, 41, 59, 0.35);
        }

        .finding-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          color: #cbd5e1;
          font-size: 11px;
        }

        .finding-top span {
          color: #818cf8;
        }

        .finding-box > p {
          color: #8e9aae;
          line-height: 1.6;
          font-size: 12px;
        }

        .evidence-list {
          display: grid;
          gap: 9px;
          margin-top: 12px;
        }

        .evidence-item {
          padding: 11px;
          border-radius: 9px;
          background: rgba(2, 6, 23, 0.6);
        }

        .evidence-source {
          color: #a5b4fc;
          font-size: 11px;
          font-weight: 700;
          word-break: break-word;
        }

        .evidence-item pre {
          margin: 8px 0 0;
          padding: 9px;
          overflow-x: auto;
          border-radius: 7px;
          background: #020617;
          color: #a7b4c9;
          font-size: 10px;
          line-height: 1.55;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .evidence-item p {
          margin: 7px 0 0;
          color: #7f8ca0;
          font-size: 11px;
          line-height: 1.5;
        }

        .agent-trace-list {
          display: grid;
          gap: 10px;
        }

        .trace-card {
          display: flex;
          gap: 15px;
          padding: 17px;
          border: 1px solid rgba(148, 163, 184, 0.11);
          border-radius: 13px;
          background: rgba(15, 23, 42, 0.48);
        }

        .trace-number {
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 0 0 40px;
          height: 40px;
          border-radius: 10px;
          color: #a5b4fc;
          background: rgba(79, 70, 229, 0.13);
          font-size: 11px;
          font-weight: 900;
        }

        .trace-content {
          flex: 1;
          min-width: 0;
        }

        .trace-title-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .trace-title-row h4 {
          margin: 0;
          color: #e2e8f0;
          font-size: 14px;
        }

        .trace-title-row span {
          color: #68758a;
          font-size: 10px;
        }

        .trace-content > p {
          color: #8290a5;
          font-size: 12px;
          line-height: 1.5;
          margin: 7px 0;
        }

        details {
          margin-top: 8px;
          color: #8491a6;
          font-size: 11px;
        }

        summary {
          cursor: pointer;
          color: #9ba8bc;
        }

        details ul {
          padding-left: 18px;
          line-height: 1.6;
        }

        .final-solution {
          margin-top: 30px;
          padding: 24px;
          border: 1px solid rgba(129, 140, 248, 0.18);
          border-radius: 16px;
          background: linear-gradient(
            135deg,
            rgba(79, 70, 229, 0.08),
            rgba(15, 23, 42, 0.45)
          );
        }

        .final-content {
          margin-top: 17px;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 12px;
          background: #030712;
        }

        .final-content pre {
          max-height: 700px;
          overflow: auto;
          margin: 0;
          padding: 20px;
          color: #b6c2d5;
          font-family:
            ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .success-message {
          margin-top: 16px;
          padding: 13px 15px;
          border-radius: 10px;
          color: #86efac;
          background: rgba(22, 163, 74, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.14);
          font-size: 11px;
        }

        .empty-state {
          padding: 28px;
          text-align: center;
          border: 1px dashed rgba(148, 163, 184, 0.18);
          border-radius: 13px;
          color: #8997ad;
        }

        .empty-state strong {
          color: #cbd5e1;
          font-size: 13px;
        }

        .empty-state p {
          font-size: 11px;
        }

        footer {
          padding-top: 35px;
          text-align: center;
          color: #59667b;
          font-size: 11px;
        }

        @media (max-width: 950px) {
          .workflow-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 650px) {
          .page-shell {
            padding: 25px 14px 50px;
          }

          .panel,
          .results {
            padding: 20px;
            border-radius: 17px;
          }

          .workflow-grid,
          .mode-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .panel-header,
          .results-heading,
          .result-section-header,
          .requirement-header {
            flex-direction: column;
          }

          .form-actions {
            flex-direction: column;
          }

          .primary-button,
          .secondary-button {
            width: 100%;
          }

          .requirement-badges {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
