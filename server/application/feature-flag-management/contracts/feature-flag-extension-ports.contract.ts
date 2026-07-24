/**
 * Future integration ports for Feature Flag Management.
 * Not implemented — reserved for external feature flag services.
 */

import type { FeatureFlag } from "@server/application/feature-flag-management/models/feature-flag.model";

/** LaunchDarkly Provider — LaunchDarkly integration. */
export interface ILaunchDarklyProvider {
  getFlag(key: string): Promise<FeatureFlag | null>;
  syncFlag(flag: FeatureFlag): Promise<void>;
}

/** Unleash Provider — Unleash integration. */
export interface IUnleashProvider {
  isEnabled(key: string): Promise<boolean>;
  registerToggle(flag: FeatureFlag): Promise<void>;
}

/** Azure Feature Manager Provider — Azure integration. */
export interface IAzureFeatureManagerProvider {
  isEnabled(key: string): Promise<boolean>;
  updateFeatureFlag(flag: FeatureFlag): Promise<void>;
}

/** Firebase Remote Config Provider — Firebase integration. */
export interface IFirebaseRemoteConfigProvider {
  fetchConfig(key: string): Promise<FeatureFlag | null>;
  publishConfig(flag: FeatureFlag): Promise<void>;
}

/** Feature Targeting Provider — user/segment targeting. */
export interface IFeatureTargetingProvider {
  evaluateForContext(key: string, context: Readonly<Record<string, string>>): Promise<boolean>;
}
