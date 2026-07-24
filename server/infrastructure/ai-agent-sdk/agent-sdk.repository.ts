import type { IAgentSdkRepository } from "@server/application/ai-agent-sdk/contracts/agent-sdk-repository.contract";
import type { AgentSdk } from "@server/application/ai-agent-sdk/models/agent-sdk.model";

/** In-memory agent SDK store. */
export class AgentSdkRepository implements IAgentSdkRepository {
  private readonly sdks = new Map<string, AgentSdk>();
  private readonly sdksByName = new Map<string, string>();

  async save(sdk: AgentSdk): Promise<void> {
    const existing = this.sdks.get(sdk.sdkId);
    if (existing && existing.name !== sdk.name) {
      this.sdksByName.delete(existing.name);
    }

    this.sdks.set(sdk.sdkId, sdk);
    this.sdksByName.set(sdk.name, sdk.sdkId);
  }

  async findById(sdkId: string): Promise<AgentSdk | null> {
    return this.sdks.get(sdkId.trim()) ?? null;
  }

  async findByName(name: string): Promise<AgentSdk | null> {
    const sdkId = this.sdksByName.get(name.trim());
    if (!sdkId) {
      return null;
    }
    return this.findById(sdkId);
  }

  async findAll(): Promise<readonly AgentSdk[]> {
    return Object.freeze([...this.sdks.values()]);
  }

  async delete(sdkId: string): Promise<boolean> {
    const sdk = await this.findById(sdkId);
    if (!sdk) {
      return false;
    }
    this.sdks.delete(sdk.sdkId);
    this.sdksByName.delete(sdk.name);
    return true;
  }
}
