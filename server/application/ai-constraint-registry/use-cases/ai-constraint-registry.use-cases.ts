import type {
  DeleteConstraintResult,
  FindConstraintByNameResult,
  ListConstraintsByCategoryResult,
  ListConstraintsResult,
  RegisterConstraintInput,
  Constraint,
  ConstraintRegistryStatistics,
  UpdateConstraintInput,
} from "@server/application/ai-constraint-registry/models/constraint.model";
import type { AiConstraintRegistryService } from "@server/application/ai-constraint-registry/services/ai-constraint-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterConstraintUseCase {
  constructor(private readonly constraintRegistry: AiConstraintRegistryService) {}

  execute(input: RegisterConstraintInput): Promise<UseCaseResult<Constraint>> {
    return this.constraintRegistry.registerConstraint(input).then(useCaseResult);
  }
}

export class GetConstraintUseCase {
  constructor(private readonly constraintRegistry: AiConstraintRegistryService) {}

  execute(constraintId: string): Promise<UseCaseResult<Constraint | null>> {
    return this.constraintRegistry.getConstraint(constraintId).then(useCaseResult);
  }
}

export class ListConstraintsUseCase {
  constructor(private readonly constraintRegistry: AiConstraintRegistryService) {}

  execute(): Promise<UseCaseResult<ListConstraintsResult>> {
    return this.constraintRegistry.listConstraints().then(useCaseResult);
  }
}

export class UpdateConstraintUseCase {
  constructor(private readonly constraintRegistry: AiConstraintRegistryService) {}

  execute(input: UpdateConstraintInput): Promise<UseCaseResult<Constraint>> {
    return this.constraintRegistry.updateConstraint(input).then(useCaseResult);
  }
}

export class DeleteConstraintUseCase {
  constructor(private readonly constraintRegistry: AiConstraintRegistryService) {}

  execute(constraintId: string): Promise<UseCaseResult<DeleteConstraintResult>> {
    return this.constraintRegistry.deleteConstraint(constraintId).then(useCaseResult);
  }
}

export class FindConstraintByNameUseCase {
  constructor(private readonly constraintRegistry: AiConstraintRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindConstraintByNameResult>> {
    return this.constraintRegistry.findConstraintByName(name).then(useCaseResult);
  }
}

export class ListConstraintsByCategoryUseCase {
  constructor(private readonly constraintRegistry: AiConstraintRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListConstraintsByCategoryResult>> {
    return this.constraintRegistry.listConstraintsByCategory(category).then(useCaseResult);
  }
}

export class GetConstraintRegistryStatisticsUseCase {
  constructor(private readonly constraintRegistry: AiConstraintRegistryService) {}

  execute(): Promise<UseCaseResult<ConstraintRegistryStatistics>> {
    return this.constraintRegistry.getConstraintRegistryStatistics().then(useCaseResult);
  }
}
