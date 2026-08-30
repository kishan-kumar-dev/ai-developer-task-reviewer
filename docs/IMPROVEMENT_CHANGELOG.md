# Improvement Changelog

## Baseline — Single General-Purpose Review

### What we tried

A single general-purpose prompt was used to turn a software task into an implementation review.

### Why

This represents a simple and reasonable approach that a developer could use before introducing a multi-agent workflow.

### Observed limitation

A single response can combine requirement extraction, implementation planning and verification. This makes it easier for assumptions or omissions to survive into the final answer.

### Decision

Use this approach as the baseline.

---

## Iteration 1 — Research Agent

### What we tried

Separated requirement discovery from implementation planning.

### Why

The system needed an explicit stage responsible for identifying what the user actually requested, what information was missing and what risks existed.

### Decision

Keep the Research Agent.

---

## Iteration 2 — Analysis Agent

### What we tried

Added a dedicated implementation-analysis stage that receives the research output.

### Why

Research identifies the problem but does not necessarily produce an actionable implementation strategy.

### Decision

Keep the Analysis Agent.

---

## Iteration 3 — Verification Agent

### What we tried

Added an independent verification stage.

### Why

The analysis could still contain unsupported assumptions or miss important edge cases.

### Decision

Keep the Verification Agent.

---

## Iteration 4 — Final Solution Agent

### What we tried

Added a final synthesis stage that receives the original task, research, analysis and verification.

### Why

The final response should be developer-ready rather than simply exposing intermediate reasoning.

### Decision

Keep the Final Solution Agent.

---

## Iteration 5 — Deterministic Demo Mode

### What we tried

Added a local deterministic execution mode.

### Why

The Gemini free tier can become unavailable because of quota limits. A hackathon judge should still be able to reproduce the workflow.

### Evidence

Demo Mode runs locally without requiring a Gemini API request.

### Decision

Keep Demo Mode as the default judging path.

---

## Final Workflow

The final architecture is:

Task
→ Research
→ Analysis
→ Verification
→ Final Solution

with:

- deterministic Demo Mode
- optional Live Gemini Mode
- visible agent outputs
- reproducible evaluation cases

## Main Lesson

Adding agents alone does not make a workflow better.

The useful improvement came from assigning each stage a specific responsibility and using verification to catch omissions before producing the final implementation plan.