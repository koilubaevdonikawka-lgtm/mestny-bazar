import type { IRuntimeProfileSerializer } from "@server/application/ai-runtime-profile-registry/contracts/runtime-profile-serializer.contract";
import {
  createRuntimeProfile,
  type RuntimeProfile,
} from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";

/** JSON-based runtime profile serializer. */
export class JsonRuntimeProfileSerializer implements IRuntimeProfileSerializer {
  async serialize(runtimeProfile: RuntimeProfile): Promise<string> {
    return JSON.stringify(runtimeProfile);
  }

  async deserialize(serialized: string): Promise<RuntimeProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized runtime profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<RuntimeProfile>;
    return createRuntimeProfile({
      runtimeProfileId: parsed.runtimeProfileId ?? "",
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
