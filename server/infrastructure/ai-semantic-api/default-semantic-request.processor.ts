import type { ISemanticRequestProcessor } from "@server/application/ai-semantic-api/contracts/semantic-request-processor.contract";
import type {
  HandleSemanticRequestInput,
  SemanticEndpoint,
} from "@server/application/ai-semantic-api/models/semantic-endpoint.model";

/** Default mock semantic request processor — no external services. */
export class DefaultSemanticRequestProcessor implements ISemanticRequestProcessor {
  async process(
    input: HandleSemanticRequestInput,
    endpoint: SemanticEndpoint | null,
  ): Promise<{ response: unknown; mock: boolean }> {
    if (!endpoint) {
      return Object.freeze({
        response: Object.freeze({
          message: "Mock semantic request processed without endpoint binding.",
          intent: input.intent ?? null,
          payload: input.payload ?? null,
        }),
        mock: true,
      });
    }

    return Object.freeze({
      response: Object.freeze({
        message: `Mock semantic response from endpoint: ${endpoint.name}`,
        endpointId: endpoint.endpointId,
        path: endpoint.path,
        schema: endpoint.schema,
        intent: input.intent ?? null,
        payload: input.payload ?? null,
        transformed: true,
      }),
      mock: true,
    });
  }
}
