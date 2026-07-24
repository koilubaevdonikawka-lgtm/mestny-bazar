/** Notification coordination port for workflow orchestration. */
export interface INotificationWorkflowService {
  notify(
    recipientId: string,
    templateKey: string,
    variables?: Record<string, string>,
  ): Promise<void>;
}
