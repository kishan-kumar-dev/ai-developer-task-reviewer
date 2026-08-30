import type {
  AgentTrace,
  FinalReviewResult,
  Requirement,
  RequirementFinding,
} from "./types";

export interface DemoAnalysis {
  requirements: Requirement[];
  findings: RequirementFinding[];
  finalResult: FinalReviewResult;
  agents: AgentTrace[];
  trace: {
    startedAt: string;
    completedAt: string;
    agentCount: number;
  };
}

function createTrace(
  agent: string,
  inputSummary: string,
  actions: string[],
  findings: string[],
  startedAt: string,
  completedAt: string,
): AgentTrace {
  return {
    agent,
    startedAt,
    completedAt,
    inputSummary,
    actions,
    findings,
    retries: 0,
  };
}

function buildRequirements(task: string): Requirement[] {
  const lower = task.toLowerCase();

  const requirements: Requirement[] = [
    {
      id: "REQ-001",
      title: "Core requested behavior",
      description: `The application must implement the behavior requested by the developer: ${task}`,
      priority: "critical",
      acceptanceCriteria: [
        `The requested feature is implemented according to the original task.`,
        "The expected success behavior is clearly defined and testable.",
        "Existing functionality is preserved unless the task explicitly requires a change.",
      ],
    },
    {
      id: "REQ-002",
      title: "Input and boundary validation",
      description:
        "Inputs received by the feature must be validated at the appropriate system boundaries.",
      priority: "high",
      acceptanceCriteria: [
        "Required inputs are validated.",
        "Malformed or invalid input is rejected safely.",
        "Validation failures return useful and predictable errors.",
      ],
    },
    {
      id: "REQ-003",
      title: "Failure and edge-case handling",
      description:
        "The implementation must safely handle expected failures and important edge cases.",
      priority: "high",
      acceptanceCriteria: [
        "Expected external-service failures are handled.",
        "Duplicate or repeated requests are considered where applicable.",
        "Partial failures do not leave the application in an unsafe or inconsistent state.",
      ],
    },
    {
      id: "REQ-004",
      title: "Security and authorization",
      description:
        "The implementation must respect authentication, authorization, secret-management, and security requirements relevant to the feature.",
      priority: "high",
      acceptanceCriteria: [
        "Authentication requirements are preserved.",
        "Authorization checks are applied where required.",
        "Secrets and credentials are not hard-coded.",
        "Untrusted input is handled safely.",
      ],
    },
    {
      id: "REQ-005",
      title: "Testing and verification",
      description:
        "The implementation must be verifiable against explicit acceptance criteria.",
      priority: "medium",
      acceptanceCriteria: [
        "Important success paths have automated tests.",
        "Important failure and edge cases have tests.",
        "The final implementation is checked against every acceptance criterion.",
      ],
    },
  ];

  // Add task-specific acceptance criteria where the intent is obvious.
  if (lower.includes("webhook")) {
    requirements[0] = {
      ...requirements[0],
      title: "Process payment webhook",
      description:
        "The application must receive and process the payment provider webhook and update the related order status when payment is confirmed successful.",
      acceptanceCriteria: [
        "The webhook endpoint accepts the payment provider event.",
        "The event is validated before changing order state.",
        "A confirmed successful payment updates the correct order status.",
      ],
    };
  } else if (lower.includes("subscription") || lower.includes("stripe")) {
    requirements[0] = {
      ...requirements[0],
      title: "Manage subscriptions",
      description:
        "Users must be able to manage the requested subscription lifecycle.",
      acceptanceCriteria: [
        "Users can upgrade their subscription.",
        "Users can downgrade their subscription.",
        "Users can cancel their subscription.",
      ],
    };
  } else if (lower.includes("oauth") || lower.includes("google authentication")) {
    requirements[0] = {
      ...requirements[0],
      title: "Google authentication",
      description:
        "Users must be able to authenticate with Google while existing email/password authentication continues to work.",
      acceptanceCriteria: [
        "Users can sign in using Google OAuth.",
        "Existing email/password login continues to work.",
        "The application handles authentication failures safely.",
      ],
    };
  } else if (lower.includes("pagination")) {
    requirements[0] = {
      ...requirements[0],
      title: "Paginated customer list",
      description:
        "The customer list must support pagination and show the total number of available results.",
      acceptanceCriteria: [
        "Users can move between result pages.",
        "The current page is represented correctly.",
        "The total number of results is displayed.",
      ],
    };
  } else if (lower.includes("search")) {
    requirements[0] = {
      ...requirements[0],
      title: "Product search",
      description:
        "Users must be able to search the product catalog by product name.",
      acceptanceCriteria: [
        "Users can enter a product-name search query.",
        "Matching products are returned.",
        "Empty or no-match searches are handled clearly.",
      ],
    };
  }

  return requirements;
}

export function getDemoAnalysis(task: string): DemoAnalysis {
  const cleanTask = task.trim();

  const startedAt = new Date().toISOString();

  const requirements = buildRequirements(cleanTask);

  const researchCompletedAt = new Date().toISOString();

  const researchTrace = createTrace(
    "Research Agent",
    cleanTask,
    [
      "Read the developer task.",
      "Extracted the requested behavior.",
      "Identified technical considerations.",
      "Identified missing repository context.",
      "Identified security, validation, failure, and testing concerns.",
    ],
    [
      "Original developer task identified as the source of truth.",
      "Repository context is unavailable in Demo Mode.",
      "Acceptance criteria should be verified before implementation.",
    ],
    startedAt,
    researchCompletedAt,
  );

  const normalizedCompletedAt = new Date().toISOString();

  const normalizedTrace = createTrace(
    "Requirement Normalizer",
    "Research findings from the Research Agent.",
    [
      "Converted the task into explicit requirements.",
      "Created stable requirement IDs.",
      "Defined testable acceptance criteria.",
      "Assigned priorities.",
    ],
    requirements.map(
      (requirement) =>
        `${requirement.id}: ${requirement.title}`,
    ),
    researchCompletedAt,
    normalizedCompletedAt,
  );

  const implementationCompletedAt = new Date().toISOString();

  const implementationTrace = createTrace(
    "Implementation Agent",
    "Normalized requirements and candidate repository context.",
    [
      "Checked whether a candidate repository path was supplied.",
      "Demo Mode does not perform filesystem inspection.",
      "Prepared repository evidence requirements.",
      "Avoided claiming implementation completeness without source evidence.",
    ],
    [
      "No repository evidence is available in Demo Mode.",
      "Implementation status cannot be established from task text alone.",
    ],
    normalizedCompletedAt,
    implementationCompletedAt,
  );

  const findings: RequirementFinding[] = requirements.map(
    (requirement) => ({
      requirementId: requirement.id,
      status: "missing",
      confidence: 100,
      evidence: [
        {
          source: "Demo Mode",
          location: "No candidate repository supplied",
          excerpt: cleanTask,
          explanation:
            "The requirement was identified from the developer task, but no repository source evidence is available in deterministic Demo Mode.",
        },
      ],
      reasoning:
        "The requirement is understood from the task, but implementation completeness cannot be established without inspecting the candidate repository.",
    }),
  );

  const verificationCompletedAt = new Date().toISOString();

  const verificationTrace = createTrace(
    "Verification Agent",
    "Normalized requirements and implementation findings.",
    [
      "Checked each requirement for available evidence.",
      "Rejected unsupported implementation-complete claims.",
      "Checked for missing repository evidence.",
      "Checked validation, security, failure handling, and testing coverage.",
    ],
    [
      "Requirements are explicit.",
      "Implementation evidence is unavailable.",
      "The workflow does not claim repository completeness without evidence.",
    ],
    implementationCompletedAt,
    verificationCompletedAt,
  );

  const finalCompletedAt = new Date().toISOString();

  const finalResult: FinalReviewResult = {
    summary:
      "The developer task has been converted into a structured implementation review. Demo Mode can establish requirements and verification criteria, but it cannot establish repository implementation completeness without a candidate repository.",
    strengths: [
      "The original developer task remains the source of truth.",
      "The task has been converted into explicit acceptance criteria.",
      "Security, validation, failure handling, and testing concerns are identified.",
      "Unsupported implementation claims are avoided.",
    ],
    gaps: [
      "No candidate repository was supplied for source-level inspection.",
      "Existing architecture and affected files cannot be confirmed.",
      "Actual implementation status cannot be verified in Demo Mode.",
    ],
    risks: [
      "Implementing against an assumed architecture could introduce unnecessary changes.",
      "External API behavior may differ from assumptions.",
      "Security and authorization requirements need repository-specific verification.",
      "Webhook or repeated-request workflows may require idempotency handling.",
    ],
    recommendations: [
      "Run the workflow in Live Gemini mode with a candidate repository path.",
      "Inspect the existing architecture before implementation.",
      "Map every normalized requirement to concrete source-level evidence.",
      "Implement the smallest change that satisfies the acceptance criteria.",
      "Add automated tests for success, failure, and important edge cases.",
      "Perform a final requirement-by-requirement verification before release.",
    ],
    overallAssessment:
      "Requirements are ready for implementation planning, but repository-level implementation completeness remains unverified because this is a deterministic Demo Mode execution without source inspection.",
    trace: createTrace(
      "Final Solution Agent",
      "Research, normalized requirements, implementation findings, and verification results.",
      [
        "Synthesized the five-agent workflow.",
        "Connected requirements to available evidence.",
        "Identified remaining implementation gaps.",
        "Produced a developer-ready implementation review.",
      ],
      [
        "Final review is evidence-aware.",
        "No repository completeness claim was made without repository evidence.",
      ],
      verificationCompletedAt,
      finalCompletedAt,
    ),
  };

  const completedAt = new Date().toISOString();

  return {
    requirements,
    findings,
    finalResult,
    agents: [
      researchTrace,
      normalizedTrace,
      implementationTrace,
      verificationTrace,
      finalResult.trace,
    ],
    trace: {
      startedAt,
      completedAt,
      agentCount: 5,
    },
  };
}