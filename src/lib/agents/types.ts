export type RequirementPriority =
  | "critical"
  | "high"
  | "medium"
  | "low";

export type RequirementStatus =
  | "complete"
  | "partial"
  | "missing";

export interface Requirement {
  id: string;
  title: string;
  description: string;
  priority: RequirementPriority;
  acceptanceCriteria: string[];
}

export interface Evidence {
  source: string;
  location?: string;
  excerpt?: string;
  explanation?: string;
}

export interface RequirementFinding {
  requirementId: string;
  status: RequirementStatus;
  confidence: number;
  evidence: Evidence[];
  reasoning: string;
}

export interface AgentTrace {
  agent: string;
  startedAt: string;
  completedAt: string;
  inputSummary: string;
  actions: string[];
  findings: string[];
  retries: number;
}

export interface ReviewInput {
  task: string;
  repositoryPath: string;
}