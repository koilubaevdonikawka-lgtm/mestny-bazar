import type {
  RegisterDatasetInput,
  UpdateDatasetInput,
} from "@server/application/ai-dataset-registry/models/dataset.model";
import {
  DeleteDatasetUseCase,
  FindDatasetByNameUseCase,
  GetDatasetRegistryStatisticsUseCase,
  GetDatasetUseCase,
  ListDatasetsByCategoryUseCase,
  ListDatasetsUseCase,
  RegisterDatasetUseCase,
  UpdateDatasetUseCase,
} from "@server/application/ai-dataset-registry/use-cases/ai-dataset-registry.use-cases";

/** Application facade for AI Dataset Registry scenario. */
export class AiDatasetRegistryApplicationService {
  constructor(
    private readonly registerDatasetUseCase: RegisterDatasetUseCase,
    private readonly getDatasetUseCase: GetDatasetUseCase,
    private readonly listDatasetsUseCase: ListDatasetsUseCase,
    private readonly updateDatasetUseCase: UpdateDatasetUseCase,
    private readonly deleteDatasetUseCase: DeleteDatasetUseCase,
    private readonly findDatasetByNameUseCase: FindDatasetByNameUseCase,
    private readonly listDatasetsByCategoryUseCase: ListDatasetsByCategoryUseCase,
    private readonly getDatasetRegistryStatisticsUseCase: GetDatasetRegistryStatisticsUseCase,
  ) {}

  registerDataset(input: RegisterDatasetInput) {
    return this.registerDatasetUseCase.execute(input);
  }

  getDataset(datasetId: string) {
    return this.getDatasetUseCase.execute(datasetId);
  }

  listDatasets() {
    return this.listDatasetsUseCase.execute();
  }

  updateDataset(input: UpdateDatasetInput) {
    return this.updateDatasetUseCase.execute(input);
  }

  deleteDataset(datasetId: string) {
    return this.deleteDatasetUseCase.execute(datasetId);
  }

  findDatasetByName(name: string) {
    return this.findDatasetByNameUseCase.execute(name);
  }

  listDatasetsByCategory(category: string) {
    return this.listDatasetsByCategoryUseCase.execute(category);
  }

  getDatasetRegistryStatistics() {
    return this.getDatasetRegistryStatisticsUseCase.execute();
  }
}
