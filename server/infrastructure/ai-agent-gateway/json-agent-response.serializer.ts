import type { IAgentResponseSerializer } from "@server/application/ai-agent-gateway/contracts/agent-response-serializer.contract";

/** JSON-based agent response serializer. */
export class JsonAgentResponseSerializer implements IAgentResponseSerializer {
  serialize(response: unknown): string {
    return JSON.stringify(response);
  }

  deserialize(payload: string): unknown {
    return JSON.parse(payload) as unknown;
  }
}
