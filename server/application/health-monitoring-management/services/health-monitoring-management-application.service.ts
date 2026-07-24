import type { RegisterHealthCheckInput } from "@server/application/health-monitoring-management/models/health-monitoring.model";
import {
  GetComponentHealthUseCase,
  GetHealthHistoryUseCase,
  GetSystemHealthUseCase,
  ListHealthChecksUseCase,
  RegisterHealthCheckUseCase,
  RemoveHealthCheckUseCase,
  RunAllHealthChecksUseCase,
  RunHealthCheckUseCase,
} from "@server/application/health-monitoring-management/use-cases/health-monitoring-management.use-cases";

/** Application facade for health monitoring management scenario. */
export class HealthMonitoringManagementApplicationService {
  constructor(
    private readonly registerHealthCheckUseCase: RegisterHealthCheckUseCase,
    private readonly removeHealthCheckUseCase: RemoveHealthCheckUseCase,
    private readonly runHealthCheckUseCase: RunHealthCheckUseCase,
    private readonly runAllHealthChecksUseCase: RunAllHealthChecksUseCase,
    private readonly getComponentHealthUseCase: GetComponentHealthUseCase,
    private readonly getSystemHealthUseCase: GetSystemHealthUseCase,
    private readonly getHealthHistoryUseCase: GetHealthHistoryUseCase,
    private readonly listHealthChecksUseCase: ListHealthChecksUseCase,
  ) {}

  registerCheck(input: RegisterHealthCheckInput) {
    return this.registerHealthCheckUseCase.execute(input);
  }

  removeCheck(checkId: string) {
    return this.removeHealthCheckUseCase.execute(checkId);
  }

  runCheck(checkId: string) {
    return this.runHealthCheckUseCase.execute(checkId);
  }

  runAllChecks() {
    return this.runAllHealthChecksUseCase.execute();
  }

  getComponentHealth(componentId: string) {
    return this.getComponentHealthUseCase.execute(componentId);
  }

  getSystemHealth() {
    return this.getSystemHealthUseCase.execute();
  }

  getHealthHistory(checkId?: string, componentId?: string) {
    return this.getHealthHistoryUseCase.execute(checkId, componentId);
  }

  listChecks() {
    return this.listHealthChecksUseCase.execute();
  }
}
