# AI Developer Task Reviewer

### Agentic Workflows Hackathon

Turn ambiguous software development tasks into reliable, developer-ready implementation plans using a four-stage multi-agent workflow.

**Research → Analysis → Verification → Final**

---

## Overview

**AI Developer Task Reviewer** is a Next.js application that helps developers transform a software feature request or engineering problem into a structured implementation plan.

The application uses four specialized agents:

1. **Research Agent** — extracts requirements, technical considerations, missing information, and risks.
2. **Analysis Agent** — converts the research into a practical implementation strategy.
3. **Verification Agent** — checks assumptions, omissions, contradictions, and edge cases.
4. **Final Solution Agent** — produces a developer-ready implementation plan.

The workflow passes the output of each stage to the next stage, creating a sequential agentic workflow.

---

## Features

* Four-stage agentic workflow
* Research → Analysis → Verification → Final pipeline
* Deterministic Demo Mode
* Optional Live Gemini execution
* Gemini API integration
* Gemini rate-limit/quota handling
* Input validation
* Error handling
* Developer-friendly implementation plans
* Example developer tasks
* Clear/reset workflow
* Responsive UI
* Production-ready Next.js build

---

## Execution Modes

### Demo Mode

Demo Mode runs the workflow locally using deterministic responses.

Advantages:

* Does not consume Gemini API quota
* Reproducible results
* Reliable for demonstrations and judging
* Works without an active Gemini API request

### Live Gemini

Live Gemini executes the four agents using the configured Google Gemini API.

The application reads the API key from:

```text
GEMINI_API_KEY
```

The API key is kept server-side and should never be committed to GitHub.

---

## Agent Workflow

```text
Developer Task
      │
      ▼
┌─────────────────┐
│ Research Agent  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Analysis Agent  │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Verification Agent  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Final Solution Agent│
└────────┬────────────┘
         │
         ▼
Developer-Ready
Implementation Plan
```

Each stage receives relevant information from the previous stage.

---

## Tech Stack

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS
* Google Gemini API
* `@google/genai`
* ESLint
* TSX

---

## Project Structure

```text
agentic-workflow-hackathon/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   └── lib/
│       ├── agents.ts
│       ├── demo.ts
│       └── gemini.ts
│
├── evaluate.ts
├── package.json
├── README.md
├── .gitignore
└── ...
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Gemini

Create a local environment file:

```text
.env.local
```

Add:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Do not commit `.env.local`.

---

## Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Available Commands

### Development

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

### Evaluation

```bash
npm run evaluate
```

### Production Build

```bash
npm run build
```

### Production Server

```bash
npm run start
```

---

## Evaluation

The project includes a deterministic evaluation script.

Run:

```bash
npm run evaluate
```

The evaluation verifies:

* API request succeeds
* Demo Mode is active
* Four agents execute
* Research Agent exists
* Verification Agent exists
* Final Agent exists
* Final result exists

Expected result:

```text
AI Developer Task Reviewer Evaluation

Testing Demo Mode...

Evaluation Results:

✅ API request succeeded
✅ Demo mode is active
✅ Four agents executed
✅ Research Agent exists
✅ Verification Agent exists
✅ Final Agent exists
✅ Final result exists

✅ All evaluation checks passed.
```

---

## Quality Checks

Before submission, run:

```bash
npm run lint
npm run evaluate
npm run build
```

The project should pass all three commands.

---

## Example Task

You can test the application with a task such as:

```text
Add Stripe subscriptions to our Next.js SaaS application.
Users should be able to upgrade, downgrade, and cancel their subscription.
```

The workflow will analyze the request and produce a structured implementation plan.

---

## Error Handling

The application validates incoming tasks before processing them.

It handles:

* Invalid JSON
* Missing tasks
* Empty tasks
* Gemini API errors
* Gemini rate limits
* Gemini quota errors
* Unexpected server errors

When Gemini returns a rate-limit or quota error, the API returns an appropriate `429` response instead of crashing the application.

---

## Security

The Gemini API key is stored in an environment variable:

```env
GEMINI_API_KEY
```

Environment files are excluded from Git through `.gitignore`.

Never commit:

```text
.env
.env.local
.env.production
```

---

## Why Demo Mode?

AI APIs can be affected by temporary quota limits or rate limits.

Demo Mode provides a deterministic fallback for demonstrations and evaluation while keeping the real Gemini workflow available when API access is configured.

This makes the application easier to judge and reproduce without depending entirely on external API availability.

---

## Future Improvements

Possible future enhancements include:

* Streaming agent responses
* Parallel research agents
* Persistent analysis history
* Authentication
* Export implementation plans
* Markdown/PDF export
* Repository-aware analysis
* GitHub repository integration
* Additional specialized verification agents

These are not required for the current workflow.

---

## Hackathon Submission

**Project:** AI Developer Task Reviewer

**Workflow:**

```text
Research
   ↓
Analysis
   ↓
Verification
   ↓
Final Solution
```

The application demonstrates how multiple specialized AI agents can work sequentially to turn an ambiguous developer request into a reliable implementation plan.

---

## License

This project was created for the Agentic Workflows Hackathon.
