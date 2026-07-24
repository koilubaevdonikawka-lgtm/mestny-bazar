import type {
  RegisterConstraintInput,
  UpdateConstraintInput,
} from "@server/application/ai-constraint-registry/models/constraint.model";
import {
  DeleteConstraintUseCase,
  FindConstraintByNameUseCase,
  GetConstraintRegistryStatisticsUseCase,
  GetConstraintUseCase,
  ListConstraintsByCategoryUseCase,
  ListConstraintsUseCase,
  RegisterConstraintUseCase,
  UpdateConstraintUseCase,
} from "@server/application/ai-constraint-registry/use-cases/ai-constraint-registry.use-cases";

/** Application facade for AI Constraint Registry scenario. */
export class AiConstraintRegistryApplicationService {
  constructor(
    private readonly registerConstraintUseCase: RegisterConstraintUseCase,
    private readonly getConstraintUseCase: GetConstraintUseCase,
    private readonly listConstraintsUseCase: ListConstraintsUseCase,
    private readonly updateConstraintUseCase: UpdateConstraintUseCase,
    private readonly deleteConstraintUseCase: DeleteConstraintUseCase,
    private readonly findConstraintByNameUseCase: FindConstraintByNameUseCase,
    private readonly listConstraintsByCategoryUseCase: ListConstraintsByCategoryUseCase,
    private readonly getConstraintRegistryStatisticsUseCase: GetConstraintRegistryStatisticsUseCase,
  ) {}

  registerConstraint(input: RegisterConstraintInput) {
    return this.registerConstraintUseCase.execute(input);
  }

  getConstraint(constraintId: string) {
    return this.getConstraintUseCase.execute(constraintId);
  }

  listConstraints() {
    return this.listConstraintsUseCase.execute();
  }

  updateConstraint(input: UpdateConstraintInput) {
    return this.updateConstraintUseCase.execute(input);
  }

  deleteConstraint(constraintId: string) {
    return this.deleteConstraintUseCase.execute(constraintId);
  }

  findConstraintByName(name: string) {
    return this.findConstraintByNameUseCase.execute(name);
  }

  listConstraintsByCategory(category: string) {
    return this.listConstraintsByCategoryUseCase.execute(category);
  }

  getConstraintRegistryStatistics() {
    return this.getConstraintRegistryStatisticsUseCase.execute();
  }
}
