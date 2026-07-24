import type {
  DeleteModelResult,
  FindModelByNameResult,
  ListModelsByProviderResult,
  ListModelsResult,
  Model,
  ModelRegistryStatistics,
  RegisterModelInput,
  UpdateModelInput,
} from "@server/application/ai-model-registry/models/model.model";
import type { AiModelRegistryService } from "@server/application/ai-model-registry/services/ai-model-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterModelUseCase {
  constructor(private readonly modelRegistry: AiModelRegistryService) {}

  execute(input: RegisterModelInput): Promise<UseCaseResult<Model>> {
    return this.modelRegistry.registerModel(input).then(useCaseResult);
  }
}

export class GetModelUseCase {
  constructor(private readonly modelRegistry: AiModelRegistryService) {}

  execute(modelId: string): Promise<UseCaseResult<Model | null>> {
    return this.modelRegistry.getModel(modelId).then(useCaseResult);
  }
}

export class ListModelsUseCase {
  constructor(private readonly modelRegistry: AiModelRegistryService) {}

  execute(): Promise<UseCaseResult<ListModelsResult>> {
    return this.modelRegistry.listModels().then(useCaseResult);
  }
}

export class UpdateModelUseCase {
  constructor(private readonly modelRegistry: AiModelRegistryService) {}

  execute(input: UpdateModelInput): Promise<UseCaseResult<Model>> {
    return this.modelRegistry.updateModel(input).then(useCaseResult);
  }
}

export class DeleteModelUseCase {
  constructor(private readonly modelRegistry: AiModelRegistryService) {}

  execute(modelId: string): Promise<UseCaseResult<DeleteModelResult>> {
    return this.modelRegistry.deleteModel(modelId).then(useCaseResult);
  }
}

export class FindModelByNameUseCase {
  constructor(private readonly modelRegistry: AiModelRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindModelByNameResult>> {
    return this.modelRegistry.findModelByName(name).then(useCaseResult);
  }
}

export class ListModelsByProviderUseCase {
  constructor(private readonly modelRegistry: AiModelRegistryService) {}

  execute(provider: string): Promise<UseCaseResult<ListModelsByProviderResult>> {
    return this.modelRegistry.listModelsByProvider(provider).then(useCaseResult);
  }
}

export class GetModelRegistryStatisticsUseCase {
  constructor(private readonly modelRegistry: AiModelRegistryService) {}

  execute(): Promise<UseCaseResult<ModelRegistryStatistics>> {
    return this.modelRegistry.getModelRegistryStatistics().then(useCaseResult);
  }
}
