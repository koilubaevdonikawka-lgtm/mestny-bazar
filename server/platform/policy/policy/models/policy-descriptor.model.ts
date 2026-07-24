export type PolicyCategory =
  | "architecture"
  | "platform"
  | "provider"
  | "runtime"
  | "operational";

export type PolicyCheckKind =
  | "architecture"
  | "compatibility"
  | "providers"
  | "configuration"
  | "platform-health";

/** Registered platform policy metadata. */
export interface PolicyDescriptor {
  readonly id: string;
  readonly name: string;
  readonly category: PolicyCategory;
  readonly checkKind: PolicyCheckKind;
  readonly description: string;
  readonly enabled: boolean;
  readonly registeredAt: string;
}

export function createPolicyDescriptor(input: {
  id?: string;
  name: string;
  category: PolicyCategory;
  checkKind: PolicyCheckKind;
  description?: string;
  enabled?: boolean;
}): PolicyDescriptor {
  return Object.freeze({
    id: input.id ?? `policy-${Date.now()}`,
    name: input.name.trim(),
    category: input.category,
    checkKind: input.checkKind,
    description: input.description?.trim() ?? "",
    enabled: input.enabled ?? true,
    registeredAt: new Date().toISOString(),
  });
}
