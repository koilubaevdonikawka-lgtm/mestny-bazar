import type {
  DeleteActionResult,
  FindActionByNameResult,
  ListActionsByCategoryResult,
  ListActionsResult,
  RegisterActionInput,
  Action,
  ActionRegistryStatistics,
  UpdateActionInput,
} from "@server/application/ai-action-registry/models/action.model";
import type { AiActionRegistryService } from "@server/application/ai-action-registry/services/ai-action-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterActionUseCase {
  constructor(private readonly actionRegistry: AiActionRegistryService) {}

  execute(input: RegisterActionInput): Promise<UseCaseResult<Action>> {
    return this.actionRegistry.registerAction(input).then(useCaseResult);
  }
}

export class GetActionUseCase {
  constructor(private readonly actionRegistry: AiActionRegistryService) {}

  execute(actionId: string): Promise<UseCaseResult<Action | null>> {
    return this.actionRegistry.getAction(actionId).then(useCaseResult);
  }
}

export class ListActionsUseCase {
  constructor(private readonly actionRegistry: AiActionRegistryService) {}

  execute(): Promise<UseCaseResult<ListActionsResult>> {
    return this.actionRegistry.listActions().then(useCaseResult);
  }
}

export class UpdateActionUseCase {
  constructor(private readonly actionRegistry: AiActionRegistryService) {}

  execute(input: UpdateActionInput): Promise<UseCaseResult<Action>> {
    return this.actionRegistry.updateAction(input).then(useCaseResult);
  }
}

export class DeleteActionUseCase {
  constructor(private readonly actionRegistry: AiActionRegistryService) {}

  execute(actionId: string): Promise<UseCaseResult<DeleteActionResult>> {
    return this.actionRegistry.deleteAction(actionId).then(useCaseResult);
  }
}

export class FindActionByNameUseCase {
  constructor(private readonly actionRegistry: AiActionRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindActionByNameResult>> {
    return this.actionRegistry.findActionByName(name).then(useCaseResult);
  }
}

export class ListActionsByCategoryUseCase {
  constructor(private readonly actionRegistry: AiActionRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListActionsByCategoryResult>> {
    return this.actionRegistry.listActionsByCategory(category).then(useCaseResult);
  }
}

export class GetActionRegistryStatisticsUseCase {
  constructor(private readonly actionRegistry: AiActionRegistryService) {}

  execute(): Promise<UseCaseResult<ActionRegistryStatistics>> {
    return this.actionRegistry.getActionRegistryStatistics().then(useCaseResult);
  }
}
