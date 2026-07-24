import type {
  IPhoneVerificationProvider,
  PhoneVerificationDeliveryInput,
} from "@server/application/customer-management/contracts/phone-verification-provider.contract";
import type { NotificationModule } from "@server/application/modules/notification/notification/api/notification.module";
import {
  createNotificationRecipient,
  NotificationChannel,
  NotificationRecipientType,
} from "@server/application/modules/notification/notification/models";

/** Default SMS-based phone verification provider using Notification BCM. */
export class DefaultPhoneVerificationProvider implements IPhoneVerificationProvider {
  constructor(private readonly notifications: NotificationModule) {}

  async sendVerificationCode(input: PhoneVerificationDeliveryInput): Promise<void> {
    await this.notifications
      .send({
        channel: NotificationChannel.Sms,
        recipient: createNotificationRecipient({
          type: NotificationRecipientType.Customer,
          id: input.customerId,
          address: input.phone,
        }),
        body: `Your verification code is ${input.code}`,
      })
      .catch(() => undefined);
  }
}
