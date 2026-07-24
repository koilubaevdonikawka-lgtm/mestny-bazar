export interface NotificationTemplate {
  readonly subject: string;
  readonly body: string;
}

export interface INotificationTemplateProvider {
  hasTemplate(templateKey: string): Promise<boolean>;
  render(templateKey: string, variables?: Record<string, string>): Promise<NotificationTemplate>;
}
