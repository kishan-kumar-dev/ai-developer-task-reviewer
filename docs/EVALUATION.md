# Evaluation

## Primary Metric

The primary metric is Requirement Coverage Score.

Each result is evaluated on a 0–5 scale:

| Score | Meaning |
|---|---|
| 0 | Requirement completely missed |
| 1 | Major requirements missed |
| 2 | Partially understood |
| 3 | Mostly correct |
| 4 | Strong coverage |
| 5 | Complete and precise |

## Secondary Metrics

The evaluation also records:

- Unsupported assumptions
- Edge-case coverage
- Verification quality
- Human review time

## Baseline

The baseline uses one general-purpose implementation-review prompt.

The baseline receives exactly the same task cases as the agent workflow.

## Agent Solution

The final solution uses four stages:

Research Agent
→ Analysis Agent
→ Verification Agent
→ Final Solution Agent

## Evaluation Cases

The evaluation contains 11 fixed software-development tasks.

The cases cover:

- Authentication
- File uploads
- Payments
- Pagination
- Password reset
- Notifications
- Image uploads
- Authorization
- Search
- Payment webhooks
- Authentication migration

Case 11 is intentionally difficult because it requires preserving existing behavior during a migration.

## Fairness

The baseline and agent workflow receive the same original task.

No private or user-specific information is used.

The evaluation is reproducible using the fixed cases in:

`evaluation/cases.json`

## Important Limitation

Demo Mode is deterministic and does not call Gemini.

Live Gemini results may vary between executions because they depend on model behavior and API availability.

Therefore Demo Mode is the primary reproducibility path.