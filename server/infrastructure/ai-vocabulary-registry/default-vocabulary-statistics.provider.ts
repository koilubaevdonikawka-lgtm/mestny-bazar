import type { IVocabularyStatisticsProvider } from "@server/application/ai-vocabulary-registry/contracts/vocabulary-statistics-provider.contract";
import type { VocabularyRegistryStatistics } from "@server/application/ai-vocabulary-registry/models/vocabulary.model";

/** Default in-memory vocabulary statistics provider. */
export class DefaultVocabularyStatisticsProvider implements IVocabularyStatisticsProvider {
  async getStatistics(input: {
    totalVocabularies: number;
    activeVocabularies: number;
    categories: readonly string[];
  }): Promise<VocabularyRegistryStatistics> {
    return Object.freeze({
      totalVocabularies: input.totalVocabularies,
      activeVocabularies: input.activeVocabularies,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
