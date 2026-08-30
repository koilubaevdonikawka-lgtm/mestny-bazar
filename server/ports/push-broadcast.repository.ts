import type { PushBroadcastDTO } from "@shared/contracts/push-broadcast";

export interface IPushBroadcastRepository {
  create(data: {
    title: string;
    body: string;
    recipientCount: number;
    sentBy: string;
  }): Promise<PushBroadcastDTO>;
  /** Задача №218 — the cooldown guard reads only this one row; no history list exists yet, add one if ever needed. */
  getMostRecent(): Promise<PushBroadcastDTO | null>;
}
