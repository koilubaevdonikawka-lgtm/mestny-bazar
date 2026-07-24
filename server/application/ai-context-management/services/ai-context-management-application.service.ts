import type {
  CreateContextInput,
  UpdateContextInput,
} from "@server/application/ai-context-management/models/context.model";
import {
  CreateContextUseCase,
  DeleteContextUseCase,
  FindContextByNameUseCase,
  GetContextStatisticsUseCase,
  GetContextUseCase,
  ListContextsByCategoryUseCase,
  ListContextsUseCase,
  UpdateContextUseCase,
} from "@server/application/ai-context-management/use-cases/ai-context-management.use-cases";

/** Application facade for AI Context Management scenario. */
export class AiContextManagementApplicationService {
  constructor(
    private readonly createContextUseCase: CreateContextUseCase,
    private readonly getContextUseCase: GetContextUseCase,
    private readonly listContextsUseCase: ListContextsUseCase,
    private readonly updateContextUseCase: UpdateContextUseCase,
    private readonly deleteContextUseCase: DeleteContextUseCase,
    private readonly findContextByNameUseCase: FindContextByNameUseCase,
    private readonly listContextsByCategoryUseCase: ListContextsByCategoryUseCase,
    private readonly getContextStatisticsUseCase: GetContextStatisticsUseCase,
  ) {}

  createContext(input: CreateContextInput) {
    return this.createContextUseCase.execute(input);
  }

  getContext(contextId: string) {
    return this.getContextUseCase.execute(contextId);
  }

  listContexts() {
    return this.listContextsUseCase.execute();
  }

  updateContext(input: UpdateContextInput) {
    return this.updateContextUseCase.execute(input);
  }

  deleteContext(contextId: string) {
    return this.deleteContextUseCase.execute(contextId);
  }

  findContextByName(name: string) {
    return this.findContextByNameUseCase.execute(name);
  }

  listContextsByCategory(category: string) {
    return this.listContextsByCategoryUseCase.execute(category);
  }

  getContextStatistics() {
    return this.getContextStatisticsUseCase.execute();
  }
}
