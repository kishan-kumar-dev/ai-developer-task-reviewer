# Improvement Changelog

## Baseline

### What we tried

The initial baseline used a simple single-prompt implementation-planning approach.

The baseline received the same fixed evaluation cases as the agent workflow.

### Why

This provides a simple comparison point for measuring whether the multi-agent workflow improves requirement coverage.

### Limitation

A single response is responsible for requirement discovery, technical analysis, risk identification, edge cases, and verification at the same time.

---

## Iteration 1 — Research Agent

### What we changed

Added a dedicated Research Agent to analyze the developer task before implementation review.

### Responsibility

The Research Agent identifies:

- user intent
- explicit requirements
- technical considerations
- missing information
- risks

### Why

Separating initial discovery from later reasoning reduces the chance that important requirements are missed during implementation planning.

---

## Iteration 2 — Requirement Normalizer Agent

### What we changed

Added a dedicated Requirement Normalizer Agent.

### Responsibility

The normalizer converts research output into stable, structured, testable requirements.

### Why

The downstream repository and verification stages need consistent requirement identifiers rather than loosely structured planning text.

---

## Iteration 3 — Repository Implementation Agent

### What we changed

Added repository inspection to compare normalized requirements against the actual candidate implementation.

### Responsibility

The implementation agent:

- inspects repository files
- identifies implementation evidence
- maps evidence to requirements
- reports implementation gaps

### Why

The reviewer should distinguish between what the task requests and what the repository actually implements.

This is the main evidence-backed component of the workflow.

---

## Iteration 4 — Verification Agent

### What we changed

Added an independent verification stage after repository inspection.

### Responsibility

The Verification Agent checks:

- requirement coverage
- implementation findings
- unsupported conclusions
- missing evidence
- risks
- edge cases
- contradictions

### Why

A repository analysis should not be accepted without a second stage challenging its conclusions.

---

## Iteration 5 — Final Solution Agent

### What we changed

Added a final synthesis stage.

### Responsibility

The Final Solution Agent combines:

- normalized requirements
- repository findings
- verification issues

into a developer-ready review containing:

- summary
- strengths
- gaps
- risks
- recommendations
- overall assessment

### Why

The final response should be actionable rather than simply exposing intermediate agent outputs.

---

## Iteration 6 — Deterministic Demo Mode

### What we changed

Added a deterministic local execution mode.

### Why

Live Gemini execution depends on API availability, network access, and quota. A hackathon evaluation should remain reproducible without requiring live model access.

### Result

The evaluation runner can call the real `/api/analyze` endpoint in Demo Mode and verify the complete workflow locally.

Live Gemini remains available separately for model-backed execution.

---

## Final Evaluation

The final workflow was evaluated against 12 fixed software-development cases.

### Automated Metric

The primary automated metric is:

**Requirement Coverage Score**

For each evaluation case, a fixed set of expected requirement signals is defined.

The score is:

```text
matched expected signals / total expected signals × 100
```

This metric is intentionally narrow. It measures requirement-signal coverage and does not claim to measure overall software quality.

### Measured Results

| Metric                            |     Result |
| --------------------------------- | ---------: |
| Evaluation cases                  |         12 |
| Baseline average                  |        30% |
| Agent workflow average            |        49% |
| Average improvement               | +19 points |
| Improved cases                    |       8/12 |
| Equal cases                       |       3/12 |
| Worse cases                       |       1/12 |
| Total requirements evaluated      |         60 |
| Total findings produced           |         60 |
| Agent executions                  |         60 |
| Agents per repository-backed case |          5 |

### Case Results

| Case                 | Baseline | Agent Workflow | Difference |
| -------------------- | -------: | -------------: | ---------: |
| PDF Upload           |      20% |            60% |        +40 |
| Stripe Subscriptions |      17% |            50% |        +33 |
| Google Login         |      20% |            40% |        +20 |
| Search               |      40% |            40% |         +0 |
| Email Notifications  |      40% |            40% |         +0 |
| CSV Import           |      20% |            60% |        +40 |
| Password Reset       |      20% |            40% |        +20 |
| Image Processing     |      60% |            60% |         +0 |
| Admin Dashboard      |      20% |            40% |        +20 |
| Inventory Update     |      20% |            40% |        +20 |
| API Rate Limiting    |      60% |            40% |        -20 |
| File Export          |      20% |            80% |        +60 |
| **Average**          |  **30%** |        **49%** |    **+19** |

### Strongest Improvement

The File Export case produced the largest measured improvement:

- Baseline: 20%
- Agent workflow: 80%
- Improvement: **+60 points**

The workflow surfaced authorization, privacy, validation, security, and testing considerations more effectively for this case.

### Challenging Case

The Inventory Update case was marked as challenging because it involves:

- transactions
- duplicate processing
- concurrency
- failure handling
- automated testing

Result:

- Baseline: 20%
- Agent workflow: 40%
- Improvement: **+20 points**

The result demonstrates improved coverage while also showing that reliability-sensitive requirements require deeper repository evidence and verification.

### Regression Case

API Rate Limiting was the only measured regression:

- Baseline: 60%
- Agent workflow: 40%
- Difference: **-20 points**

The regression is intentionally retained.

The automated scorer is based on literal expected-signal presence. Therefore, a lower keyword-signal score does not necessarily mean that the generated engineering review is objectively worse.

This limitation is reported rather than hidden so that the evaluation remains transparent.

---

## Workflow Validation

Every evaluated workflow execution successfully returned structured results.

The repository-backed evaluation produced:

- normalized requirements
- implementation findings
- verification output
- final synthesis
- five agent traces

The evaluation therefore exercises the actual `/api/analyze` workflow rather than comparing static responses.

---

## Final Architecture

```text
Research
   ↓
Requirement Normalization
   ↓
Repository Inspection
   ↓
Verification
   ↓
Final Synthesis
```

The important architectural decision is responsibility separation and evidence flow rather than simply increasing the number of agents.

Each stage has a specific purpose:

1. **Research** identifies task context, requirements, missing information, and risks.
2. **Requirement Normalization** converts the request into stable, testable requirements.
3. **Repository Inspection** checks the actual implementation and collects evidence.
4. **Verification** challenges findings, assumptions, risks, and missing evidence.
5. **Final Synthesis** converts the verified context into an actionable developer review.

---

## Final Decision

The measured evaluation supports the claim that the multi-agent workflow provides broader requirement coverage than the simple baseline across this fixed evaluation set:

**30% baseline → 49% agent workflow → +19 percentage points**

The workflow improved 8 of 12 cases, matched the baseline on 3 cases, and regressed on 1 case.

The regression and limitations are retained rather than hidden so the evaluation remains transparent.

The final system therefore emphasizes evidence-backed review and responsibility separation rather than adding agents without a specific purpose.
