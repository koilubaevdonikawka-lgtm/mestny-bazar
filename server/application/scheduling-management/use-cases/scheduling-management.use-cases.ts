import type {
  ExecutionHistoryResult,
  ListScheduledTasksResult,
  RegisterScheduledTaskInput,
  RunScheduledTaskResult,
  ScheduledTask,
  ScheduledTaskActionResult,
} from "@server/application/scheduling-management/models/scheduling.model";
import type { SchedulingManagementService } from "@server/application/scheduling-management/services/scheduling-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterScheduledTaskUseCase {
  constructor(private readonly scheduling: SchedulingManagementService) {}

  execute(input: RegisterScheduledTaskInput): Promise<UseCaseResult<ScheduledTask>> {
    return this.scheduling.registerTask(input).then(useCaseResult);
  }
}

export class DeleteScheduledTaskUseCase {
  constructor(private readonly scheduling: SchedulingManagementService) {}

  execute(taskId: string): Promise<UseCaseResult<{ taskId: string; deleted: boolean }>> {
    return this.scheduling.deleteTask(taskId).then(useCaseResult);
  }
}

export class GetScheduledTaskUseCase {
  constructor(private readonly scheduling: SchedulingManagementService) {}

  async execute(taskId: string): Promise<UseCaseResult<ScheduledTask | null>> {
    return useCaseResult(await this.scheduling.getTask(taskId));
  }
}

export class ListScheduledTasksUseCase {
  constructor(private readonly scheduling: SchedulingManagementService) {}

  execute(): Promise<UseCaseResult<ListScheduledTasksResult>> {
    return this.scheduling.listTasks().then(useCaseResult);
  }
}

export class RunScheduledTaskUseCase {
  constructor(private readonly scheduling: SchedulingManagementService) {}

  execute(taskId: string): Promise<UseCaseResult<RunScheduledTaskResult>> {
    return this.scheduling.runTask(taskId).then(useCaseResult);
  }
}

export class PauseScheduledTaskUseCase {
  constructor(private readonly scheduling: SchedulingManagementService) {}

  execute(taskId: string): Promise<UseCaseResult<ScheduledTaskActionResult>> {
    return this.scheduling.pauseTask(taskId).then(useCaseResult);
  }
}

export class ResumeScheduledTaskUseCase {
  constructor(private readonly scheduling: SchedulingManagementService) {}

  execute(taskId: string): Promise<UseCaseResult<ScheduledTaskActionResult>> {
    return this.scheduling.resumeTask(taskId).then(useCaseResult);
  }
}

export class GetExecutionHistoryUseCase {
  constructor(private readonly scheduling: SchedulingManagementService) {}

  execute(taskId?: string): Promise<UseCaseResult<ExecutionHistoryResult>> {
    return this.scheduling.getExecutionHistory(taskId).then(useCaseResult);
  }
}
