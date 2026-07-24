import type {
  RegisterActionInput,
  UpdateActionInput,
} from "@server/application/ai-action-registry/models/action.model";
import {
  DeleteActionUseCase,
  FindActionByNameUseCase,
  GetActionRegistryStatisticsUseCase,
  GetActionUseCase,
  ListActionsByCategoryUseCase,
  ListActionsUseCase,
  RegisterActionUseCase,
  UpdateActionUseCase,
} from "@server/application/ai-action-registry/use-cases/ai-action-registry.use-cases";

/** Application facade for AI Action Registry scenario. */
export class AiActionRegistryApplicationService {
  constructor(
    private readonly registerActionUseCase: RegisterActionUseCase,
    private readonly getActionUseCase: GetActionUseCase,
    private readonly listActionsUseCase: ListActionsUseCase,
    private readonly updateActionUseCase: UpdateActionUseCase,
    private readonly deleteActionUseCase: DeleteActionUseCase,
    private readonly findActionByNameUseCase: FindActionByNameUseCase,
    private readonly listActionsByCategoryUseCase: ListActionsByCategoryUseCase,
    private readonly getActionRegistryStatisticsUseCase: GetActionRegistryStatisticsUseCase,
  ) {}

  registerAction(input: RegisterActionInput) {
    return this.registerActionUseCase.execute(input);
  }

  getAction(actionId: string) {
    return this.getActionUseCase.execute(actionId);
  }

  listActions() {
    return this.listActionsUseCase.execute();
  }

  updateAction(input: UpdateActionInput) {
    return this.updateActionUseCase.execute(input);
  }

  deleteAction(actionId: string) {
    return this.deleteActionUseCase.execute(actionId);
  }

  findActionByName(name: string) {
    return this.findActionByNameUseCase.execute(name);
  }

  listActionsByCategory(category: string) {
    return this.listActionsByCategoryUseCase.execute(category);
  }

  getActionRegistryStatistics() {
    return this.getActionRegistryStatisticsUseCase.execute();
  }
}
