/** Return request created when a customer initiates a product return. */
export interface ReturnRequest {
  readonly id: string;
  readonly orderId: string;
  readonly customerId: string;
  readonly reason: string;
  readonly status: "submitted";
  readonly createdAt: string;
}

export function createReturnRequest(input: {
  id: string;
  orderId: string;
  customerId: string;
  reason: string;
}): ReturnRequest {
  return Object.freeze({
    id: input.id.trim(),
    orderId: input.orderId.trim(),
    customerId: input.customerId.trim(),
    reason: input.reason.trim(),
    status: "submitted",
    createdAt: new Date().toISOString(),
  });
}
