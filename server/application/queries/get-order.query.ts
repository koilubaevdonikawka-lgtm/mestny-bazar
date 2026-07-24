import type { ApplicationQuery } from "@server/application/shared";

export class GetOrderQuery implements ApplicationQuery {
  readonly queryName = "GetOrderQuery" as const;

  private constructor(readonly orderId: string) {}

  static create(orderId: string): GetOrderQuery {
    return new GetOrderQuery(orderId);
  }
}
