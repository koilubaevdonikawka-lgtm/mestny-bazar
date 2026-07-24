import type {
  IPaymentGateway,
  PaymentGatewayRequest,
  PaymentGatewayResult,
} from "@server/application/payment-management/contracts/payment-gateway.contract";

interface MockGatewayRecord {
  request: PaymentGatewayRequest;
  status: PaymentGatewayResult["status"];
}

/**
 * Mock payment gateway — no HTTP calls.
 * Replace with Finik/Stripe/PayPal adapter without changing Application Layer.
 */
export class MockPaymentGateway implements IPaymentGateway {
  private readonly records = new Map<string, MockGatewayRecord>();

  async initiate(request: PaymentGatewayRequest): Promise<PaymentGatewayResult> {
    const gatewayReference = `mock-${request.paymentId}`;
    this.records.set(gatewayReference, { request, status: "pending" });

    return {
      gatewayReference,
      status: "pending",
      message: "Mock payment initiated",
    };
  }

  async confirm(gatewayReference: string): Promise<PaymentGatewayResult> {
    const record = this.requireRecord(gatewayReference);
    record.status = "succeeded";

    return {
      gatewayReference,
      status: "succeeded",
      message: "Mock payment confirmed",
    };
  }

  async fail(gatewayReference: string, reason?: string): Promise<PaymentGatewayResult> {
    const record = this.requireRecord(gatewayReference);
    record.status = "failed";

    return {
      gatewayReference,
      status: "failed",
      message: reason ?? "Mock payment failed",
    };
  }

  async cancel(gatewayReference: string): Promise<PaymentGatewayResult> {
    const record = this.requireRecord(gatewayReference);
    record.status = "cancelled";

    return {
      gatewayReference,
      status: "cancelled",
      message: "Mock payment cancelled",
    };
  }

  private requireRecord(gatewayReference: string): MockGatewayRecord {
    const record = this.records.get(gatewayReference);
    if (!record) {
      throw new Error(`Mock gateway reference not found: ${gatewayReference}`);
    }
    return record;
  }
}
