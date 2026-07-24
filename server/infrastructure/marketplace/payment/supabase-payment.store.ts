import type { IPaymentStore } from "@server/application/modules/payment/payment/contracts";
import type { Payment } from "@server/application/modules/payment/payment/models";
import { PaymentMapper } from "@server/infrastructure/marketplace/mappers";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import {
  assertSupabaseSuccess,
  SupabaseSnapshotTables,
  type SnapshotRow,
} from "@server/infrastructure/supabase/shared";

/** Supabase-backed payment store using JSON snapshot persistence. */
export class SupabasePaymentStore implements IPaymentStore {
  private readonly tableName = SupabaseSnapshotTables.payments;

  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async savePayment(payment: Payment): Promise<void> {
    const row = PaymentMapper.toSnapshotRow(payment);
    assertSupabaseSuccess(
      `${this.tableName}.upsert`,
      await this.table().upsert(row, { onConflict: "id" }),
    );
  }

  async updatePayment(payment: Payment): Promise<void> {
    await this.savePayment(payment);
  }

  async findById(paymentId: string): Promise<Payment | null> {
    const data = assertSupabaseSuccess(
      `${this.tableName}.select`,
      await this.table().select("id, snapshot, updated_at").eq("id", paymentId).maybeSingle(),
    );
    return PaymentMapper.fromSnapshotRow(data as SnapshotRow<Payment> | null);
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const data = assertSupabaseSuccess(
      `${this.tableName}.selectByOrderId`,
      await this.table()
        .select("id, snapshot, updated_at")
        .eq("snapshot->>orderId", orderId)
        .maybeSingle(),
    );
    return PaymentMapper.fromSnapshotRow(data as SnapshotRow<Payment> | null);
  }

  async findByProviderPaymentId(providerPaymentId: string): Promise<Payment | null> {
    const data = assertSupabaseSuccess(
      `${this.tableName}.selectByProviderPaymentId`,
      await this.table()
        .select("id, snapshot, updated_at")
        .eq("snapshot->>providerPaymentId", providerPaymentId)
        .maybeSingle(),
    );
    return PaymentMapper.fromSnapshotRow(data as SnapshotRow<Payment> | null);
  }

  private table() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(this.tableName);
    }
    return client.schema(this.configuration.schema).from(this.tableName);
  }
}
