import type {
  CreatePaymentRecordInput,
  IPaymentRepository,
} from "@server/ports/payment.repository";
import type {
  PaymentEventType,
  PaymentRecordDTO,
  PaymentRecordStatus,
} from "@shared/contracts/payment";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface PaymentRow {
  id: string;
  order_id: string;
  provider: string;
  provider_payment_id: string | null;
  idempotency_key: string;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  payment_url: string | null;
  expires_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

function mapPaymentRow(row: PaymentRow): PaymentRecordDTO {
  return {
    id: row.id,
    orderId: row.order_id,
    provider: row.provider,
    providerPaymentId: row.provider_payment_id,
    idempotencyKey: row.idempotency_key,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    paymentUrl: row.payment_url,
    expiresAt: row.expires_at,
    failureReason: row.failure_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const PAYMENT_SELECT =
  "id, order_id, provider, provider_payment_id, idempotency_key, amount, currency, status, " +
  "payment_url, expires_at, failure_reason, created_at, updated_at";

export class SupabasePaymentRepository implements IPaymentRepository {
  async create(input: CreatePaymentRecordInput): Promise<PaymentRecordDTO> {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: input.orderId,
        provider: input.provider,
        idempotency_key: input.idempotencyKey,
        amount: input.amount,
        currency: input.currency,
        status: input.status,
        payment_url: input.paymentUrl,
        provider_payment_id: input.providerPaymentId,
        expires_at: input.expiresAt,
      })
      .select(PAYMENT_SELECT)
      .single();

    if (error || !data) {
      throw new Error(`Failed to create payment record: ${error?.message ?? "unknown"}`);
    }
    return mapPaymentRow(data as unknown as PaymentRow);
  }

  async getById(id: string): Promise<PaymentRecordDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select(PAYMENT_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch payment: ${error.message}`);
    return data ? mapPaymentRow(data as unknown as PaymentRow) : null;
  }

  async getByOrderId(orderId: string): Promise<PaymentRecordDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select(PAYMENT_SELECT)
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch payment by order: ${error.message}`);
    return data ? mapPaymentRow(data as unknown as PaymentRow) : null;
  }

  async getByIdempotencyKey(idempotencyKey: string): Promise<PaymentRecordDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select(PAYMENT_SELECT)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch payment by idempotency key: ${error.message}`);
    return data ? mapPaymentRow(data as unknown as PaymentRow) : null;
  }

  async getByProviderPaymentId(providerPaymentId: string): Promise<PaymentRecordDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select(PAYMENT_SELECT)
      .eq("provider_payment_id", providerPaymentId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch payment by provider id: ${error.message}`);
    return data ? mapPaymentRow(data as unknown as PaymentRow) : null;
  }

  async updateStatus(
    id: string,
    status: PaymentRecordStatus,
    fields?: { failureReason?: string | null },
  ): Promise<PaymentRecordDTO> {
    const patch: { status: PaymentRecordStatus; failure_reason?: string | null } = { status };
    if (fields?.failureReason !== undefined) patch.failure_reason = fields.failureReason;

    const { data, error } = await supabaseAdmin
      .from("payments")
      .update(patch)
      .eq("id", id)
      .select(PAYMENT_SELECT)
      .single();

    if (error || !data) {
      throw new Error(`Failed to update payment status: ${error?.message ?? "unknown"}`);
    }
    return mapPaymentRow(data as unknown as PaymentRow);
  }

  async markProviderPaymentId(id: string, providerPaymentId: string): Promise<PaymentRecordDTO> {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .update({ provider_payment_id: providerPaymentId })
      .eq("id", id)
      .select(PAYMENT_SELECT)
      .single();

    if (error || !data) {
      throw new Error(`Failed to set provider payment id: ${error?.message ?? "unknown"}`);
    }
    return mapPaymentRow(data as unknown as PaymentRow);
  }

  async logEvent(
    paymentId: string,
    eventType: PaymentEventType,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const { error } = await supabaseAdmin.from("payment_events").insert({
      payment_id: paymentId,
      event_type: eventType,
      metadata: (metadata ?? null) as Json,
    });

    if (error) throw new Error(`Failed to log payment event: ${error.message}`);
  }
}
