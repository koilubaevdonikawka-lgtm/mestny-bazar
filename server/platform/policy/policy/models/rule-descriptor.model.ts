export type RuleKind =
  | "dependency"
  | "naming"
  | "layer"
  | "module"
  | "version";

/** Registered policy rule metadata. */
export interface RuleDescriptor {
  readonly id: string;
  readonly name: string;
  readonly kind: RuleKind;
  readonly pattern: string;
  readonly description: string;
  readonly registeredAt: string;
}

export function createRuleDescriptor(input: {
  id?: string;
  name: string;
  kind: RuleKind;
  pattern: string;
  description?: string;
}): RuleDescriptor {
  return Object.freeze({
    id: input.id ?? `rule-${Date.now()}`,
    name: input.name.trim(),
    kind: input.kind,
    pattern: input.pattern.trim(),
    description: input.description?.trim() ?? "",
    registeredAt: new Date().toISOString(),
  });
}
