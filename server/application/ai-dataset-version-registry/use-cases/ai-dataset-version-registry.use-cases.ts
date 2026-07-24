import type {
  DeleteDatasetVersionResult,
  FindDatasetVersionByNameResult,
  ListDatasetVersionsByCategoryResult,
  ListDatasetVersionsResult,
  RegisterDatasetVersionInput,
  DatasetVersion,
  DatasetVersionRegistryStatistics,
  UpdateDatasetVersionInput,
} from "@server/application/ai-dataset-version-registry/models/dataset-version.model";
import type { AiDatasetVersionRegistryService } from "@server/application/ai-dataset-version-registry/services/ai-dataset-version-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterDatasetVersionUseCase {
  constructor(private readonly datasetVersionRegistry: AiDatasetVersionRegistryService) {}

  execute(input: RegisterDatasetVersionInput): Promise<UseCaseResult<DatasetVersion>> {
    return this.datasetVersionRegistry.registerDatasetVersion(input).then(useCaseResult);
  }
}

export class GetDatasetVersionUseCase {
  constructor(private readonly datasetVersionRegistry: AiDatasetVersionRegistryService) {}

  execute(datasetVersionId: string): Promise<UseCaseResult<DatasetVersion | null>> {
    return this.datasetVersionRegistry.getDatasetVersion(datasetVersionId).then(useCaseResult);
  }
}

export class ListDatasetVersionsUseCase {
  constructor(private readonly datasetVersionRegistry: AiDatasetVersionRegistryService) {}

  execute(): Promise<UseCaseResult<ListDatasetVersionsResult>> {
    return this.datasetVersionRegistry.listDatasetVersions().then(useCaseResult);
  }
}

export class UpdateDatasetVersionUseCase {
  constructor(private readonly datasetVersionRegistry: AiDatasetVersionRegistryService) {}

  execute(input: UpdateDatasetVersionInput): Promise<UseCaseResult<DatasetVersion>> {
    return this.datasetVersionRegistry.updateDatasetVersion(input).then(useCaseResult);
  }
}

export class DeleteDatasetVersionUseCase {
  constructor(private readonly datasetVersionRegistry: AiDatasetVersionRegistryService) {}

  execute(datasetVersionId: string): Promise<UseCaseResult<DeleteDatasetVersionResult>> {
    return this.datasetVersionRegistry.deleteDatasetVersion(datasetVersionId).then(useCaseResult);
  }
}

export class FindDatasetVersionByNameUseCase {
  constructor(private readonly datasetVersionRegistry: AiDatasetVersionRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindDatasetVersionByNameResult>> {
    return this.datasetVersionRegistry.findDatasetVersionByName(name).then(useCaseResult);
  }
}

export class ListDatasetVersionsByCategoryUseCase {
  constructor(private readonly datasetVersionRegistry: AiDatasetVersionRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListDatasetVersionsByCategoryResult>> {
    return this.datasetVersionRegistry.listDatasetVersionsByCategory(category).then(useCaseResult);
  }
}

export class GetDatasetVersionRegistryStatisticsUseCase {
  constructor(private readonly datasetVersionRegistry: AiDatasetVersionRegistryService) {}

  execute(): Promise<UseCaseResult<DatasetVersionRegistryStatistics>> {
    return this.datasetVersionRegistry.getDatasetVersionRegistryStatistics().then(useCaseResult);
  }
}
