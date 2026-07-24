import type {
  HandleSemanticRequestInput,
  SemanticEndpoint,
} from "@server/application/ai-semantic-api/models/semantic-endpoint.model";

export interface SemanticRequestProcessingResult {
  readonly response: unknown;
  readonly mock: boolean;
}

export interface ISemanticRequestProcessor {
  process(
    input: HandleSemanticRequestInput,
    endpoint: SemanticEndpoint | null,
  ): Promise<SemanticRequestProcessingResult>;
}
