import type { ApplicationCommand } from "@server/application/shared";
import type { CreateOrderDto } from "@server/application/dto";

export class CreateOrderCommand implements ApplicationCommand {
  readonly commandName = "CreateOrderCommand" as const;

  private constructor(
    readonly orderId: string,
    readonly orderNumber: string,
    readonly dto: CreateOrderDto,
  ) {}

  static create(orderId: string, orderNumber: string, dto: CreateOrderDto): CreateOrderCommand {
    return new CreateOrderCommand(orderId, orderNumber, dto);
  }
}
