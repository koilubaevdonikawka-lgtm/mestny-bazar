import type { TargetingContext } from "@server/platform/features/features/models";

/** Contract for targeting context resolution (metadata only). */
export interface ITargetingEngine {
  buildContext(overrides?: Partial<TargetingContext>): TargetingContext;
  matchesEnvironment(context: TargetingContext, environment: string): boolean;
  matchesPlatform(context: TargetingContext, platform: string): boolean;
  matchesProvider(context: TargetingContext, providerId: string): boolean;
  matchesSdkClient(context: TargetingContext, clientId: string): boolean;
  matchesApiVersion(context: TargetingContext, version: string): boolean;
}
