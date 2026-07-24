/**
 * AI Node Profile Registry — unified registry for AI node profiles.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { INodeProfileCatalog } from "@server/application/ai-node-profile-registry/contracts/node-profile-catalog.contract";
import type { INodeProfileRepository } from "@server/application/ai-node-profile-registry/contracts/node-profile-repository.contract";
import type { INodeProfileSerializer } from "@server/application/ai-node-profile-registry/contracts/node-profile-serializer.contract";
import type { INodeProfileStatisticsProvider } from "@server/application/ai-node-profile-registry/contracts/node-profile-statistics-provider.contract";
import type { INodeProfileValidator } from "@server/application/ai-node-profile-registry/contracts/node-profile-validator.contract";
import {
  createNodeProfile,
  type DeleteNodeProfileResult,
  type FindNodeProfileByNameResult,
  type NodeProfile,
  type NodeProfileRegistryStatistics,
  type ListNodeProfilesByCategoryResult,
  type ListNodeProfilesResult,
  type RegisterNodeProfileInput,
  type UpdateNodeProfileInput,
} from "@server/application/ai-node-profile-registry/models/node-profile.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiNodeProfileRegistryService {
  constructor(
    private readonly nodeProfileRepository: INodeProfileRepository,
    private readonly nodeProfileCatalog: INodeProfileCatalog,
    private readonly nodeProfileValidator: INodeProfileValidator,
    private readonly nodeProfileSerializer: INodeProfileSerializer,
    private readonly statisticsProvider: INodeProfileStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerNodeProfile(input: RegisterNodeProfileInput): Promise<NodeProfile> {
    const validation = await this.nodeProfileValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.nodeProfileRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Node profile already exists with name: ${input.name.trim()}`);
    }

    const nodeProfile = createNodeProfile({
      nodeProfileId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.nodeProfileRepository.save(nodeProfile);
    await this.nodeProfileCatalog.register(nodeProfile);
    return nodeProfile;
  }

  async getNodeProfile(nodeProfileId: string): Promise<NodeProfile | null> {
    return this.nodeProfileRepository.findById(nodeProfileId.trim());
  }

  async listNodeProfiles(): Promise<ListNodeProfilesResult> {
    const nodeProfiles = Object.freeze(
      [...(await this.nodeProfileRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ nodeProfiles, total: nodeProfiles.length });
  }

  async updateNodeProfile(input: UpdateNodeProfileInput): Promise<NodeProfile> {
    const nodeProfileId = input.nodeProfileId.trim();
    const existing = await this.nodeProfileRepository.findById(nodeProfileId);
    if (!existing) {
      throw new Error(`Node profile not found: ${nodeProfileId}`);
    }

    const validation = await this.nodeProfileValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.nodeProfileRepository.findByName(input.name.trim());
      if (duplicate && duplicate.nodeProfileId !== existing.nodeProfileId) {
        throw new Error(`Node profile already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createNodeProfile({
      nodeProfileId: existing.nodeProfileId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.nodeProfileRepository.save(updated);
    await this.nodeProfileCatalog.register(updated);
    return updated;
  }

  async deleteNodeProfile(nodeProfileId: string): Promise<DeleteNodeProfileResult> {
    const normalizedNodeProfileId = nodeProfileId.trim();
    const deleted = await this.nodeProfileRepository.delete(normalizedNodeProfileId);
    if (deleted) {
      await this.nodeProfileCatalog.remove(normalizedNodeProfileId);
    }
    return Object.freeze({ nodeProfileId: normalizedNodeProfileId, deleted });
  }

  async findNodeProfileByName(name: string): Promise<FindNodeProfileByNameResult> {
    const normalizedName = name.trim();
    const nodeProfile = await this.nodeProfileRepository.findByName(normalizedName);
    return Object.freeze({ nodeProfile });
  }

  async listNodeProfilesByCategory(category: string): Promise<ListNodeProfilesByCategoryResult> {
    const normalizedCategory = category.trim();
    const nodeProfiles = Object.freeze(
      [...(await this.nodeProfileRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      nodeProfiles,
      total: nodeProfiles.length,
      category: normalizedCategory,
    });
  }

  async getNodeProfileRegistryStatistics(): Promise<NodeProfileRegistryStatistics> {
    const nodeProfiles = await this.nodeProfileRepository.findAll();
    const activeNodeProfiles = nodeProfiles.filter(
      (nodeProfile) => nodeProfile.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(nodeProfiles.map((nodeProfile) => nodeProfile.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalNodeProfiles: nodeProfiles.length,
      activeNodeProfiles,
      categories,
    });
  }

  async serializeNodeProfile(nodeProfile: NodeProfile): Promise<string> {
    return this.nodeProfileSerializer.serialize(nodeProfile);
  }

  async deserializeNodeProfile(serialized: string): Promise<NodeProfile> {
    return this.nodeProfileSerializer.deserialize(serialized);
  }
}
