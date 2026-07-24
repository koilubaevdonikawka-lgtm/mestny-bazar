import type { IAgentInstanceRepository } from "@server/application/ai-agent-sdk/contracts/agent-instance-repository.contract";
import type { AgentInstance } from "@server/application/ai-agent-sdk/models/agent-sdk.model";

/** In-memory agent instance store. */
export class AgentInstanceRepository implements IAgentInstanceRepository {
  private readonly instances = new Map<string, AgentInstance>();
  private readonly instancesBySdkId = new Map<string, Set<string>>();

  async save(instance: AgentInstance): Promise<void> {
    const existing = this.instances.get(instance.instanceId);
    if (existing && existing.sdkId !== instance.sdkId) {
      this.removeFromSdk(existing.sdkId, existing.instanceId);
    }

    this.instances.set(instance.instanceId, instance);
    this.addToSdk(instance.sdkId, instance.instanceId);
  }

  async findById(instanceId: string): Promise<AgentInstance | null> {
    return this.instances.get(instanceId.trim()) ?? null;
  }

  async findBySdkId(sdkId: string): Promise<readonly AgentInstance[]> {
    const instanceIds = this.instancesBySdkId.get(sdkId.trim());
    if (!instanceIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...instanceIds]
        .map((instanceId) => this.instances.get(instanceId))
        .filter((instance): instance is AgentInstance => instance !== undefined),
    );
  }

  async findAll(): Promise<readonly AgentInstance[]> {
    return Object.freeze([...this.instances.values()]);
  }

  async delete(instanceId: string): Promise<boolean> {
    const instance = await this.findById(instanceId);
    if (!instance) {
      return false;
    }
    this.instances.delete(instance.instanceId);
    this.removeFromSdk(instance.sdkId, instance.instanceId);
    return true;
  }

  async deleteBySdkId(sdkId: string): Promise<number> {
    const instances = await this.findBySdkId(sdkId);
    for (const instance of instances) {
      this.instances.delete(instance.instanceId);
    }
    this.instancesBySdkId.delete(sdkId.trim());
    return instances.length;
  }

  private addToSdk(sdkId: string, instanceId: string): void {
    const normalizedSdkId = sdkId.trim();
    const sdkSet = this.instancesBySdkId.get(normalizedSdkId) ?? new Set<string>();
    sdkSet.add(instanceId);
    this.instancesBySdkId.set(normalizedSdkId, sdkSet);
  }

  private removeFromSdk(sdkId: string, instanceId: string): void {
    const normalizedSdkId = sdkId.trim();
    const sdkSet = this.instancesBySdkId.get(normalizedSdkId);
    if (!sdkSet) {
      return;
    }
    sdkSet.delete(instanceId);
    if (sdkSet.size === 0) {
      this.instancesBySdkId.delete(normalizedSdkId);
    }
  }
}
