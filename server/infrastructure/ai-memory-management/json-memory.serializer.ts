import type { IMemorySerializer } from "@server/application/ai-memory-management/contracts/memory-serializer.contract";

/** JSON-based memory serializer. */
export class JsonMemorySerializer implements IMemorySerializer {
  async serialize(data: unknown): Promise<string> {
    return JSON.stringify(data ?? {});
  }

  async deserialize(serialized: string): Promise<unknown> {
    if (!serialized.trim()) {
      return Object.freeze({});
    }
    return JSON.parse(serialized) as unknown;
  }
}
