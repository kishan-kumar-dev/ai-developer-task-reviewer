# Improvement Changelog

## Baseline

### What we tried

A single general-purpose prompt was used to review the developer task.

### Why

This establishes a simple and fair baseline.

### Expected limitation

A single response performs requirement discovery, analysis, and self-review at the same time.

### Decision

Use this as the comparison point.

---

## Iteration 1 — Research Agent

### What we tried

Separated requirement discovery into a dedicated Research Agent.

### Why

The system needs to identify missing information and risks before implementation planning.

### Evidence

The Research Agent explicitly produces:

- user intent
- requirements
- technical considerations
- missing information
- risks

### Decision

Keep the Research Agent.

---

## Iteration 2 — Analysis Agent

### What we tried

Added a dedicated Analysis Agent that receives both the original task and research output.

### Why

Requirement discovery and implementation planning are different reasoning tasks.

### Evidence

The Analysis Agent converts the research into:

- functional requirements
- technical requirements
- implementation steps
- edge cases

### Decision

Keep the Analysis Agent.

---

## Iteration 3 — Verification Agent

### What we tried

Added an independent verification stage.

### Why

A generated implementation plan can contain unsupported assumptions or omissions.

### Evidence

The Verification Agent explicitly checks:

- missing requirements
- assumptions
- contradictions
- technical risks
- edge cases

### Decision

Keep the Verification Agent.

---

## Iteration 4 — Final Agent

### What we tried

Added a final agent that receives the complete workflow context.

### Why

The final answer should incorporate both the proposed implementation and the verification findings.

### Evidence

The Final Agent produces a consistent developer-ready structure.

### Decision

Keep the Final Agent.

---

## Demo Mode

### What we tried

Added a deterministic local execution mode.

### Why

The live Gemini API has quota and network dependencies. A hackathon judge should still be able to execute the workflow without requiring an available API quota.

### Evidence

Demo Mode produces the complete four-stage workflow locally.

### Decision

Keep Demo Mode as the reproducibility path while retaining Live Gemini as the real model-backed execution path.

---

## Final Architecture

Research → Analysis → Verification → Final

The main contribution is not the number of agents. The important design choice is separating discovery, planning, verification, and final synthesis so each stage has a specific responsibility.