import type {
  DeletePromptResult,
  FindPromptByNameResult,
  ListPromptsByCategoryResult,
  ListPromptsResult,
  Prompt,
  PromptRegistryStatistics,
  RegisterPromptInput,
  UpdatePromptInput,
} from "@server/application/ai-prompt-registry/models/prompt.model";
import type { AiPromptRegistryService } from "@server/application/ai-prompt-registry/services/ai-prompt-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterPromptUseCase {
  constructor(private readonly promptRegistry: AiPromptRegistryService) {}

  execute(input: RegisterPromptInput): Promise<UseCaseResult<Prompt>> {
    return this.promptRegistry.registerPrompt(input).then(useCaseResult);
  }
}

export class GetPromptUseCase {
  constructor(private readonly promptRegistry: AiPromptRegistryService) {}

  execute(promptId: string): Promise<UseCaseResult<Prompt | null>> {
    return this.promptRegistry.getPrompt(promptId).then(useCaseResult);
  }
}

export class ListPromptsUseCase {
  constructor(private readonly promptRegistry: AiPromptRegistryService) {}

  execute(): Promise<UseCaseResult<ListPromptsResult>> {
    return this.promptRegistry.listPrompts().then(useCaseResult);
  }
}

export class UpdatePromptUseCase {
  constructor(private readonly promptRegistry: AiPromptRegistryService) {}

  execute(input: UpdatePromptInput): Promise<UseCaseResult<Prompt>> {
    return this.promptRegistry.updatePrompt(input).then(useCaseResult);
  }
}

export class DeletePromptUseCase {
  constructor(private readonly promptRegistry: AiPromptRegistryService) {}

  execute(promptId: string): Promise<UseCaseResult<DeletePromptResult>> {
    return this.promptRegistry.deletePrompt(promptId).then(useCaseResult);
  }
}

export class FindPromptByNameUseCase {
  constructor(private readonly promptRegistry: AiPromptRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindPromptByNameResult>> {
    return this.promptRegistry.findPromptByName(name).then(useCaseResult);
  }
}

export class ListPromptsByCategoryUseCase {
  constructor(private readonly promptRegistry: AiPromptRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListPromptsByCategoryResult>> {
    return this.promptRegistry.listPromptsByCategory(category).then(useCaseResult);
  }
}

export class GetPromptRegistryStatisticsUseCase {
  constructor(private readonly promptRegistry: AiPromptRegistryService) {}

  execute(): Promise<UseCaseResult<PromptRegistryStatistics>> {
    return this.promptRegistry.getPromptRegistryStatistics().then(useCaseResult);
  }
}
