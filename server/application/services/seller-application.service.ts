import type { RegisterSellerDto } from "@server/application/dto";
import { RegisterSellerCommand } from "@server/application/commands";
import { GetSellerQuery } from "@server/application/queries";
import type { IIdGenerator } from "@server/application/ports";
import {
  RegisterSellerUseCase,
  GetSellerUseCase,
} from "@server/application/use-cases";
import type { SellerReadModel } from "@server/domain/seller";

/** Seller application facade — orchestrates use cases without domain logic. */
export class SellerApplicationService {
  constructor(
    private readonly registerSellerUseCase: RegisterSellerUseCase,
    private readonly getSellerUseCase: GetSellerUseCase,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerSeller(dto: RegisterSellerDto): Promise<SellerReadModel> {
    const sellerId = this.idGenerator.generate();
    const command = RegisterSellerCommand.create(sellerId, dto);
    const result = await this.registerSellerUseCase.execute(command);
    return result.value;
  }

  async getSeller(sellerId: string): Promise<SellerReadModel | null> {
    const query = GetSellerQuery.create(sellerId);
    const result = await this.getSellerUseCase.execute(query);
    return result.value;
  }
}
