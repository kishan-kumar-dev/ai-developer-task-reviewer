# Evaluation

## Primary Metric

The primary metric is:

**Requirement Coverage Score**

It measures how many important signals from a predefined evaluation rubric are represented in the generated implementation plan.

Each case contains a fixed set of expected signals.

For example:

- validation
- security
- error handling
- testing
- authentication
- authorization
- retries
- duplicate handling

The same cases are evaluated for both the baseline and the agent workflow.

## Evaluation Set

The evaluation contains 12 software development tasks.

The set includes:

- File upload
- Stripe subscriptions
- Google authentication
- Search
- Email notifications
- CSV import
- Password reset
- Image processing
- Admin dashboard
- Inventory synchronization
- API rate limiting
- Data export

Case 10 is intentionally challenging because inventory updates introduce concurrency and duplicate-operation risks.

## Baseline

The baseline represents a reasonable simple implementation-planning approach.

It does not use multiple specialized agents.

The baseline receives exactly the same task as the agent workflow.

## Agent Solution

The agent solution uses:

Research Agent
→ Analysis Agent
→ Verification Agent
→ Final Solution Agent

Each stage receives relevant context from the previous stage.

## Fairness

Both approaches use the same evaluation cases.

The primary comparison is the final implementation plan produced for each task.

## Important Limitation

Keyword-based scoring is intentionally simple and reproducible.

It should be treated as an evaluation aid rather than a complete measure of software quality.

Human review should be used for the final submission evidence.

## Reproduction

Install dependencies:

```bash
npm install