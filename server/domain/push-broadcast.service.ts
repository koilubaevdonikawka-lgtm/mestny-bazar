import type { PushBroadcastAudienceDTO, PushBroadcastDTO } from "@shared/contracts/push-broadcast";
import type { IDeviceTokenRepository } from "@server/ports/device-token.repository";
import type { IUserAdminRepository } from "@server/ports/user-admin.repository";
import type { IPushBroadcastRepository } from "@server/ports/push-broadcast.repository";
import type { IPushNotifier } from "@server/ports/push-notifier.port";
import type { UserRole } from "@shared/contracts/user";

/** Задача №218 — short enough to never block two genuinely distinct campaigns sent minutes apart, long enough to reliably catch a double-click/resubmit. */
const COOLDOWN_SECONDS = 60;

const STAFF_ROLES: UserRole[] = ["admin", "warehouse", "courier", "seller"];

export class BroadcastCooldownError extends Error {
  constructor(public readonly remainingSeconds: number) {
    super(
      `A broadcast was already sent ${COOLDOWN_SECONDS - remainingSeconds}s ago — wait ${remainingSeconds}s before sending another.`,
    );
    this.name = "BroadcastCooldownError";
  }
}

/**
 * Admin "Массовая рассылка push" (Задача №218) — the only place in this
 * codebase that fans a push out to every customer at once, rather than one
 * order's buyer (server/domain/push/marketplace-events.subscriber.ts).
 * Deliberately its own service, not a method bolted onto FcmPushAdapter or
 * DeviceTokenService: it composes three unrelated ports (who has a device,
 * who is staff, and the send itself) into one business operation, exactly
 * the shape DeliveryTariffService/BannerService already use for a thin
 * read/write wrapper over ports.
 */
export class PushBroadcastService {
  constructor(
    private readonly deviceTokens: IDeviceTokenRepository,
    private readonly userAdmin: IUserAdminRepository,
    private readonly broadcasts: IPushBroadcastRepository,
    private readonly push: IPushNotifier,
  ) {}

  /** "Покупатели" — every user with a registered device MINUS anyone who holds any staff role, even if they also carry the default 'customer' role every signup gets. */
  private async resolveCustomerUserIds(): Promise<string[]> {
    const [deviceUserIds, allUsers] = await Promise.all([
      this.deviceTokens.listDistinctUserIds(),
      this.userAdmin.listUsers(),
    ]);
    const staffUserIds = new Set(
      allUsers
        .filter((user) => user.roles.some((role) => STAFF_ROLES.includes(role)))
        .map((user) => user.id),
    );
    return deviceUserIds.filter((userId) => !staffUserIds.has(userId));
  }

  private cooldownRemainingSeconds(lastBroadcast: PushBroadcastDTO | null): number | null {
    if (!lastBroadcast) return null;
    const elapsedMs = Date.now() - new Date(lastBroadcast.createdAt).getTime();
    const remaining = COOLDOWN_SECONDS - Math.floor(elapsedMs / 1000);
    return remaining > 0 ? remaining : null;
  }

  /** Read-only preview — audience size and cooldown state, shown before the admin commits to sending. */
  async getAudience(): Promise<PushBroadcastAudienceDTO> {
    const [customerUserIds, lastBroadcast] = await Promise.all([
      this.resolveCustomerUserIds(),
      this.broadcasts.getMostRecent(),
    ]);
    return {
      customerCount: customerUserIds.length,
      cooldownRemainingSeconds: this.cooldownRemainingSeconds(lastBroadcast),
      lastBroadcast,
    };
  }

  /**
   * Sends to every current customer, records the broadcast, and returns the
   * record — the recipientCount here is "attempted" (queued for send), not
   * "delivered": IPushNotifier.sendToUser never surfaces per-token FCM
   * results (push-notifier.port.ts's own contract — a side effect, logged
   * on failure, never thrown), so a stronger "delivered" claim would not be
   * honest.
   */
  async sendBroadcast(title: string, body: string, sentBy: string): Promise<PushBroadcastDTO> {
    const lastBroadcast = await this.broadcasts.getMostRecent();
    const remaining = this.cooldownRemainingSeconds(lastBroadcast);
    if (remaining !== null) {
      throw new BroadcastCooldownError(remaining);
    }

    const customerUserIds = await this.resolveCustomerUserIds();
    await Promise.allSettled(
      customerUserIds.map((userId) => this.push.sendToUser(userId, { title, body })),
    );

    return this.broadcasts.create({ title, body, recipientCount: customerUserIds.length, sentBy });
  }
}
