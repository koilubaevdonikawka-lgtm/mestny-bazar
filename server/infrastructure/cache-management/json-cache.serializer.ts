import type { ICacheSerializer } from "@server/application/cache-management/contracts/cache-serializer.contract";

/** JSON-based cache value serializer. */
export class JsonCacheSerializer implements ICacheSerializer {
  serialize(value: unknown): string {
    return JSON.stringify(value);
  }

  deserialize(payload: string): unknown {
    return JSON.parse(payload) as unknown;
  }
}
