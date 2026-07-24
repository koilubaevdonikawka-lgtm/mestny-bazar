import type {
  DeleteVocabularyResult,
  FindVocabularyByNameResult,
  ListVocabulariesByCategoryResult,
  ListVocabulariesResult,
  RegisterVocabularyInput,
  Vocabulary,
  VocabularyRegistryStatistics,
  UpdateVocabularyInput,
} from "@server/application/ai-vocabulary-registry/models/vocabulary.model";
import type { AiVocabularyRegistryService } from "@server/application/ai-vocabulary-registry/services/ai-vocabulary-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterVocabularyUseCase {
  constructor(private readonly vocabularyRegistry: AiVocabularyRegistryService) {}

  execute(input: RegisterVocabularyInput): Promise<UseCaseResult<Vocabulary>> {
    return this.vocabularyRegistry.registerVocabulary(input).then(useCaseResult);
  }
}

export class GetVocabularyUseCase {
  constructor(private readonly vocabularyRegistry: AiVocabularyRegistryService) {}

  execute(vocabularyId: string): Promise<UseCaseResult<Vocabulary | null>> {
    return this.vocabularyRegistry.getVocabulary(vocabularyId).then(useCaseResult);
  }
}

export class ListVocabulariesUseCase {
  constructor(private readonly vocabularyRegistry: AiVocabularyRegistryService) {}

  execute(): Promise<UseCaseResult<ListVocabulariesResult>> {
    return this.vocabularyRegistry.listVocabularies().then(useCaseResult);
  }
}

export class UpdateVocabularyUseCase {
  constructor(private readonly vocabularyRegistry: AiVocabularyRegistryService) {}

  execute(input: UpdateVocabularyInput): Promise<UseCaseResult<Vocabulary>> {
    return this.vocabularyRegistry.updateVocabulary(input).then(useCaseResult);
  }
}

export class DeleteVocabularyUseCase {
  constructor(private readonly vocabularyRegistry: AiVocabularyRegistryService) {}

  execute(vocabularyId: string): Promise<UseCaseResult<DeleteVocabularyResult>> {
    return this.vocabularyRegistry.deleteVocabulary(vocabularyId).then(useCaseResult);
  }
}

export class FindVocabularyByNameUseCase {
  constructor(private readonly vocabularyRegistry: AiVocabularyRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindVocabularyByNameResult>> {
    return this.vocabularyRegistry.findVocabularyByName(name).then(useCaseResult);
  }
}

export class ListVocabulariesByCategoryUseCase {
  constructor(private readonly vocabularyRegistry: AiVocabularyRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListVocabulariesByCategoryResult>> {
    return this.vocabularyRegistry.listVocabulariesByCategory(category).then(useCaseResult);
  }
}

export class GetVocabularyRegistryStatisticsUseCase {
  constructor(private readonly vocabularyRegistry: AiVocabularyRegistryService) {}

  execute(): Promise<UseCaseResult<VocabularyRegistryStatistics>> {
    return this.vocabularyRegistry.getVocabularyRegistryStatistics().then(useCaseResult);
  }
}
