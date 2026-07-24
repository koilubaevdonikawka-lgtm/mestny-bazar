import type {
  RegisterModelInput,
  UpdateModelInput,
} from "@server/application/ai-model-registry/models/model.model";
import {
  DeleteModelUseCase,
  FindModelByNameUseCase,
  GetModelRegistryStatisticsUseCase,
  GetModelUseCase,
  ListModelsByProviderUseCase,
  ListModelsUseCase,
  RegisterModelUseCase,
  UpdateModelUseCase,
} from "@server/application/ai-model-registry/use-cases/ai-model-registry.use-cases";

/** Application facade for AI Model Registry scenario. */
export class AiModelRegistryApplicationService {
  constructor(
    private readonly registerModelUseCase: RegisterModelUseCase,
    private readonly getModelUseCase: GetModelUseCase,
    private readonly listModelsUseCase: ListModelsUseCase,
    private readonly updateModelUseCase: UpdateModelUseCase,
    private readonly deleteModelUseCase: DeleteModelUseCase,
    private readonly findModelByNameUseCase: FindModelByNameUseCase,
    private readonly listModelsByProviderUseCase: ListModelsByProviderUseCase,
    private readonly getModelRegistryStatisticsUseCase: GetModelRegistryStatisticsUseCase,
  ) {}

  registerModel(input: RegisterModelInput) {
    return this.registerModelUseCase.execute(input);
  }

  getModel(modelId: string) {
    return this.getModelUseCase.execute(modelId);
  }

  listModels() {
    return this.listModelsUseCase.execute();
  }

  updateModel(input: UpdateModelInput) {
    return this.updateModelUseCase.execute(input);
  }

  deleteModel(modelId: string) {
    return this.deleteModelUseCase.execute(modelId);
  }

  findModelByName(name: string) {
    return this.findModelByNameUseCase.execute(name);
  }

  listModelsByProvider(provider: string) {
    return this.listModelsByProviderUseCase.execute(provider);
  }

  getModelRegistryStatistics() {
    return this.getModelRegistryStatisticsUseCase.execute();
  }
}
