import type {
  ComponentHealthResult,
  HealthCheckDefinition,
  HealthCheckResult,
  HealthHistoryResult,
  ListHealthChecksResult,
  RegisterHealthCheckInput,
  SystemHealthResult,
} from "@server/application/health-monitoring-management/models/health-monitoring.model";
import type { HealthMonitoringManagementService } from "@server/application/health-monitoring-management/services/health-monitoring-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterHealthCheckUseCase {
  constructor(private readonly health: HealthMonitoringManagementService) {}

  execute(input: RegisterHealthCheckInput): Promise<UseCaseResult<HealthCheckDefinition>> {
    return this.health.registerCheck(input).then(useCaseResult);
  }
}

export class RemoveHealthCheckUseCase {
  constructor(private readonly health: HealthMonitoringManagementService) {}

  execute(checkId: string): Promise<UseCaseResult<{ checkId: string; removed: boolean }>> {
    return this.health.removeCheck(checkId).then(useCaseResult);
  }
}

export class RunHealthCheckUseCase {
  constructor(private readonly health: HealthMonitoringManagementService) {}

  execute(checkId: string): Promise<UseCaseResult<HealthCheckResult>> {
    return this.health.runCheck(checkId).then(useCaseResult);
  }
}

export class RunAllHealthChecksUseCase {
  constructor(private readonly health: HealthMonitoringManagementService) {}

  execute(): Promise<UseCaseResult<SystemHealthResult>> {
    return this.health.runAllChecks().then(useCaseResult);
  }
}

export class GetComponentHealthUseCase {
  constructor(private readonly health: HealthMonitoringManagementService) {}

  execute(componentId: string): Promise<UseCaseResult<ComponentHealthResult>> {
    return this.health.getComponentHealth(componentId).then(useCaseResult);
  }
}

export class GetSystemHealthUseCase {
  constructor(private readonly health: HealthMonitoringManagementService) {}

  execute(): Promise<UseCaseResult<SystemHealthResult>> {
    return this.health.getSystemHealth().then(useCaseResult);
  }
}

export class GetHealthHistoryUseCase {
  constructor(private readonly health: HealthMonitoringManagementService) {}

  execute(checkId?: string, componentId?: string): Promise<UseCaseResult<HealthHistoryResult>> {
    return this.health.getHealthHistory(checkId, componentId).then(useCaseResult);
  }
}

export class ListHealthChecksUseCase {
  constructor(private readonly health: HealthMonitoringManagementService) {}

  execute(): Promise<UseCaseResult<ListHealthChecksResult>> {
    return this.health.listChecks().then(useCaseResult);
  }
}
