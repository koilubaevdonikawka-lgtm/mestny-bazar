import type { RuleDescriptor, RuleKind } from "@server/platform/policy/policy/models";

/** Contract for policy rule registration. */
export interface IRuleRegistry {
  register(rule: RuleDescriptor): RuleDescriptor;
  get(ruleId: string): RuleDescriptor | undefined;
  list(kind?: RuleKind): readonly RuleDescriptor[];
}
