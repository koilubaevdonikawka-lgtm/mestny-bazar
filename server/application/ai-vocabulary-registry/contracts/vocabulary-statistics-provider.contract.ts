import type { VocabularyRegistryStatistics } from "@server/application/ai-vocabulary-registry/models/vocabulary.model";

export interface IVocabularyStatisticsProvider {
  getStatistics(input: {
    totalVocabularies: number;
    activeVocabularies: number;
    categories: readonly string[];
  }): Promise<VocabularyRegistryStatistics>;
}
