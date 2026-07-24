/**
 * Future integration ports for Workflow Orchestration.
 * Not implemented — reserved for saga, compensation, and external orchestrators.
 */

/** Saga coordinator for distributed transactions. */
export interface IWorkflowSagaCoordinator {
  beginSaga(sagaType: string, payload: Record<string, string>): Promise<string>;
  compensate(sagaId: string, reason?: string): Promise<void>;
}

/** Workflow state persistence for long-running processes. */
export interface IWorkflowStateStore {
  saveState(workflowId: string, state: Record<string, unknown>): Promise<void>;
  loadState(workflowId: string): Promise<Record<string, unknown> | null>;
}

/** External BPM engine integration. */
export interface IWorkflowBpmEngine {
  startProcess(processKey: string, variables: Record<string, string>): Promise<string>;
  signal(processInstanceId: string, signalName: string): Promise<void>;
}
