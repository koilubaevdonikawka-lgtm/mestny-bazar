import type { ApplicationCommand } from "@server/application/shared";
import type { RegisterSellerDto } from "@server/application/dto";

export class RegisterSellerCommand implements ApplicationCommand {
  readonly commandName = "RegisterSellerCommand" as const;

  private constructor(
    readonly sellerId: string,
    readonly dto: RegisterSellerDto,
  ) {}

  static create(sellerId: string, dto: RegisterSellerDto): RegisterSellerCommand {
    return new RegisterSellerCommand(sellerId, dto);
  }
}
