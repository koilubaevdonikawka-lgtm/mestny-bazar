import type { ISecurityProfileSerializer } from "@server/application/ai-security-profile-registry/contracts/security-profile-serializer.contract";
import {
  createSecurityProfile,
  type SecurityProfile,
} from "@server/application/ai-security-profile-registry/models/security-profile.model";

/** JSON-based security profile serializer. */
export class JsonSecurityProfileSerializer implements ISecurityProfileSerializer {
  async serialize(securityProfile: SecurityProfile): Promise<string> {
    return JSON.stringify(securityProfile);
  }

  async deserialize(serialized: string): Promise<SecurityProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized security profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<SecurityProfile>;
    return createSecurityProfile({
      securityProfileId: parsed.securityProfileId ?? "",
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
