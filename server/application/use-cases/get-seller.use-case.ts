import type { GetSellerQuery } from "@server/application/queries";
import type { ISellerRepository } from "@server/application/ports";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import type { SellerReadModel } from "@server/domain/seller";

export class GetSellerUseCase {
  constructor(private readonly sellers: ISellerRepository) {}

  async execute(query: GetSellerQuery): Promise<UseCaseResult<SellerReadModel | null>> {
    const snapshot = await this.sellers.findSnapshotById(query.sellerId);
    return useCaseResult(snapshot);
  }
}
