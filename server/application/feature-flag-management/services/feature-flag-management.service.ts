/**
 * Feature Flag Management — flag registration and retrieval only.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IFeatureFlagAuditProvider } from "@server/application/feature-flag-management/contracts/feature-flag-audit-provider.contract";
import type { IFeatureFlagEvaluator } from "@server/application/feature-flag-management/contracts/feature-flag-evaluator.contract";
import type { IFeatureFlagProvider } from "@server/application/feature-flag-management/contracts/feature-flag-provider.contract";
import type { IFeatureFlagRepository } from "@server/application/feature-flag-management/contracts/feature-flag-repository.contract";
import type { IFeatureFlagValidator } from "@server/application/feature-flag-management/contracts/feature-flag-validator.contract";
import {
  createFeatureFlag,
  toFeatureFlagStatus,
  type FeatureFlag,
  type FeatureFlagStatus,
  type ListFeatureFlagsResult,
  type RegisterFeatureFlagInput,
  type UpdateFeatureFlagInput,
} from "@server/application/feature-flag-management/models/feature-flag.model";
import type { IIdGenerator } from "@server/application/ports";

export class FeatureFlagManagementService {
  constructor(
    private readonly flagRepository: IFeatureFlagRepository,
    private readonly flagEvaluator: IFeatureFlagEvaluator,
    private readonly flagValidator: IFeatureFlagValidator,
    private readonly flagProvider: IFeatureFlagProvider,
    private readonly auditProvider: IFeatureFlagAuditProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerFeatureFlag(input: RegisterFeatureFlagInput): Promise<FeatureFlag> {
    const key = input.key.trim();
    this.flagValidator.validateRegistration(input);

    if (await this.flagRepository.findByKey(key)) {
      throw new Error(`Feature flag already exists: ${key}`);
    }

    const flag = createFeatureFlag({
      flagId: this.idGenerator.generate(),
      key,
      name: input.name,
      description: input.description,
      enabled: input.enabled,
      tags: input.tags,
    });

    await this.flagRepository.save(flag);
    await this.auditProvider.recordChange("register", flag);
    return flag;
  }

  async getFeatureFlag(key: string): Promise<FeatureFlag | null> {
    return this.flagProvider.getFlag(key.trim());
  }

  async enableFeatureFlag(key: string): Promise<FeatureFlag> {
    return this.setEnabled(key, true);
  }

  async disableFeatureFlag(key: string): Promise<FeatureFlag> {
    return this.setEnabled(key, false);
  }

  async updateFeatureFlag(input: UpdateFeatureFlagInput): Promise<FeatureFlag> {
    const normalizedKey = input.key.trim();
    const existing = await this.flagRepository.findByKey(normalizedKey);
    if (!existing) {
      throw new Error(`Feature flag not found: ${normalizedKey}`);
    }

    this.flagValidator.validateUpdate(existing, input);

    const updated = createFeatureFlag({
      flagId: existing.flagId,
      key: existing.key,
      name: input.name ?? existing.name,
      description: input.description ?? existing.description,
      enabled: existing.enabled,
      tags: input.tags ?? existing.tags,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.flagRepository.save(updated);
    await this.auditProvider.recordChange("update", updated);
    return updated;
  }

  async deleteFeatureFlag(key: string): Promise<{ key: string; deleted: boolean }> {
    const normalizedKey = key.trim();
    const existing = await this.flagRepository.findByKey(normalizedKey);
    if (!existing) {
      throw new Error(`Feature flag not found: ${normalizedKey}`);
    }

    await this.flagRepository.delete(normalizedKey);
    await this.auditProvider.recordChange("delete", existing);
    return Object.freeze({ key: normalizedKey, deleted: true });
  }

  async listFeatureFlags(): Promise<ListFeatureFlagsResult> {
    const flags = Object.freeze(
      [...(await this.flagProvider.getAllFlags())].sort((left, right) =>
        left.key.localeCompare(right.key),
      ),
    );

    return Object.freeze({
      flags,
      total: flags.length,
    });
  }

  async getFeatureFlagStatus(key: string): Promise<FeatureFlagStatus> {
    const flag = await this.flagRepository.findByKey(key.trim());
    if (!flag) {
      throw new Error(`Feature flag not found: ${key.trim()}`);
    }

    return toFeatureFlagStatus({
      ...flag,
      enabled: this.flagEvaluator.evaluate(flag),
    });
  }

  private async setEnabled(key: string, enabled: boolean): Promise<FeatureFlag> {
    const normalizedKey = key.trim();
    this.flagValidator.validateKey(normalizedKey);

    const existing = await this.flagRepository.findByKey(normalizedKey);
    if (!existing) {
      throw new Error(`Feature flag not found: ${normalizedKey}`);
    }

    const updated = createFeatureFlag({
      ...existing,
      enabled,
      updatedAt: new Date().toISOString(),
    });

    await this.flagRepository.save(updated);
    await this.auditProvider.recordChange(enabled ? "enable" : "disable", updated);
    return updated;
  }
}
