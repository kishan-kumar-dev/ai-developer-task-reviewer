# Improvement Changelog

## Baseline

### What we tried

A single general-purpose prompt was used to transform a software development task into an implementation plan.

### Why

This represents a reasonable simple baseline and provides a fair comparison against the agentic workflow.

### Evidence

Evaluation results are recorded in:

`evaluation/results.md`

### Decision

Established as the baseline.

---

## Iteration 1 — Research Agent

### What we tried

Separated requirement discovery into a dedicated Research Agent.

### Why

Initial task descriptions can contain ambiguity, missing context, assumptions, and risks.

The Research Agent explicitly extracts:

- user intent
- requirements
- technical considerations
- missing information
- risks

### Evidence

Representative trajectory:

`trajectories/research-agent.md`

### Decision

Kept.

### Learning

Separating requirement discovery from implementation planning provides clearer context for later stages.

---

## Iteration 2 — Analysis Agent

### What we tried

Added a dedicated Analysis Agent that receives the original task and Research Agent output.

### Why

The research output identifies what matters, but a developer still needs a concrete implementation strategy.

### Evidence

Representative trajectory:

`trajectories/analysis-agent.md`

### Decision

Kept.

### Learning

The second stage converts discovery into actionable implementation steps while preserving uncertainty.

---

## Iteration 3 — Verification Agent

### What we tried

Added an independent Verification Agent after analysis.

### Why

A planning system can produce a confident answer while missing requirements or making unsupported assumptions.

The Verification Agent checks:

- omissions
- contradictions
- assumptions
- technical risks
- edge cases

### Evidence

Representative trajectory:

`trajectories/verification-agent.md`

### Decision

Kept.

### Learning

Verification is useful as a quality gate rather than simply asking the final agent to self-check.

---

## Iteration 4 — Final Solution Agent

### What we tried

Added a final agent that receives the research, analysis, and verification outputs.

### Why

The intermediate outputs are useful for reasoning but should not be the final developer-facing artifact.

### Evidence

Representative trajectory:

`trajectories/final-agent.md`

### Decision

Kept.

### Learning

Separating internal analysis from the final response produces a cleaner developer-ready result.

---

## Iteration 5 — Deterministic Demo Mode

### What we tried

Added a local deterministic Demo Mode.

### Why

The Gemini free-tier quota can prevent repeated live evaluation and makes reproducibility difficult.

### Evidence

The application can execute the workflow locally without making Gemini API requests.

### Decision

Kept.

### Learning

A reproducible deterministic execution path is valuable for judging and demonstrations, while Live Gemini remains available for real model execution when quota is available.

---

## Final Workflow

Research → Analysis → Verification → Final

with:

- deterministic Demo Mode
- optional Live Gemini Mode
- visible intermediate outputs
- verification gate
- reproducible evaluation
- documented trajectories