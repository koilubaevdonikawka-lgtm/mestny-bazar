import type { IComplianceRegistry } from "@server/platform/compliance/compliance/contracts";
import {
  createComplianceStandard,
  type ComplianceStandard,
  type ComplianceStandardCategory,
} from "@server/platform/compliance/compliance/models";
import { createStandardRegisteredEvent } from "@server/platform/compliance/compliance/events";

/** Central registry for compliance standard metadata. */
export class ComplianceRegistry implements IComplianceRegistry {
  private readonly standards = new Map<string, ComplianceStandard>();

  register(standard: ComplianceStandard): ComplianceStandard {
    const stored = createComplianceStandard(standard);
    this.standards.set(stored.id, stored);
    createStandardRegisteredEvent(stored);
    return stored;
  }

  get(standardId: string): ComplianceStandard | undefined {
    return this.standards.get(standardId.trim());
  }

  list(category?: ComplianceStandardCategory): readonly ComplianceStandard[] {
    const values = [...this.standards.values()];
    const filtered = category ? values.filter((standard) => standard.category === category) : values;
    return Object.freeze([...filtered]);
  }
}
