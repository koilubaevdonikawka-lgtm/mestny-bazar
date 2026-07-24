import type { ApplicationQuery } from "@server/application/shared";

export class GetSellerQuery implements ApplicationQuery {
  readonly queryName = "GetSellerQuery" as const;

  private constructor(readonly sellerId: string) {}

  static create(sellerId: string): GetSellerQuery {
    return new GetSellerQuery(sellerId);
  }
}
