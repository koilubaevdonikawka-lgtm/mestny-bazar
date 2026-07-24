import type {
  RegisterPromptInput,
  UpdatePromptInput,
} from "@server/application/ai-prompt-registry/models/prompt.model";
import {
  DeletePromptUseCase,
  FindPromptByNameUseCase,
  GetPromptRegistryStatisticsUseCase,
  GetPromptUseCase,
  ListPromptsByCategoryUseCase,
  ListPromptsUseCase,
  RegisterPromptUseCase,
  UpdatePromptUseCase,
} from "@server/application/ai-prompt-registry/use-cases/ai-prompt-registry.use-cases";

/** Application facade for AI Prompt Registry scenario. */
export class AiPromptRegistryApplicationService {
  constructor(
    private readonly registerPromptUseCase: RegisterPromptUseCase,
    private readonly getPromptUseCase: GetPromptUseCase,
    private readonly listPromptsUseCase: ListPromptsUseCase,
    private readonly updatePromptUseCase: UpdatePromptUseCase,
    private readonly deletePromptUseCase: DeletePromptUseCase,
    private readonly findPromptByNameUseCase: FindPromptByNameUseCase,
    private readonly listPromptsByCategoryUseCase: ListPromptsByCategoryUseCase,
    private readonly getPromptRegistryStatisticsUseCase: GetPromptRegistryStatisticsUseCase,
  ) {}

  registerPrompt(input: RegisterPromptInput) {
    return this.registerPromptUseCase.execute(input);
  }

  getPrompt(promptId: string) {
    return this.getPromptUseCase.execute(promptId);
  }

  listPrompts() {
    return this.listPromptsUseCase.execute();
  }

  updatePrompt(input: UpdatePromptInput) {
    return this.updatePromptUseCase.execute(input);
  }

  deletePrompt(promptId: string) {
    return this.deletePromptUseCase.execute(promptId);
  }

  findPromptByName(name: string) {
    return this.findPromptByNameUseCase.execute(name);
  }

  listPromptsByCategory(category: string) {
    return this.listPromptsByCategoryUseCase.execute(category);
  }

  getPromptRegistryStatistics() {
    return this.getPromptRegistryStatisticsUseCase.execute();
  }
}
