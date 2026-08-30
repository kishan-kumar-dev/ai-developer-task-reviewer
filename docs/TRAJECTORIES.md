# Agent Trajectories

## Overview

The workflow contains four specialized agents.

Each agent receives the minimum context required for its responsibility.

---

## 1. Research Agent

### Input

Original developer task.

### Responsibility

Identify:

- User intent
- Requirements
- Technical considerations
- Missing information
- Risks

### Output

Structured research findings.

---

## 2. Analysis Agent

### Input

Original developer task
+
Research Agent output

### Responsibility

Convert research into:

- Functional requirements
- Technical requirements
- Implementation steps
- Edge cases

### Output

Implementation analysis.

---

## 3. Verification Agent

### Input

Original developer task
+
Analysis Agent output

### Responsibility

Check:

- Missing requirements
- Unsupported assumptions
- Contradictions
- Technical risks
- Edge cases

### Output

Verification status and findings.

---

## 4. Final Solution Agent

### Input

Original developer task
+
Research
+
Analysis
+
Verification

### Responsibility

Produce the final developer-ready implementation plan.

### Output

A structured plan containing:

- Understanding
- Requirements
- Implementation Plan
- Edge Cases
- Verification

---

## Example Trajectory

```text
Developer Task
      |
      v
Research Agent
      |
      | research findings
      v
Analysis Agent
      |
      | implementation analysis
      v
Verification Agent
      |
      | verification result
      v
Final Solution Agent
      |
      v
Developer-ready plan