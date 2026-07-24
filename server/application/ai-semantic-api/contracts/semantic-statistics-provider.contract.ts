import type { SemanticApiStatistics } from "@server/application/ai-semantic-api/models/semantic-endpoint.model";

export interface ISemanticStatisticsProvider {
  recordRequest(): Promise<void>;
  getStatistics(input: {
    totalEndpoints: number;
    activeEndpoints: number;
  }): Promise<SemanticApiStatistics>;
}
