import type { RegisterSellerCommand } from "@server/application/commands";
import { DomainEventDispatcher } from "@server/application/events";
import type { ISellerRepository, ITransactionManager } from "@server/application/ports";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import { Seller, type SellerReadModel } from "@server/domain/seller";

export class RegisterSellerUseCase {
  constructor(
    private readonly sellers: ISellerRepository,
    private readonly transactionManager: ITransactionManager,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  async execute(command: RegisterSellerCommand): Promise<UseCaseResult<SellerReadModel>> {
    return this.transactionManager.execute(async () => {
      const seller = Seller.register({
        id: command.sellerId,
        name: command.dto.name,
        phone: command.dto.phone,
        email: command.dto.email,
        address: command.dto.address,
        limits: command.dto.limits,
      });

      await this.sellers.save(seller);
      await this.eventDispatcher.dispatchFrom(seller, "Seller");

      return useCaseResult(seller.snapshot().toJSON());
    });
  }
}
