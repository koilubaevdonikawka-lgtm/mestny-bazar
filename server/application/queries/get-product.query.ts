import type { ApplicationQuery } from "@server/application/shared";

export class GetProductQuery implements ApplicationQuery {
  readonly queryName = "GetProductQuery" as const;

  private constructor(readonly productId: string) {}

  static create(productId: string): GetProductQuery {
    return new GetProductQuery(productId);
  }
}
