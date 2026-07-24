import type { ICacheKeyGenerator } from "@server/application/cache-management/contracts/cache-key-generator.contract";

/** Default cache key generator — combines group and identifier. */
export class DefaultCacheKeyGenerator implements ICacheKeyGenerator {
  generate(group: string, identifier: string): string {
    const normalizedGroup = group.trim() || "default";
    const normalizedIdentifier = identifier.trim();
    return `${normalizedGroup}:${normalizedIdentifier}`;
  }
}
