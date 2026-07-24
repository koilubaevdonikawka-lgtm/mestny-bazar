import type {
  RegisterVocabularyInput,
  UpdateVocabularyInput,
} from "@server/application/ai-vocabulary-registry/models/vocabulary.model";
import {
  DeleteVocabularyUseCase,
  FindVocabularyByNameUseCase,
  GetVocabularyRegistryStatisticsUseCase,
  GetVocabularyUseCase,
  ListVocabulariesByCategoryUseCase,
  ListVocabulariesUseCase,
  RegisterVocabularyUseCase,
  UpdateVocabularyUseCase,
} from "@server/application/ai-vocabulary-registry/use-cases/ai-vocabulary-registry.use-cases";

/** Application facade for AI Vocabulary Registry scenario. */
export class AiVocabularyRegistryApplicationService {
  constructor(
    private readonly registerVocabularyUseCase: RegisterVocabularyUseCase,
    private readonly getVocabularyUseCase: GetVocabularyUseCase,
    private readonly listVocabulariesUseCase: ListVocabulariesUseCase,
    private readonly updateVocabularyUseCase: UpdateVocabularyUseCase,
    private readonly deleteVocabularyUseCase: DeleteVocabularyUseCase,
    private readonly findVocabularyByNameUseCase: FindVocabularyByNameUseCase,
    private readonly listVocabulariesByCategoryUseCase: ListVocabulariesByCategoryUseCase,
    private readonly getVocabularyRegistryStatisticsUseCase: GetVocabularyRegistryStatisticsUseCase,
  ) {}

  registerVocabulary(input: RegisterVocabularyInput) {
    return this.registerVocabularyUseCase.execute(input);
  }

  getVocabulary(vocabularyId: string) {
    return this.getVocabularyUseCase.execute(vocabularyId);
  }

  listVocabularies() {
    return this.listVocabulariesUseCase.execute();
  }

  updateVocabulary(input: UpdateVocabularyInput) {
    return this.updateVocabularyUseCase.execute(input);
  }

  deleteVocabulary(vocabularyId: string) {
    return this.deleteVocabularyUseCase.execute(vocabularyId);
  }

  findVocabularyByName(name: string) {
    return this.findVocabularyByNameUseCase.execute(name);
  }

  listVocabulariesByCategory(category: string) {
    return this.listVocabulariesByCategoryUseCase.execute(category);
  }

  getVocabularyRegistryStatistics() {
    return this.getVocabularyRegistryStatisticsUseCase.execute();
  }
}
