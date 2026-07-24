import type { GetCatalogQuery } from "@server/application/queries";
import type { ICatalogRepository } from "@server/application/ports";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import type { CatalogReadModel } from "@server/domain/catalog";

export class GetCatalogUseCase {
  constructor(private readonly catalogs: ICatalogRepository) {}

  async execute(query: GetCatalogQuery): Promise<UseCaseResult<CatalogReadModel | null>> {
    const snapshot = await this.catalogs.findSnapshotById(query.catalogId);
    return useCaseResult(snapshot);
  }
}
