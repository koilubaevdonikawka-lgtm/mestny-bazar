import type { IMemoryProfileSerializer } from "@server/application/ai-memory-profile-registry/contracts/memory-profile-serializer.contract";
import {
  createMemoryProfile,
  type MemoryProfile,
} from "@server/application/ai-memory-profile-registry/models/memory-profile.model";

/** JSON-based memory profile serializer. */
export class JsonMemoryProfileSerializer implements IMemoryProfileSerializer {
  async serialize(memoryProfile: MemoryProfile): Promise<string> {
    return JSON.stringify(memoryProfile);
  }

  async deserialize(serialized: string): Promise<MemoryProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized memory profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<MemoryProfile>;
    return createMemoryProfile({
      memoryProfileId: parsed.memoryProfileId ?? "",
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
