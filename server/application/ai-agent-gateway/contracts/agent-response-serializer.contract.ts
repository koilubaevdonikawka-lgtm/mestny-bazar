export interface IAgentResponseSerializer {
  serialize(response: unknown): string;
  deserialize(payload: string): unknown;
}
