export const PolicyCategory = {
  Business: "business",
  Platform: "platform",
  Security: "security",
  Deployment: "deployment",
  Provider: "provider",
  AI: "ai",
  Testing: "testing",
  Documentation: "documentation",
} as const;

export type PolicyCategoryValue = (typeof PolicyCategory)[keyof typeof PolicyCategory];

export const PolicySeverity = {
  Info: "info",
  Warning: "warning",
  Error: "error",
  Critical: "critical",
} as const;

export type PolicySeverityValue = (typeof PolicySeverity)[keyof typeof PolicySeverity];

/** Registered governance policy descriptor. */
export interface PolicyDescriptor {
  readonly id: string;
  readonly name: string;
  readonly category: PolicyCategoryValue;
  readonly description: string;
  readonly severity: PolicySeverityValue;
  readonly enabled: boolean;
  readonly evaluatorId: string;
}

export function createPolicyDescriptor(input: {
  id: string;
  name: string;
  category: PolicyCategoryValue;
  description: string;
  severity?: PolicySeverityValue;
  enabled?: boolean;
  evaluatorId: string;
}): PolicyDescriptor {
  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    category: input.category,
    description: input.description.trim(),
    severity: input.severity ?? PolicySeverity.Warning,
    enabled: input.enabled ?? true,
    evaluatorId: input.evaluatorId.trim(),
  });
}
