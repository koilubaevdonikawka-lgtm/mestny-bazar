/**
 * AI Action Registry — unified registry for AI actions.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IActionCatalog } from "@server/application/ai-action-registry/contracts/action-catalog.contract";
import type { IActionRepository } from "@server/application/ai-action-registry/contracts/action-repository.contract";
import type { IActionSerializer } from "@server/application/ai-action-registry/contracts/action-serializer.contract";
import type { IActionStatisticsProvider } from "@server/application/ai-action-registry/contracts/action-statistics-provider.contract";
import type { IActionValidator } from "@server/application/ai-action-registry/contracts/action-validator.contract";
import {
  createAction,
  type DeleteActionResult,
  type FindActionByNameResult,
  type ListActionsByCategoryResult,
  type ListActionsResult,
  type RegisterActionInput,
  type Action,
  type ActionRegistryStatistics,
  type UpdateActionInput,
} from "@server/application/ai-action-registry/models/action.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiActionRegistryService {
  constructor(
    private readonly actionRepository: IActionRepository,
    private readonly actionCatalog: IActionCatalog,
    private readonly actionValidator: IActionValidator,
    private readonly actionSerializer: IActionSerializer,
    private readonly statisticsProvider: IActionStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerAction(input: RegisterActionInput): Promise<Action> {
    const validation = await this.actionValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.actionRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Action already exists with name: ${input.name.trim()}`);
    }

    const action = createAction({
      actionId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.actionRepository.save(action);
    await this.actionCatalog.register(action);
    return action;
  }

  async getAction(actionId: string): Promise<Action | null> {
    return this.actionRepository.findById(actionId.trim());
  }

  async listActions(): Promise<ListActionsResult> {
    const actions = Object.freeze(
      [...(await this.actionRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ actions, total: actions.length });
  }

  async updateAction(input: UpdateActionInput): Promise<Action> {
    const actionId = input.actionId.trim();
    const existing = await this.actionRepository.findById(actionId);
    if (!existing) {
      throw new Error(`Action not found: ${actionId}`);
    }

    const validation = await this.actionValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.actionRepository.findByName(input.name.trim());
      if (duplicate && duplicate.actionId !== existing.actionId) {
        throw new Error(`Action already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createAction({
      actionId: existing.actionId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.actionRepository.save(updated);
    await this.actionCatalog.register(updated);
    return updated;
  }

  async deleteAction(actionId: string): Promise<DeleteActionResult> {
    const normalizedActionId = actionId.trim();
    const deleted = await this.actionRepository.delete(normalizedActionId);
    if (deleted) {
      await this.actionCatalog.remove(normalizedActionId);
    }
    return Object.freeze({ actionId: normalizedActionId, deleted });
  }

  async findActionByName(name: string): Promise<FindActionByNameResult> {
    const normalizedName = name.trim();
    const action = await this.actionRepository.findByName(normalizedName);
    return Object.freeze({ action });
  }

  async listActionsByCategory(category: string): Promise<ListActionsByCategoryResult> {
    const normalizedCategory = category.trim();
    const actions = Object.freeze(
      [...(await this.actionRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      actions,
      total: actions.length,
      category: normalizedCategory,
    });
  }

  async getActionRegistryStatistics(): Promise<ActionRegistryStatistics> {
    const actions = await this.actionRepository.findAll();
    const activeActions = actions.filter((action) => action.status === "active").length;
    const categories = Object.freeze([
      ...new Set(actions.map((action) => action.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalActions: actions.length,
      activeActions,
      categories,
    });
  }

  async serializeAction(action: Action): Promise<string> {
    return this.actionSerializer.serialize(action);
  }

  async deserializeAction(serialized: string): Promise<Action> {
    return this.actionSerializer.deserialize(serialized);
  }
}
