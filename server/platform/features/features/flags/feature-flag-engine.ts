import type { IFeatureFlagEngine } from "@server/platform/features/features/contracts";
import {
  createFeatureFlag,
  type FeatureFlag,
  type TargetingContext,
} from "@server/platform/features/features/models";
import type { ITargetingEngine } from "@server/platform/features/features/contracts";

/** Evaluates feature flags using targeting metadata (no side effects). */
export class FeatureFlagEngine implements IFeatureFlagEngine {
  private readonly flags = new Map<string, FeatureFlag>();

  constructor(private readonly targetingEngine: ITargetingEngine) {}

  registerFlag(flag: FeatureFlag): FeatureFlag {
    const stored = createFeatureFlag(flag);
    this.flags.set(stored.id, stored);
    return stored;
  }

  listFlags(featureId?: string): readonly FeatureFlag[] {
    const values = [...this.flags.values()];
    const filtered = featureId
      ? values.filter((flag) => flag.featureId === featureId.trim())
      : values;
    return Object.freeze([...filtered]);
  }

  evaluateFlag(flag: FeatureFlag, context: TargetingContext): boolean {
    if (!flag.enabled) {
      return false;
    }

    switch (flag.kind) {
      case "boolean":
        return Boolean(flag.value);
      case "percentage": {
        const threshold = typeof flag.value === "number" ? flag.value : Number(flag.value);
        const hash = this.hashContext(context, flag.featureId);
        return hash < threshold;
      }
      case "environment": {
        const environment = String(flag.value);
        return this.targetingEngine.matchesEnvironment(context, environment);
      }
      case "provider": {
        const providerId = String(flag.value);
        return this.targetingEngine.matchesProvider(context, providerId);
      }
      case "platform": {
        const platform = String(flag.value);
        return this.targetingEngine.matchesPlatform(context, platform);
      }
      default:
        return false;
    }
  }

  private hashContext(context: TargetingContext, seed: string): number {
    const raw = `${seed}:${context.environment}:${context.platform}`;
    let hash = 0;
    for (let index = 0; index < raw.length; index += 1) {
      hash = (hash * 31 + raw.charCodeAt(index)) % 100;
    }
    return hash;
  }
}
