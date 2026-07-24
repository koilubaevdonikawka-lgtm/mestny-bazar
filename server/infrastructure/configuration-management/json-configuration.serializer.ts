import type { IConfigurationSerializer } from "@server/application/configuration-management/contracts/configuration-serializer.contract";

/** JSON serializer for configuration values. */
export class JsonConfigurationSerializer implements IConfigurationSerializer {
  serialize(value: unknown): string {
    return JSON.stringify(value ?? null);
  }

  deserialize(payload: string): unknown {
    return JSON.parse(payload) as unknown;
  }
}
