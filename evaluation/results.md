# Evaluation Results

## Evaluation Set

12 fixed software-development tasks were evaluated using the same task cases for the baseline and agent workflow.

The evaluation includes feature development, authentication, payments, search, notifications, data import/export, security, inventory, and database-related tasks.

## Primary Metric

**Requirement Coverage Score**

The score is calculated as the percentage of predefined expected requirement signals present in the evaluated output.

This metric is intentionally narrow: it measures requirement-signal coverage and does not claim to measure overall software quality.

## Results

| Case                 | Baseline | Agent Solution |     Difference |
| -------------------- | -------: | -------------: | -------------: |
| PDF Upload           |      20% |            60% |            +40 |
| Stripe Subscriptions |      17% |            50% |            +33 |
| Google Login         |      20% |            40% |            +20 |
| Search               |      40% |            40% |             +0 |
| Email Notifications  |      40% |            40% |             +0 |
| CSV Import           |      20% |            60% |            +40 |
| Password Reset       |      20% |            40% |            +20 |
| Image Processing     |      60% |            60% |             +0 |
| Admin Dashboard      |      20% |            40% |            +20 |
| Inventory Update     |      20% |            40% |            +20 |
| API Rate Limiting    |      60% |            40% |        **-20** |
| File Export          |      20% |            80% |        **+60** |
| **Average**          |  **30%** |        **49%** | **+19 points** |

## Outcome Summary

- Improved: **8/12 cases**
- Equal: **3/12 cases**
- Worse: **1/12 cases**
- Total requirements evaluated: **60**
- Total findings produced: **60**
- Agent executions: **60**
- Expected agents per repository-backed live case: **5**

## Strongest Improvement

**File Export** produced the largest measured improvement:

- Baseline: 20%
- Agent: 80%
- Improvement: **+60 points**

The workflow was better able to surface authorization, privacy, validation, security, and testing considerations.

## Challenging Case

### Inventory Update

The Inventory Update case was marked as challenging because it involves reliability concerns around:

- transactions
- duplicate processing
- concurrency
- failure handling
- automated testing

Result:

- Baseline: **20%**
- Agent: **40%**
- Improvement: **+20 points**

### What the case revealed

The multi-agent workflow improved coverage of reliability concerns compared with the baseline, but the score remained well below complete coverage.

This is useful evidence rather than a failure to hide: concurrency and inventory consistency require deeper repository-specific evidence and cannot be reliably established from generic planning language alone.

## Regression Case

### API Rate Limiting

The API Rate Limiting case was the only regression:

- Baseline: **60%**
- Agent: **40%**
- Difference: **-20 points**

This demonstrates an important limitation of the current evaluation.

The scoring method is based on literal expected-signal presence. Therefore, a lower keyword-signal score does not necessarily mean that the agent produced a worse engineering review.

The regression is retained rather than removed because the evaluation should report unfavorable results honestly.

## Workflow Validation

Every evaluated workflow execution successfully returned structured results.

The repository-backed live evaluation produced:

- normalized requirements
- implementation findings
- verification output
- final synthesis
- five agent traces

This confirms that the workflow is not merely a static prompt chain; each stage produces structured output consumed by later stages.

## Human Review Method

The evaluation should be interpreted together with human review.

The broader review rubric considers:

- requirement identification
- technical considerations
- missing information
- risk identification
- edge cases
- verification quality

The automated Requirement Coverage Score is the primary quantitative metric because it provides a repeatable comparison across all cases.

## Interpretation

The measured result shows a **+19 percentage-point average improvement** over the simple baseline.

The strongest contribution is the separation of responsibilities:

1. Research identifies the task context and risks.
2. Requirement Normalization converts the request into stable requirements.
3. Repository Inspection checks the actual implementation.
4. Verification challenges the implementation findings.
5. Final Synthesis converts the evidence into an actionable review.

The evaluation also shows that the workflow is not uniformly better on every case. Three cases were equal and one case regressed under the current automated metric.

That limitation is important: keyword-based requirement coverage is useful for reproducibility, but it is not sufficient as a complete measure of engineering-review quality.

## Conclusion

The evaluation supports the claim that the multi-agent workflow provides broader requirement coverage than the simple baseline across this fixed test set:

**30% baseline → 49% agent → +19 percentage points**

The most significant improvement was File Export (+60 points).

The most important weakness was API Rate Limiting (-20 points under the automated signal metric).

The challenging Inventory Update case improved by +20 points but remained incomplete, demonstrating why verification and repository evidence are important for reliability-sensitive requirements.

The main lesson is that agentic architecture should be driven by responsibility separation and evidence flow rather than the number of agents. More agents alone do not guarantee better results.
