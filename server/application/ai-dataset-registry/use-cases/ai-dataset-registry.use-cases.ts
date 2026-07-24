import type {
  DeleteDatasetResult,
  FindDatasetByNameResult,
  ListDatasetsByCategoryResult,
  ListDatasetsResult,
  RegisterDatasetInput,
  Dataset,
  DatasetRegistryStatistics,
  UpdateDatasetInput,
} from "@server/application/ai-dataset-registry/models/dataset.model";
import type { AiDatasetRegistryService } from "@server/application/ai-dataset-registry/services/ai-dataset-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterDatasetUseCase {
  constructor(private readonly datasetRegistry: AiDatasetRegistryService) {}

  execute(input: RegisterDatasetInput): Promise<UseCaseResult<Dataset>> {
    return this.datasetRegistry.registerDataset(input).then(useCaseResult);
  }
}

export class GetDatasetUseCase {
  constructor(private readonly datasetRegistry: AiDatasetRegistryService) {}

  execute(datasetId: string): Promise<UseCaseResult<Dataset | null>> {
    return this.datasetRegistry.getDataset(datasetId).then(useCaseResult);
  }
}

export class ListDatasetsUseCase {
  constructor(private readonly datasetRegistry: AiDatasetRegistryService) {}

  execute(): Promise<UseCaseResult<ListDatasetsResult>> {
    return this.datasetRegistry.listDatasets().then(useCaseResult);
  }
}

export class UpdateDatasetUseCase {
  constructor(private readonly datasetRegistry: AiDatasetRegistryService) {}

  execute(input: UpdateDatasetInput): Promise<UseCaseResult<Dataset>> {
    return this.datasetRegistry.updateDataset(input).then(useCaseResult);
  }
}

export class DeleteDatasetUseCase {
  constructor(private readonly datasetRegistry: AiDatasetRegistryService) {}

  execute(datasetId: string): Promise<UseCaseResult<DeleteDatasetResult>> {
    return this.datasetRegistry.deleteDataset(datasetId).then(useCaseResult);
  }
}

export class FindDatasetByNameUseCase {
  constructor(private readonly datasetRegistry: AiDatasetRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindDatasetByNameResult>> {
    return this.datasetRegistry.findDatasetByName(name).then(useCaseResult);
  }
}

export class ListDatasetsByCategoryUseCase {
  constructor(private readonly datasetRegistry: AiDatasetRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListDatasetsByCategoryResult>> {
    return this.datasetRegistry.listDatasetsByCategory(category).then(useCaseResult);
  }
}

export class GetDatasetRegistryStatisticsUseCase {
  constructor(private readonly datasetRegistry: AiDatasetRegistryService) {}

  execute(): Promise<UseCaseResult<DatasetRegistryStatistics>> {
    return this.datasetRegistry.getDatasetRegistryStatistics().then(useCaseResult);
  }
}
