import type { RegisterScheduledTaskInput } from "@server/application/scheduling-management/models/scheduling.model";
import {
  DeleteScheduledTaskUseCase,
  GetExecutionHistoryUseCase,
  GetScheduledTaskUseCase,
  ListScheduledTasksUseCase,
  PauseScheduledTaskUseCase,
  RegisterScheduledTaskUseCase,
  ResumeScheduledTaskUseCase,
  RunScheduledTaskUseCase,
} from "@server/application/scheduling-management/use-cases/scheduling-management.use-cases";

/** Application facade for scheduling management scenario. */
export class SchedulingManagementApplicationService {
  constructor(
    private readonly registerScheduledTaskUseCase: RegisterScheduledTaskUseCase,
    private readonly deleteScheduledTaskUseCase: DeleteScheduledTaskUseCase,
    private readonly getScheduledTaskUseCase: GetScheduledTaskUseCase,
    private readonly listScheduledTasksUseCase: ListScheduledTasksUseCase,
    private readonly runScheduledTaskUseCase: RunScheduledTaskUseCase,
    private readonly pauseScheduledTaskUseCase: PauseScheduledTaskUseCase,
    private readonly resumeScheduledTaskUseCase: ResumeScheduledTaskUseCase,
    private readonly getExecutionHistoryUseCase: GetExecutionHistoryUseCase,
  ) {}

  registerTask(input: RegisterScheduledTaskInput) {
    return this.registerScheduledTaskUseCase.execute(input);
  }

  deleteTask(taskId: string) {
    return this.deleteScheduledTaskUseCase.execute(taskId);
  }

  getTask(taskId: string) {
    return this.getScheduledTaskUseCase.execute(taskId);
  }

  listTasks() {
    return this.listScheduledTasksUseCase.execute();
  }

  runTask(taskId: string) {
    return this.runScheduledTaskUseCase.execute(taskId);
  }

  pauseTask(taskId: string) {
    return this.pauseScheduledTaskUseCase.execute(taskId);
  }

  resumeTask(taskId: string) {
    return this.resumeScheduledTaskUseCase.execute(taskId);
  }

  getExecutionHistory(taskId?: string) {
    return this.getExecutionHistoryUseCase.execute(taskId);
  }
}
