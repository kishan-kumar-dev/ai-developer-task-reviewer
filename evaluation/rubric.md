# Evaluation Rubric

## Purpose

The evaluation measures whether the AI Developer Task Reviewer produces more useful and reliable implementation plans than a simple single-prompt baseline.

The baseline and agent solution must receive the same task cases.

## Primary Metric

The primary metric is:

**Implementation Plan Quality Score**

Each result is scored from 0 to 30.

### 1. Requirement Coverage — 0 to 5

Does the result correctly identify the important requirements contained in the original task?

- 0 = requirements largely missing
- 1 = very limited coverage
- 2 = several requirements identified
- 3 = most important requirements identified
- 4 = strong coverage
- 5 = comprehensive and accurate coverage

### 2. Unsupported Assumptions — 0 to 5

Does the result avoid inventing unsupported functionality?

- 0 = many unsupported assumptions
- 1 = serious assumptions
- 2 = several assumptions
- 3 = mostly cautious
- 4 = very few unsupported assumptions
- 5 = consistently distinguishes known facts from uncertainty

### 3. Technical Completeness — 0 to 5

Does the plan identify relevant technical implementation concerns?

Examples:

- architecture
- APIs
- data
- authentication
- validation
- security
- testing
- error handling

### 4. Edge Cases — 0 to 5

Does the result identify realistic failure modes and edge cases?

### 5. Verification Quality — 0 to 5

Does the result explain how the implementation should be tested and verified against the original task?

### 6. Developer Usefulness — 0 to 5

Could a developer realistically use the result as a starting implementation plan?

---

## Total

Maximum score:

**30 points**

## Primary Comparison

For each case:

```text
Baseline Score
Agent Solution Score
Difference