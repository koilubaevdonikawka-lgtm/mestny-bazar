import type { IScheduleParser } from "@server/application/scheduling-management/contracts/schedule-parser.contract";
import type { IScheduledTaskRepository } from "@server/application/scheduling-management/contracts/scheduled-task-repository.contract";
import type { ISchedulerEngine } from "@server/application/scheduling-management/contracts/scheduler-engine.contract";
import type { ISchedulingHistoryRepository } from "@server/application/scheduling-management/contracts/scheduling-history-repository.contract";
import type { ITaskExecutor } from "@server/application/scheduling-management/contracts/task-executor.contract";
import {
  DeleteScheduledTaskUseCase,
  GetExecutionHistoryUseCase,
  GetScheduledTaskUseCase,
  ListScheduledTasksUseCase,
  PauseScheduledTaskUseCase,
  RegisterScheduledTaskUseCase,
  ResumeScheduledTaskUseCase,
  RunScheduledTaskUseCase,
  SchedulingManagementApplicationService,
  SchedulingManagementService,
} from "@server/application/scheduling-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CronScheduleParser } from "@server/infrastructure/scheduling-management/cron-schedule.parser";
import { DefaultTaskExecutor } from "@server/infrastructure/scheduling-management/default-task.executor";
import { InMemorySchedulerEngine } from "@server/infrastructure/scheduling-management/in-memory-scheduler.engine";
import { ScheduledTaskRepository } from "@server/infrastructure/scheduling-management/scheduled-task.repository";
import { SchedulingHistoryRepository } from "@server/infrastructure/scheduling-management/scheduling-history.repository";

/** Registers scheduling management services and use cases. */
export function registerSchedulingManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.SchedulingManagementTaskRepository, () =>
    new ScheduledTaskRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.SchedulingManagementHistoryRepository, () =>
    new SchedulingHistoryRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.SchedulingManagementSchedulerEngine, () =>
    new InMemorySchedulerEngine(),
  );

  registry.registerSingleton(InfrastructureTokens.SchedulingManagementTaskExecutor, () =>
    new DefaultTaskExecutor(),
  );

  registry.registerSingleton(InfrastructureTokens.SchedulingManagementScheduleParser, () =>
    new CronScheduleParser(),
  );

  registry.registerTransient(InfrastructureTokens.SchedulingManagementService, (provider) =>
    new SchedulingManagementService(
      provider.resolve<IScheduledTaskRepository>(
        InfrastructureTokens.SchedulingManagementTaskRepository,
      ),
      provider.resolve<ISchedulerEngine>(InfrastructureTokens.SchedulingManagementSchedulerEngine),
      provider.resolve<ITaskExecutor>(InfrastructureTokens.SchedulingManagementTaskExecutor),
      provider.resolve<IScheduleParser>(InfrastructureTokens.SchedulingManagementScheduleParser),
      provider.resolve<ISchedulingHistoryRepository>(
        InfrastructureTokens.SchedulingManagementHistoryRepository,
      ),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.SchedulingManagementRegisterScheduledTaskUseCase,
    (provider) =>
      new RegisterScheduledTaskUseCase(
        provider.resolve<SchedulingManagementService>(
          InfrastructureTokens.SchedulingManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.SchedulingManagementDeleteScheduledTaskUseCase,
    (provider) =>
      new DeleteScheduledTaskUseCase(
        provider.resolve<SchedulingManagementService>(
          InfrastructureTokens.SchedulingManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.SchedulingManagementGetScheduledTaskUseCase,
    (provider) =>
      new GetScheduledTaskUseCase(
        provider.resolve<SchedulingManagementService>(
          InfrastructureTokens.SchedulingManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.SchedulingManagementListScheduledTasksUseCase,
    (provider) =>
      new ListScheduledTasksUseCase(
        provider.resolve<SchedulingManagementService>(
          InfrastructureTokens.SchedulingManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.SchedulingManagementRunScheduledTaskUseCase,
    (provider) =>
      new RunScheduledTaskUseCase(
        provider.resolve<SchedulingManagementService>(
          InfrastructureTokens.SchedulingManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.SchedulingManagementPauseScheduledTaskUseCase,
    (provider) =>
      new PauseScheduledTaskUseCase(
        provider.resolve<SchedulingManagementService>(
          InfrastructureTokens.SchedulingManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.SchedulingManagementResumeScheduledTaskUseCase,
    (provider) =>
      new ResumeScheduledTaskUseCase(
        provider.resolve<SchedulingManagementService>(
          InfrastructureTokens.SchedulingManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.SchedulingManagementGetExecutionHistoryUseCase,
    (provider) =>
      new GetExecutionHistoryUseCase(
        provider.resolve<SchedulingManagementService>(
          InfrastructureTokens.SchedulingManagementService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.SchedulingManagementApplicationService,
    (provider) =>
      new SchedulingManagementApplicationService(
        provider.resolve<RegisterScheduledTaskUseCase>(
          InfrastructureTokens.SchedulingManagementRegisterScheduledTaskUseCase,
        ),
        provider.resolve<DeleteScheduledTaskUseCase>(
          InfrastructureTokens.SchedulingManagementDeleteScheduledTaskUseCase,
        ),
        provider.resolve<GetScheduledTaskUseCase>(
          InfrastructureTokens.SchedulingManagementGetScheduledTaskUseCase,
        ),
        provider.resolve<ListScheduledTasksUseCase>(
          InfrastructureTokens.SchedulingManagementListScheduledTasksUseCase,
        ),
        provider.resolve<RunScheduledTaskUseCase>(
          InfrastructureTokens.SchedulingManagementRunScheduledTaskUseCase,
        ),
        provider.resolve<PauseScheduledTaskUseCase>(
          InfrastructureTokens.SchedulingManagementPauseScheduledTaskUseCase,
        ),
        provider.resolve<ResumeScheduledTaskUseCase>(
          InfrastructureTokens.SchedulingManagementResumeScheduledTaskUseCase,
        ),
        provider.resolve<GetExecutionHistoryUseCase>(
          InfrastructureTokens.SchedulingManagementGetExecutionHistoryUseCase,
        ),
      ),
  );
}
