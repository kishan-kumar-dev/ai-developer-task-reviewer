import type { AgentResult } from "./agents";

export type DemoAnalysis = {
  agents: AgentResult[];
  finalResult: string;
};

export function getDemoAnalysis(task: string): DemoAnalysis {
  const cleanTask = task.trim();

  const research: AgentResult = {
    name: "Research Agent",
    output: `1. What the user wants

The user wants the following software task reviewed:

${cleanTask}

2. Important requirements

- Understand the requested feature.
- Identify the core functional requirements.
- Identify important technical considerations.
- Identify missing information before implementation.
- Identify potential implementation risks.

3. Important technical considerations

- Confirm the existing application architecture before implementation.
- Identify relevant frontend, backend, API, database, authentication, and deployment requirements.
- Define expected success and failure behavior.
- Consider validation, security, error handling, and maintainability.

4. Missing information

- Existing application structure is not provided.
- Exact technology versions may need confirmation.
- Authentication and authorization requirements may need clarification.
- Database and API constraints may need clarification.
- Acceptance criteria are not explicitly defined.

5. Potential risks

- Making assumptions about the existing architecture.
- Missing acceptance criteria.
- Incorrect handling of invalid input.
- Missing security or authorization checks.
- External API or service failures.`,
  };

  const analysis: AgentResult = {
    name: "Analysis Agent",
    output: `1. Goal

Turn the requested task into a concrete implementation plan without inventing unsupported requirements.

2. Functional requirements

- Preserve the original task as the source of truth.
- Define expected user-facing behavior.
- Define inputs and outputs.
- Define success and failure states.
- Preserve existing functionality unless changes are explicitly required.

3. Technical requirements

- Inspect the existing project structure first.
- Identify affected frontend and backend components.
- Identify required API and data-layer changes.
- Validate inputs at system boundaries.
- Handle errors explicitly.
- Keep secrets outside source code.
- Add tests for important behavior.

4. Suggested implementation steps

1. Inspect the repository.
2. Convert the task into explicit acceptance criteria.
3. Identify affected components.
4. Design the smallest implementation that satisfies the requirements.
5. Implement the required changes.
6. Add validation and error handling.
7. Add focused tests.
8. Run the application and tests.
9. Compare the implementation against the original task.

5. Potential edge cases

- Missing or invalid input.
- Duplicate operations.
- API failures.
- Authentication or authorization failures.
- Unexpected external-service responses.
- Existing data conflicts.
- Partial failures.
- Backward compatibility issues.`,
  };

  const verification: AgentResult = {
    name: "Verification Agent",
    output: `VERIFICATION: PASS

Checks performed:

✓ The original task remains the source of truth.
✓ No unsupported business functionality was introduced.
✓ Missing project context is explicitly identified.
✓ Technical assumptions are treated as items to verify.
✓ Validation and error handling are included.
✓ Testing is included.
✓ Important edge cases are covered.

Remaining uncertainty:

The actual repository and technical environment should be inspected before implementation. The developer should confirm the existing architecture and acceptance criteria before coding.`,
  };

  const final: AgentResult = {
    name: "Final Agent",
    output: `# Understanding

The requested task is:

${cleanTask}

The implementation should begin by understanding the existing application and converting the request into explicit, testable acceptance criteria.

# Requirements

- Preserve the original task as the source of truth.
- Identify all required user-facing behavior.
- Confirm the existing architecture before implementation.
- Validate inputs.
- Handle expected failures safely.
- Keep credentials and secrets outside source code.
- Add tests for important behavior.
- Verify the final implementation against the original requirements.

# Implementation Plan

1. Inspect the existing repository structure.
2. Identify affected frontend, backend, API, and data components.
3. Document the current behavior.
4. Convert the task into testable acceptance criteria.
5. Select the smallest implementation that satisfies those criteria.
6. Implement the required functionality incrementally.
7. Add validation and error handling.
8. Add or update automated tests.
9. Run the application locally.
10. Run the relevant tests.
11. Compare the result against every acceptance criterion.

# Edge Cases

- Empty or malformed input.
- Unexpected API responses.
- Network or service failures.
- Duplicate requests.
- Authentication failures.
- Authorization failures.
- Existing data conflicts.
- Partial failures.
- Backward compatibility problems.

# Verification

The implementation should not be considered complete until:

- The requested behavior works.
- Existing behavior still works.
- Invalid input is handled safely.
- Expected failures produce useful errors.
- Tests pass.
- Every original acceptance criterion has been checked.`,
  };

  return {
    agents: [research, analysis, verification, final],
    finalResult: final.output,
  };
}
