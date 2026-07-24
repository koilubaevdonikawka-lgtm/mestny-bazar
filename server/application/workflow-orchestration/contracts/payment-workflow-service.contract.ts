export interface PaymentWorkflowSnapshot {
  readonly paymentId: string;
  readonly orderId: string;
  readonly customerId: string;
  readonly status: string;
}

export interface CreatePaymentWorkflowResult {
  readonly paymentId: string;
  readonly orderId: string;
  readonly status: string;
}

/** Payment coordination port for workflow orchestration. */
export interface IPaymentWorkflowService {
  createForOrder(customerId: string, orderId: string): Promise<CreatePaymentWorkflowResult>;
  confirmPayment(paymentId: string): Promise<boolean>;
  failPayment(paymentId: string, reason?: string): Promise<boolean>;
  cancelPayment(paymentId: string, customerId: string, reason?: string): Promise<boolean>;
  getPayment(paymentId: string): Promise<PaymentWorkflowSnapshot | null>;
  findByOrderId(orderId: string): Promise<PaymentWorkflowSnapshot | null>;
}
