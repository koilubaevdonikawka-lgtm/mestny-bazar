import type {
  INotificationTemplateProvider,
  NotificationTemplate,
} from "@server/application/notification-management/contracts/notification-template-provider.contract";

const DEFAULT_TEMPLATES: Readonly<Record<string, NotificationTemplate>> = Object.freeze({
  "order.created": Object.freeze({
    subject: "Order Created",
    body: "Your order {{orderId}} has been created.",
  }),
  "order.confirmed": Object.freeze({
    subject: "Order Confirmed",
    body: "Your order {{orderId}} has been confirmed.",
  }),
  "payment.succeeded": Object.freeze({
    subject: "Payment Successful",
    body: "Payment for order {{orderId}} was successful.",
  }),
  "delivery.assigned": Object.freeze({
    subject: "Courier Assigned",
    body: "A courier has been assigned to your delivery {{deliveryId}}.",
  }),
  "generic.message": Object.freeze({
    subject: "Notification",
    body: "{{message}}",
  }),
});

/** Default in-memory notification templates. */
export class DefaultNotificationTemplateProvider implements INotificationTemplateProvider {
  async hasTemplate(templateKey: string): Promise<boolean> {
    return templateKey.trim() in DEFAULT_TEMPLATES;
  }

  async render(
    templateKey: string,
    variables: Record<string, string> = {},
  ): Promise<NotificationTemplate> {
    const template = DEFAULT_TEMPLATES[templateKey.trim()];
    if (!template) {
      throw new Error(`Template not found: ${templateKey}`);
    }

    return Object.freeze({
      subject: interpolate(template.subject, variables),
      body: interpolate(template.body, variables),
    });
  }
}

function interpolate(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? `{{${key}}}`);
}
