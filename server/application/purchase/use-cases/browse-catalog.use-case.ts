import type { SearchModule } from "@server/application/modules/search/search/api/search.module";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import type { BrowseCatalogInput, BrowseCatalogResult } from "@server/application/purchase/dto";

/** Browse marketplace catalog via Search BCM. */
export class BrowseCatalogUseCase {
  constructor(private readonly search: SearchModule) {}

  async execute(input: BrowseCatalogInput = {}): Promise<UseCaseResult<BrowseCatalogResult>> {
    const result = await this.search.products(input);
    return useCaseResult(result);
  }
}
