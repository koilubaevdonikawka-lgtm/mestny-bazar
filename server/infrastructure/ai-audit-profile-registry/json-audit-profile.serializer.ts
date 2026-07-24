import type { IAuditProfileSerializer } from "@server/application/ai-audit-profile-registry/contracts/audit-profile-serializer.contract";
import {
  createAuditProfile,
  type AuditProfile,
} from "@server/application/ai-audit-profile-registry/models/audit-profile.model";

/** JSON-based audit profile serializer. */
export class JsonAuditProfileSerializer implements IAuditProfileSerializer {
  async serialize(auditProfile: AuditProfile): Promise<string> {
    return JSON.stringify(auditProfile);
  }

  async deserialize(serialized: string): Promise<AuditProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized audit profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<AuditProfile>;
    return createAuditProfile({
      auditProfileId: parsed.auditProfileId ?? "",
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
