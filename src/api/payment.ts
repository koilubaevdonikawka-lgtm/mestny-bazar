import type { PaymentStatusCheckDTO } from "@shared/contracts/payment";
import { checkPaymentStatusFn } from "@/api/payment.functions";

/** Best-effort status check for the order-success return page — the webhook remains the authoritative source of truth. */
export async function checkPaymentStatus(orderId: string): Promise<PaymentStatusCheckDTO> {
  return checkPaymentStatusFn({ data: { orderId } });
}
