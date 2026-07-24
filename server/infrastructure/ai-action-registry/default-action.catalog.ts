import type { IActionCatalog } from "@server/application/ai-action-registry/contracts/action-catalog.contract";
import type { Action } from "@server/application/ai-action-registry/models/action.model";

/** Default in-memory action catalog index. */
export class DefaultActionCatalog implements IActionCatalog {
  private readonly actions = new Map<string, Action>();
  private readonly actionsByName = new Map<string, string>();
  private readonly actionsByCategory = new Map<string, Set<string>>();

  async register(action: Action): Promise<void> {
    const existing = this.actions.get(action.actionId);
    if (existing) {
      if (existing.name !== action.name) {
        this.actionsByName.delete(existing.name);
      }
      if (existing.category !== action.category) {
        this.removeFromCategory(existing.category, existing.actionId);
      }
    }

    this.actions.set(action.actionId, action);
    this.actionsByName.set(action.name, action.actionId);
    this.addToCategory(action.category, action.actionId);
  }

  async remove(actionId: string): Promise<void> {
    const action = this.actions.get(actionId.trim());
    if (!action) {
      return;
    }
    this.actions.delete(action.actionId);
    this.actionsByName.delete(action.name);
    this.removeFromCategory(action.category, action.actionId);
  }

  async findById(actionId: string): Promise<Action | null> {
    return this.actions.get(actionId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Action | null> {
    const actionId = this.actionsByName.get(name.trim());
    if (!actionId) {
      return null;
    }
    return this.actions.get(actionId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Action[]> {
    const actionIds = this.actionsByCategory.get(category.trim());
    if (!actionIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...actionIds]
        .map((actionId) => this.actions.get(actionId))
        .filter((action): action is Action => action !== undefined),
    );
  }

  async listAll(): Promise<readonly Action[]> {
    return Object.freeze([...this.actions.values()]);
  }

  private addToCategory(category: string, actionId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.actionsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(actionId);
    this.actionsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, actionId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.actionsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(actionId);
    if (categorySet.size === 0) {
      this.actionsByCategory.delete(normalizedCategory);
    }
  }
}
