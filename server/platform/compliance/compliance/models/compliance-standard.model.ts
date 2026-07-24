export type ComplianceStandardCategory =
  | "architecture"
  | "platform"
  | "security"
  | "operational"
  | "release";

export type ComplianceCheckKind =
  | "architecture"
  | "dependencies"
  | "configuration"
  | "documentation"
  | "governance"
  | "platform-health";

/** Registered compliance standard metadata. */
export interface ComplianceStandard {
  readonly id: string;
  readonly name: string;
  readonly category: ComplianceStandardCategory;
  readonly checkKind: ComplianceCheckKind;
  readonly description: string;
  readonly weight: number;
  readonly registeredAt: string;
}

export function createComplianceStandard(input: {
  id?: string;
  name: string;
  category: ComplianceStandardCategory;
  checkKind: ComplianceCheckKind;
  description?: string;
  weight?: number;
}): ComplianceStandard {
  return Object.freeze({
    id: input.id ?? `standard-${Date.now()}`,
    name: input.name.trim(),
    category: input.category,
    checkKind: input.checkKind,
    description: input.description?.trim() ?? "",
    weight: input.weight ?? 1,
    registeredAt: new Date().toISOString(),
  });
}
