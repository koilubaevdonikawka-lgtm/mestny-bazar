import type {
  RegisterDatasetVersionInput,
  UpdateDatasetVersionInput,
} from "@server/application/ai-dataset-version-registry/models/dataset-version.model";
import {
  DeleteDatasetVersionUseCase,
  FindDatasetVersionByNameUseCase,
  GetDatasetVersionRegistryStatisticsUseCase,
  GetDatasetVersionUseCase,
  ListDatasetVersionsByCategoryUseCase,
  ListDatasetVersionsUseCase,
  RegisterDatasetVersionUseCase,
  UpdateDatasetVersionUseCase,
} from "@server/application/ai-dataset-version-registry/use-cases/ai-dataset-version-registry.use-cases";

/** Application facade for AI Dataset Version Registry scenario. */
export class AiDatasetVersionRegistryApplicationService {
  constructor(
    private readonly registerDatasetVersionUseCase: RegisterDatasetVersionUseCase,
    private readonly getDatasetVersionUseCase: GetDatasetVersionUseCase,
    private readonly listDatasetVersionsUseCase: ListDatasetVersionsUseCase,
    private readonly updateDatasetVersionUseCase: UpdateDatasetVersionUseCase,
    private readonly deleteDatasetVersionUseCase: DeleteDatasetVersionUseCase,
    private readonly findDatasetVersionByNameUseCase: FindDatasetVersionByNameUseCase,
    private readonly listDatasetVersionsByCategoryUseCase: ListDatasetVersionsByCategoryUseCase,
    private readonly getDatasetVersionRegistryStatisticsUseCase: GetDatasetVersionRegistryStatisticsUseCase,
  ) {}

  registerDatasetVersion(input: RegisterDatasetVersionInput) {
    return this.registerDatasetVersionUseCase.execute(input);
  }

  getDatasetVersion(datasetVersionId: string) {
    return this.getDatasetVersionUseCase.execute(datasetVersionId);
  }

  listDatasetVersions() {
    return this.listDatasetVersionsUseCase.execute();
  }

  updateDatasetVersion(input: UpdateDatasetVersionInput) {
    return this.updateDatasetVersionUseCase.execute(input);
  }

  deleteDatasetVersion(datasetVersionId: string) {
    return this.deleteDatasetVersionUseCase.execute(datasetVersionId);
  }

  findDatasetVersionByName(name: string) {
    return this.findDatasetVersionByNameUseCase.execute(name);
  }

  listDatasetVersionsByCategory(category: string) {
    return this.listDatasetVersionsByCategoryUseCase.execute(category);
  }

  getDatasetVersionRegistryStatistics() {
    return this.getDatasetVersionRegistryStatisticsUseCase.execute();
  }
}
