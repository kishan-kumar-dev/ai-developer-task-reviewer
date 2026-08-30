# Evaluation Rubric

## Purpose

The evaluation measures whether the AI Developer Task Reviewer produces broader and more useful requirement coverage than a simple single-prompt baseline.

The baseline and agent workflow receive the same fixed evaluation cases.

---

## Primary Automated Metric

The primary automated metric is:

**Requirement Coverage Score**

For each evaluation case, a fixed set of expected requirement signals is defined.

The score is:

```text
matched expected signals / total expected signals × 100
```

### Example

If a case contains 5 expected signals and the output contains 4 of them:

```text
4 / 5 × 100 = 80%
```

The same scoring method is applied to both:

1. Simple Baseline
2. Agent Workflow

This keeps the comparison consistent and reproducible.

---

## Evaluation Set

The evaluation contains **12 fixed software-development tasks** covering:

* file uploads
* payments
* authentication
* search
* notifications
* CSV imports
* password resets
* image processing
* administration
* inventory
* API security
* data export

One case is intentionally marked as challenging:

**Inventory Update**

This case tests transaction handling, duplicate processing, concurrency, failure handling, and testing.

---

## Expected Signals

Each evaluation case defines a fixed set of signals representing important concerns that a useful developer review should surface.

Examples include:

* validation
* authentication
* authorization
* security
* error handling
* testing
* webhooks
* transactions
* concurrency
* privacy
* performance
* retry handling
* duplicate handling

Signals are defined in:

```text
evaluation/cases.ts
```

The scoring implementation is:

```text
evaluation/scoring.ts
```

---

## Primary Comparison

For every case, the evaluation records:

| Metric         | Description                                          |
| -------------- | ---------------------------------------------------- |
| Baseline Score | Requirement coverage produced by the simple baseline |
| Agent Score    | Requirement coverage produced by the agent workflow  |
| Improvement    | Agent Score − Baseline Score                         |

The overall improvement is calculated from the average scores across all evaluation cases.

---

## Workflow Validation

In addition to requirement coverage, the evaluation verifies that the workflow successfully produces its expected structured stages.

For repository-backed evaluations, the expected workflow contains **5 agents**:

1. Task Research Agent
2. Requirement Normalizer Agent
3. Repository Implementation Agent
4. Verification Agent
5. Final Solution Agent

Each case must produce:

* normalized requirements
* implementation findings
* verification output
* final synthesis
* agent traces

A case that fails to produce these outputs is treated as a workflow failure.

---

## Human Interpretation

Requirement Coverage Score is intentionally narrow.

It measures whether predefined requirement signals appear in the evaluated output. It does **not** claim to measure complete software quality, correctness, architecture quality, or production readiness.

Therefore, the automated score should be interpreted together with:

* generated agent outputs
* repository evidence
* verification findings
* agent trajectories
* the improvement changelog
* human review

The evaluation deliberately retains unfavorable results rather than removing them.

For example, if the agent performs worse than the baseline on a case, that regression should remain visible in the results.

---

## Reproducibility

The evaluation uses the same fixed cases for the baseline and agent workflow.

The evaluation can be reproduced with:

```powershell
npx tsx .\evaluation\run.ts
```

The workflow runs through the application's actual:

```text
/api/analyze
```

endpoint in deterministic Demo Mode.

Generated evaluation artifacts include:

```text
evaluation/results.json
evaluation/report.md
```

The repository-backed live evaluation can also be executed through:

```powershell
powershell -ExecutionPolicy Bypass -File ".\evaluation\run-evaluation.ps1"
```

---

## Interpretation of Results

A positive improvement indicates that the agent workflow surfaced more predefined requirement signals than the baseline.

A zero improvement indicates equal coverage.

A negative improvement indicates a regression under the automated signal-based metric.

Regressions are retained because honest evaluation is more valuable than optimizing the benchmark by removing unfavorable cases.

---

## Current Evaluation Result

The current 12-case evaluation produced:

```text
Baseline Average: 30%
Agent Average:    49%
Improvement:      +19 percentage points
```

Case outcomes:

```text
Improved: 8/12
Equal:    3/12
Worse:    1/12
```

The strongest improvement was:

```text
File Export: +60 points
```

The regression was:

```text
API Rate Limiting: -20 points
```

The challenging Inventory Update case improved by:

```text
+20 points
```

These results are reported without removing unfavorable cases.

---

## Conclusion

The primary claim supported by this evaluation is:

> The five-stage agent workflow produced broader requirement-signal coverage than the simple baseline on the fixed 12-case evaluation set, improving the average score from 30% to 49%, a gain of 19 percentage points.

The result should not be interpreted as proof that the agent is universally better. The API Rate Limiting regression and the incomplete challenging Inventory Update result demonstrate that the workflow still has failure modes.

The main engineering lesson is that useful agentic workflows should be evaluated using fixed cases, explicit metrics, reproducible execution, and honest reporting of both improvements and regressions.
