/**
 * AI Agent SDK — unified SDK for creating and connecting AI agents.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IAgentFactory } from "@server/application/ai-agent-sdk/contracts/agent-factory.contract";
import type { IAgentInstanceRepository } from "@server/application/ai-agent-sdk/contracts/agent-instance-repository.contract";
import type { IAgentLifecycleManager } from "@server/application/ai-agent-sdk/contracts/agent-lifecycle-manager.contract";
import type { IAgentSdkRepository } from "@server/application/ai-agent-sdk/contracts/agent-sdk-repository.contract";
import type { IAgentSdkStatisticsProvider } from "@server/application/ai-agent-sdk/contracts/agent-sdk-statistics-provider.contract";
import {
  createAgentInstance,
  createAgentSdk,
  type AgentInstance,
  type AgentSdk,
  type AgentSdkStatistics,
  type CreateAgentInstanceInput,
  type DeleteAgentSdkResult,
  type ListAgentInstancesResult,
  type ListAgentSdksResult,
  type RegisterAgentSdkInput,
  type UpdateAgentSdkInput,
} from "@server/application/ai-agent-sdk/models/agent-sdk.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiAgentSdkService {
  constructor(
    private readonly sdkRepository: IAgentSdkRepository,
    private readonly instanceRepository: IAgentInstanceRepository,
    private readonly agentFactory: IAgentFactory,
    private readonly lifecycleManager: IAgentLifecycleManager,
    private readonly statisticsProvider: IAgentSdkStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerAgentSdk(input: RegisterAgentSdkInput): Promise<AgentSdk> {
    const name = input.name.trim();
    const version = input.version.trim();

    if (!name) {
      throw new Error("Agent SDK name is required.");
    }
    if (!version) {
      throw new Error("Agent SDK version is required.");
    }
    if (await this.sdkRepository.findByName(name)) {
      throw new Error(`Agent SDK already exists: ${name}`);
    }

    const sdk = createAgentSdk({
      sdkId: this.idGenerator.generate(),
      name,
      version,
      description: input.description,
      capabilities: input.capabilities,
      config: input.config,
      status: input.status,
    });

    await this.sdkRepository.save(sdk);
    return sdk;
  }

  async getAgentSdk(sdkId: string): Promise<AgentSdk | null> {
    return this.sdkRepository.findById(sdkId.trim());
  }

  async listAgentSdks(): Promise<ListAgentSdksResult> {
    const sdks = Object.freeze(
      [...(await this.sdkRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ sdks, total: sdks.length });
  }

  async updateAgentSdk(input: UpdateAgentSdkInput): Promise<AgentSdk> {
    const sdkId = input.sdkId.trim();
    const existing = await this.sdkRepository.findById(sdkId);
    if (!existing) {
      throw new Error(`Agent SDK not found: ${sdkId}`);
    }

    const nextName = input.name?.trim() ?? existing.name;
    const nextVersion = input.version?.trim() ?? existing.version;

    if (nextName !== existing.name && (await this.sdkRepository.findByName(nextName))) {
      throw new Error(`Agent SDK already exists: ${nextName}`);
    }

    const updated = createAgentSdk({
      sdkId: existing.sdkId,
      name: nextName,
      version: nextVersion,
      description: input.description ?? existing.description,
      capabilities: input.capabilities ?? existing.capabilities,
      config: input.config ?? existing.config,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.sdkRepository.save(updated);
    return updated;
  }

  async deleteAgentSdk(sdkId: string): Promise<DeleteAgentSdkResult> {
    const normalizedSdkId = sdkId.trim();
    const deleted = await this.sdkRepository.delete(normalizedSdkId);
    if (deleted) {
      await this.instanceRepository.deleteBySdkId(normalizedSdkId);
    }
    return Object.freeze({ sdkId: normalizedSdkId, deleted });
  }

  async createAgentInstance(input: CreateAgentInstanceInput): Promise<AgentInstance> {
    const sdkId = input.sdkId.trim();
    const name = input.name.trim();

    if (!name) {
      throw new Error("Agent instance name is required.");
    }

    const sdk = await this.sdkRepository.findById(sdkId);
    if (!sdk) {
      throw new Error(`Agent SDK not found: ${sdkId}`);
    }
    if (sdk.status !== "active") {
      throw new Error(`Agent SDK is inactive: ${sdkId}`);
    }

    const instanceId = this.idGenerator.generate();
    const factoryResult = await this.agentFactory.create(sdk, input, instanceId);
    const lifecycleResult = await this.lifecycleManager.initialize(factoryResult.instance);

    await this.instanceRepository.save(lifecycleResult.instance);
    return lifecycleResult.instance;
  }

  async listAgentInstances(): Promise<ListAgentInstancesResult> {
    const instances = Object.freeze(
      [...(await this.instanceRepository.findAll())].sort((left, right) =>
        left.createdAt.localeCompare(right.createdAt),
      ),
    );
    return Object.freeze({ instances, total: instances.length });
  }

  async getAgentSdkStatistics(): Promise<AgentSdkStatistics> {
    const sdks = await this.sdkRepository.findAll();
    const instances = await this.instanceRepository.findAll();
    const activeSdks = sdks.filter((sdk) => sdk.status === "active").length;
    const runningInstances = instances.filter((instance) => instance.status === "running").length;

    return this.statisticsProvider.getStatistics({
      totalSdks: sdks.length,
      activeSdks,
      totalInstances: instances.length,
      runningInstances,
    });
  }
}
