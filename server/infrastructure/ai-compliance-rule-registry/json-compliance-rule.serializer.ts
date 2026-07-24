import type { IComplianceRuleSerializer } from "@server/application/ai-compliance-rule-registry/contracts/compliance-rule-serializer.contract";
import {
  createComplianceRule,
  type ComplianceRule,
} from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";

/** JSON-based compliance rule serializer. */
export class JsonComplianceRuleSerializer implements IComplianceRuleSerializer {
  async serialize(complianceRule: ComplianceRule): Promise<string> {
    return JSON.stringify(complianceRule);
  }

  async deserialize(serialized: string): Promise<ComplianceRule> {
    if (!serialized.trim()) {
      throw new Error("Serialized compliance rule cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<ComplianceRule>;
    return createComplianceRule({
      complianceRuleId: parsed.complianceRuleId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
