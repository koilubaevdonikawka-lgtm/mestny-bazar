import type { ISemanticStatisticsProvider } from "@server/application/ai-semantic-api/contracts/semantic-statistics-provider.contract";
import type { SemanticApiStatistics } from "@server/application/ai-semantic-api/models/semantic-endpoint.model";

/** Default in-memory semantic API statistics provider. */
export class DefaultSemanticStatisticsProvider implements ISemanticStatisticsProvider {
  private totalRequests = 0;

  async recordRequest(): Promise<void> {
    this.totalRequests += 1;
  }

  async getStatistics(input: {
    totalEndpoints: number;
    activeEndpoints: number;
  }): Promise<SemanticApiStatistics> {
    return Object.freeze({
      totalEndpoints: input.totalEndpoints,
      activeEndpoints: input.activeEndpoints,
      totalRequests: this.totalRequests,
    });
  }
}
