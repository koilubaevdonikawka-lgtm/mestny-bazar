import type {
  Context,
  ContextStatistics,
  CreateContextInput,
  DeleteContextResult,
  FindContextByNameResult,
  ListContextsByCategoryResult,
  ListContextsResult,
  UpdateContextInput,
} from "@server/application/ai-context-management/models/context.model";
import type { AiContextManagementService } from "@server/application/ai-context-management/services/ai-context-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class CreateContextUseCase {
  constructor(private readonly contextManagement: AiContextManagementService) {}

  execute(input: CreateContextInput): Promise<UseCaseResult<Context>> {
    return this.contextManagement.createContext(input).then(useCaseResult);
  }
}

export class GetContextUseCase {
  constructor(private readonly contextManagement: AiContextManagementService) {}

  execute(contextId: string): Promise<UseCaseResult<Context | null>> {
    return this.contextManagement.getContext(contextId).then(useCaseResult);
  }
}

export class ListContextsUseCase {
  constructor(private readonly contextManagement: AiContextManagementService) {}

  execute(): Promise<UseCaseResult<ListContextsResult>> {
    return this.contextManagement.listContexts().then(useCaseResult);
  }
}

export class UpdateContextUseCase {
  constructor(private readonly contextManagement: AiContextManagementService) {}

  execute(input: UpdateContextInput): Promise<UseCaseResult<Context>> {
    return this.contextManagement.updateContext(input).then(useCaseResult);
  }
}

export class DeleteContextUseCase {
  constructor(private readonly contextManagement: AiContextManagementService) {}

  execute(contextId: string): Promise<UseCaseResult<DeleteContextResult>> {
    return this.contextManagement.deleteContext(contextId).then(useCaseResult);
  }
}

export class FindContextByNameUseCase {
  constructor(private readonly contextManagement: AiContextManagementService) {}

  execute(name: string): Promise<UseCaseResult<FindContextByNameResult>> {
    return this.contextManagement.findContextByName(name).then(useCaseResult);
  }
}

export class ListContextsByCategoryUseCase {
  constructor(private readonly contextManagement: AiContextManagementService) {}

  execute(category: string): Promise<UseCaseResult<ListContextsByCategoryResult>> {
    return this.contextManagement.listContextsByCategory(category).then(useCaseResult);
  }
}

export class GetContextStatisticsUseCase {
  constructor(private readonly contextManagement: AiContextManagementService) {}

  execute(): Promise<UseCaseResult<ContextStatistics>> {
    return this.contextManagement.getContextStatistics().then(useCaseResult);
  }
}
