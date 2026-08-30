export type BaselineResult = {
  name: string;
  output: string;
};

export function runBaseline(task: string): BaselineResult {
  return {
    name: "Simple Baseline",

    output: `# Basic Implementation Plan

Task:

${task}

## Approach

1. Understand the requested feature.
2. Update the relevant frontend components.
3. Update the relevant backend or API code.
4. Add validation.
5. Handle errors.
6. Add tests.
7. Run the application and verify the feature.

## Risks

- Invalid input
- API failures
- Authentication issues
- Unexpected edge cases

## Verification

Confirm that the requested feature works and that tests pass.`,
  };
}
