import type { IFeatureRegistry } from "@server/platform/features/features/contracts";
import {
  createFeatureDescriptor,
  type FeatureCategory,
  type FeatureDescriptor,
} from "@server/platform/features/features/models";
import { createFeatureRegisteredEvent } from "@server/platform/features/features/events";

/** Central registry for platform feature metadata. */
export class FeatureRegistry implements IFeatureRegistry {
  private readonly features = new Map<string, FeatureDescriptor>();

  register(feature: FeatureDescriptor): FeatureDescriptor {
    const stored = createFeatureDescriptor(feature);
    this.features.set(stored.id, stored);
    createFeatureRegisteredEvent(stored);
    return stored;
  }

  get(featureId: string): FeatureDescriptor | undefined {
    return this.features.get(featureId.trim());
  }

  update(feature: FeatureDescriptor): FeatureDescriptor {
    const stored = createFeatureDescriptor({
      ...feature,
      updatedAt: new Date().toISOString(),
    });
    this.features.set(stored.id, stored);
    return stored;
  }

  list(category?: FeatureCategory): readonly FeatureDescriptor[] {
    const values = [...this.features.values()];
    const filtered = category ? values.filter((feature) => feature.category === category) : values;
    return Object.freeze([...filtered]);
  }

  listByCategory(category: FeatureCategory): readonly FeatureDescriptor[] {
    return this.list(category);
  }
}
