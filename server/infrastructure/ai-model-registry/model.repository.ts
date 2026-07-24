import type { IModelRepository } from "@server/application/ai-model-registry/contracts/model-repository.contract";
import type { Model } from "@server/application/ai-model-registry/models/model.model";

/** In-memory model store. */
export class ModelRepository implements IModelRepository {
  private readonly models = new Map<string, Model>();
  private readonly modelsByName = new Map<string, string>();
  private readonly modelsByProvider = new Map<string, Set<string>>();

  async save(model: Model): Promise<void> {
    const existing = this.models.get(model.modelId);
    if (existing) {
      if (existing.name !== model.name) {
        this.modelsByName.delete(existing.name);
      }
      if (existing.provider !== model.provider) {
        this.removeFromProvider(existing.provider, existing.modelId);
      }
    }

    this.models.set(model.modelId, model);
    this.modelsByName.set(model.name, model.modelId);
    this.addToProvider(model.provider, model.modelId);
  }

  async findById(modelId: string): Promise<Model | null> {
    return this.models.get(modelId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Model | null> {
    const modelId = this.modelsByName.get(name.trim());
    if (!modelId) {
      return null;
    }
    return this.models.get(modelId) ?? null;
  }

  async findByProvider(provider: string): Promise<readonly Model[]> {
    const modelIds = this.modelsByProvider.get(provider.trim());
    if (!modelIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...modelIds]
        .map((modelId) => this.models.get(modelId))
        .filter((model): model is Model => model !== undefined),
    );
  }

  async findAll(): Promise<readonly Model[]> {
    return Object.freeze([...this.models.values()]);
  }

  async delete(modelId: string): Promise<boolean> {
    const model = await this.findById(modelId);
    if (!model) {
      return false;
    }
    this.models.delete(model.modelId);
    this.modelsByName.delete(model.name);
    this.removeFromProvider(model.provider, model.modelId);
    return true;
  }

  private addToProvider(provider: string, modelId: string): void {
    const normalizedProvider = provider.trim();
    const providerSet = this.modelsByProvider.get(normalizedProvider) ?? new Set<string>();
    providerSet.add(modelId);
    this.modelsByProvider.set(normalizedProvider, providerSet);
  }

  private removeFromProvider(provider: string, modelId: string): void {
    const normalizedProvider = provider.trim();
    const providerSet = this.modelsByProvider.get(normalizedProvider);
    if (!providerSet) {
      return;
    }
    providerSet.delete(modelId);
    if (providerSet.size === 0) {
      this.modelsByProvider.delete(normalizedProvider);
    }
  }
}
