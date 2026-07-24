import type { ApplicationQuery } from "@server/application/shared";

export class GetCatalogQuery implements ApplicationQuery {
  readonly queryName = "GetCatalogQuery" as const;

  private constructor(readonly catalogId: string) {}

  static create(catalogId: string): GetCatalogQuery {
    return new GetCatalogQuery(catalogId);
  }
}
