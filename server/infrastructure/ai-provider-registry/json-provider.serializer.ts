import type { IProviderSerializer } from "@server/application/ai-provider-registry/contracts/provider-serializer.contract";
import {
  createProvider,
  type Provider,
} from "@server/application/ai-provider-registry/models/provider.model";

/** JSON-based provider serializer. */
export class JsonProviderSerializer implements IProviderSerializer {
  async serialize(provider: Provider): Promise<string> {
    return JSON.stringify(provider);
  }

  async deserialize(serialized: string): Promise<Provider> {
    if (!serialized.trim()) {
      throw new Error("Serialized provider cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Provider>;
    return createProvider({
      providerId: parsed.providerId ?? "",
      name: parsed.name ?? "",
      type: parsed.type ?? "",
      description: parsed.description,
      configuration: parsed.configuration,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
