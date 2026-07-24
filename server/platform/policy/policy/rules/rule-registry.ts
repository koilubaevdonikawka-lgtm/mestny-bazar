import type { IRuleRegistry } from "@server/platform/policy/policy/contracts";
import {
  createRuleDescriptor,
  type RuleDescriptor,
  type RuleKind,
} from "@server/platform/policy/policy/models";

/** Registers policy rule metadata. */
export class RuleRegistry implements IRuleRegistry {
  private readonly rules = new Map<string, RuleDescriptor>();

  register(rule: RuleDescriptor): RuleDescriptor {
    const stored = createRuleDescriptor(rule);
    this.rules.set(stored.id, stored);
    return stored;
  }

  get(ruleId: string): RuleDescriptor | undefined {
    return this.rules.get(ruleId.trim());
  }

  list(kind?: RuleKind): readonly RuleDescriptor[] {
    const values = [...this.rules.values()];
    const filtered = kind ? values.filter((rule) => rule.kind === kind) : values;
    return Object.freeze([...filtered]);
  }
}
