export interface IConfigurationSerializer {
  serialize(value: unknown): string;
  deserialize(payload: string): unknown;
}
