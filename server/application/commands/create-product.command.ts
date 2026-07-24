import type { ApplicationCommand } from "@server/application/shared";
import type { CreateProductDto } from "@server/application/dto";

export class CreateProductCommand implements ApplicationCommand {
  readonly commandName = "CreateProductCommand" as const;

  private constructor(
    readonly productId: string,
    readonly dto: CreateProductDto,
  ) {}

  static create(productId: string, dto: CreateProductDto): CreateProductCommand {
    return new CreateProductCommand(productId, dto);
  }
}
