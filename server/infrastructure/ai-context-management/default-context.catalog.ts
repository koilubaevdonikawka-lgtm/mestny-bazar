import type { IContextCatalog } from "@server/application/ai-context-management/contracts/context-catalog.contract";
import type { Context } from "@server/application/ai-context-management/models/context.model";

/** Default in-memory context catalog index. */
export class DefaultContextCatalog implements IContextCatalog {
  private readonly contexts = new Map<string, Context>();
  private readonly contextsByName = new Map<string, string>();
  private readonly contextsByCategory = new Map<string, Set<string>>();

  async register(context: Context): Promise<void> {
    const existing = this.contexts.get(context.contextId);
    if (existing) {
      if (existing.name !== context.name) {
        this.contextsByName.delete(existing.name);
      }
      if (existing.category !== context.category) {
        this.removeFromCategory(existing.category, existing.contextId);
      }
    }

    this.contexts.set(context.contextId, context);
    this.contextsByName.set(context.name, context.contextId);
    this.addToCategory(context.category, context.contextId);
  }

  async remove(contextId: string): Promise<void> {
    const context = this.contexts.get(contextId.trim());
    if (!context) {
      return;
    }
    this.contexts.delete(context.contextId);
    this.contextsByName.delete(context.name);
    this.removeFromCategory(context.category, context.contextId);
  }

  async findById(contextId: string): Promise<Context | null> {
    return this.contexts.get(contextId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Context | null> {
    const contextId = this.contextsByName.get(name.trim());
    if (!contextId) {
      return null;
    }
    return this.contexts.get(contextId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Context[]> {
    const contextIds = this.contextsByCategory.get(category.trim());
    if (!contextIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...contextIds]
        .map((contextId) => this.contexts.get(contextId))
        .filter((context): context is Context => context !== undefined),
    );
  }

  async listAll(): Promise<readonly Context[]> {
    return Object.freeze([...this.contexts.values()]);
  }

  private addToCategory(category: string, contextId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.contextsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(contextId);
    this.contextsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, contextId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.contextsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(contextId);
    if (categorySet.size === 0) {
      this.contextsByCategory.delete(normalizedCategory);
    }
  }
}
