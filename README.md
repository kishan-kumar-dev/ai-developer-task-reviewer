# AI Developer Task Reviewer

> Turn ambiguous software-development tasks into reliable, evidence-backed, developer-ready implementation reviews.

## Overview

AI Developer Task Reviewer is a multi-agent workflow for reviewing software-development tasks against an actual candidate repository.

Instead of relying on a single prompt to understand the task, inspect the repository, identify gaps, and produce a final review, the system separates these responsibilities across specialized agents.

```text
Developer Task
      ↓
Research Agent
      ↓
Requirement Normalizer
      ↓
Repository Implementation Agent
      ↓
Verification Agent
      ↓
Final Solution Agent
      ↓
Developer-Ready Review
```

The core principle is **responsibility separation + evidence flow**.

Each stage receives structured context from the previous stage and contributes evidence to the final review.

---

## Agent Workflow

### 01 — Research Agent

The Research Agent analyzes the developer task before repository inspection.

It identifies:

* user intent
* explicit requirements
* technical considerations
* missing information
* risks

This stage establishes the context that downstream agents should evaluate.

---

### 02 — Requirement Normalizer Agent

The Requirement Normalizer converts research output into stable, structured, testable requirements.

Each requirement becomes a concrete target that can later be checked against the candidate implementation.

This prevents downstream stages from relying only on loosely structured planning text.

---

### 03 — Repository Implementation Agent

The Repository Implementation Agent inspects the actual candidate repository.

It:

* examines relevant files
* identifies implementation evidence
* maps evidence to normalized requirements
* reports implementation gaps
* distinguishes repository evidence from assumptions

This is the main evidence-backed inspection stage.

---

### 04 — Verification Agent

The Verification Agent independently challenges the repository findings.

It checks:

* requirement coverage
* implementation findings
* unsupported conclusions
* missing evidence
* risks
* edge cases
* contradictions

The purpose is to prevent the first repository analysis from being accepted without additional scrutiny.

---

### 05 — Final Solution Agent

The Final Solution Agent synthesizes the verified context into a developer-ready review.

The final review contains:

* summary
* strengths
* gaps
* risks
* recommendations
* overall assessment

The application exposes the final result rather than requiring users to interpret raw intermediate agent output.

---

# Research → Normalize → Inspect → Verify → Final Solution

The complete workflow can be represented as:

```text
┌─────────────────────┐
│   Developer Task    │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│   Research Agent    │
│ Context + Risks     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Requirement         │
│ Normalizer Agent    │
│ Stable Requirements │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Repository          │
│ Implementation      │
│ Agent               │
│ Evidence + Gaps     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Verification Agent  │
│ Challenges Findings │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Final Solution      │
│ Developer Review    │
└─────────────────────┘
```

---

## Deterministic Demo Mode

The application includes a deterministic local Demo Mode.

Live Gemini execution can depend on:

* API availability
* network access
* model availability
* quota

For hackathon evaluation, deterministic execution provides a reproducible way to exercise the complete `/api/analyze` workflow without depending on live model access.

Demo Mode still calls the application's real analysis endpoint and returns structured workflow results.

Live Gemini execution remains available separately for model-backed analysis.

---

## Evaluation

The final workflow was evaluated against **12 fixed software-development cases**.

### Evaluation Metrics

The primary automated metric is:

**Requirement Coverage Score**

For each evaluation case, a fixed set of expected requirement signals is defined.

```text
matched expected signals
────────────────────────── × 100
total expected signals
```

The metric intentionally measures requirement-signal coverage.

It does **not** claim to measure overall software quality.

### Results

| Metric                            |                Result |
| --------------------------------- | --------------------: |
| Evaluation cases                  |                    12 |
| Baseline average                  |                   30% |
| Agent workflow average            |                   49% |
| Average improvement               | +19 percentage points |
| Improved cases                    |                  8/12 |
| Equal cases                       |                  3/12 |
| Worse cases                       |                  1/12 |
| Total requirements evaluated      |                    60 |
| Total findings produced           |                    60 |
| Agent executions                  |                    60 |
| Agents per repository-backed case |                     5 |

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

The **File Export** case produced the largest measured improvement.

* Baseline: 20%
* Agent workflow: 80%
* Improvement: **+60 percentage points**

The workflow surfaced authorization, privacy, validation, security, and testing considerations more effectively for this case.

### Challenging Case

The **Inventory Update** case was challenging because it involves:

* transactions
* duplicate processing
* concurrency
* failure handling
* automated testing

Results:

* Baseline: 20%
* Agent workflow: 40%
* Improvement: **+20 percentage points**

The result demonstrates improved requirement coverage while also showing that reliability-sensitive requirements require deeper repository evidence and verification.

### Regression Case

**API Rate Limiting** was the only measured regression.

* Baseline: 60%
* Agent workflow: 40%
* Difference: **-20 percentage points**

The regression is intentionally retained.

The automated scorer is based on literal expected-signal presence. A lower keyword-signal score therefore does not necessarily mean that the generated engineering review is objectively worse.

This limitation is reported rather than hidden.

---

## Workflow Validation

Every evaluated workflow execution successfully returned structured results.

The repository-backed evaluation produced:

* normalized requirements
* implementation findings
* verification output
* final synthesis
* five agent traces

The evaluation therefore exercises the actual `/api/analyze` workflow rather than comparing static responses.

---

## Project Structure

```text
agentic-workflow-hackathon/
│
├── docs/
│   └── IMPROVEMENT_CHANGELOG.md
│
├── evaluation/
│   ├── CASE-001-agent.json
│   ├── CASE-002-agent.json
│   ├── CASE-003-agent.json
│   ├── CASE-004-agent.json
│   ├── CASE-005-agent.json
│   ├── CASE-006-agent.json
│   ├── CASE-007-agent.json
│   ├── CASE-008-agent.json
│   ├── CASE-009-agent.json
│   ├── CASE-010-agent.json
│   ├── CASE-011-agent.json
│   ├── CASE-012-agent.json
│   ├── agent-summary.json
│   ├── report.md
│   ├── results.json
│   ├── results.md
│   ├── rubric.json
│   ├── rubric.md
│   ├── run.ts
│   └── run-evaluation.ps1
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       └── route.ts
│   │   ├── page.tsx
│   │   └── ...
│   │
│   └── lib/
│       ├── agents/
│       ├── llm/
│       ├── tools/
│       ├── demo.ts
│       └── types.ts
│
├── evaluate.ts
├── package.json
├── package-lock.json
└── README.md
```

---

## Running the Application

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## Environment Variables

For live Gemini execution, configure the required Gemini API key in your local environment.

Create a `.env.local` file if required by the current implementation.

Example:

```env
GEMINI_API_KEY=your_api_key_here
```

Do not commit real API keys or other secrets.

The repository should contain only safe example configuration.

---

## Running the Evaluation

The evaluation can be run using the project's evaluation script.

From PowerShell:

```powershell
.\evaluation\run-evaluation.ps1
```

The evaluation produces structured artifacts including:

```text
evaluation/results.json
evaluation/results.md
evaluation/report.md
evaluation/agent-summary.json
evaluation/CASE-001-agent.json
...
evaluation/CASE-012-agent.json
```

The exact generated files may change as the evaluation workflow evolves.

---

## Evaluation Transparency

The evaluation intentionally reports both improvements and regressions.

The final measured result is:

```text
30% baseline
      ↓
49% agent workflow
      ↓
+19 percentage points
```

Across the fixed evaluation set:

* 8 cases improved
* 3 cases were equal
* 1 case regressed

The purpose of the evaluation is not to claim that a multi-agent system is universally superior.

Instead, it demonstrates that responsibility separation and evidence flow can improve requirement-signal coverage across the selected software-development cases.

---

## Architecture Decision

The important architectural decision is **not simply adding more agents**.

Each agent has a specific responsibility:

1. **Research** identifies task context, requirements, missing information, and risks.
2. **Requirement Normalization** converts the request into stable, testable requirements.
3. **Repository Inspection** checks the actual implementation and collects evidence.
4. **Verification** challenges findings, assumptions, risks, and missing evidence.
5. **Final Synthesis** converts the verified context into an actionable developer review.

This creates a traceable flow:

```text
Task
 ↓
Requirements
 ↓
Repository Evidence
 ↓
Verification
 ↓
Final Review
```

---

## Final Decision

The measured evaluation supports the claim that the multi-agent workflow provides broader requirement coverage than the simple baseline across this fixed evaluation set.

**30% baseline → 49% agent workflow → +19 percentage points**

The workflow improved 8 of 12 cases, matched the baseline on 3 cases, and regressed on 1 case.

The regression and evaluation limitations are retained rather than hidden.

The final system therefore emphasizes:

* evidence-backed review
* requirement traceability
* independent verification
* responsibility separation
* reproducible evaluation

rather than adding agents without a specific purpose.

---

## License

This project was created as part of an agentic workflow hackathon / technical evaluation.
