import type { ApplicationCommand } from "@server/application/shared";
import type { CreateCategoryDto } from "@server/application/dto";

export class CreateCategoryCommand implements ApplicationCommand {
  readonly commandName = "CreateCategoryCommand" as const;

  private constructor(
    readonly categoryId: string,
    readonly dto: CreateCategoryDto,
  ) {}

  static create(categoryId: string, dto: CreateCategoryDto): CreateCategoryCommand {
    return new CreateCategoryCommand(categoryId, dto);
  }
}
