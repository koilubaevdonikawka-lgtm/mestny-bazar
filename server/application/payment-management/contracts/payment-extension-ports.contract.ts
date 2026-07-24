/**
 * Future integration ports for Payment Management.
 * Not implemented — reserved for external gateways and downstream modules.
 */

import type { PaymentGatewayRequest, PaymentGatewayResult } from "./payment-gateway.contract";

/** Finik payment gateway — Kyrgyzstan payment provider. */
export interface IFinikGateway {
  initiatePayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResult>;
  confirmPayment(gatewayReference: string): Promise<PaymentGatewayResult>;
}

/** Stripe payment gateway. */
export interface IStripeGateway {
  createPaymentIntent(request: PaymentGatewayRequest): Promise<PaymentGatewayResult>;
  capturePayment(gatewayReference: string): Promise<PaymentGatewayResult>;
}

/** PayPal payment gateway. */
export interface IPayPalGateway {
  createOrder(request: PaymentGatewayRequest): Promise<PaymentGatewayResult>;
  captureOrder(gatewayReference: string): Promise<PaymentGatewayResult>;
}

/** Webhook processor for async payment provider callbacks. */
export interface IWebhookProcessor {
  processWebhook(provider: string, payload: unknown): Promise<void>;
}

/** Refund Management — post-payment refund lifecycle. */
export interface IRefundManagement {
  initiateRefund(paymentId: string, amount: number, reason?: string): Promise<string>;
  getRefundStatus(refundId: string): Promise<string>;
}

/** Fraud Detection — risk scoring before payment capture. */
export interface IFraudDetection {
  assessPaymentRisk(paymentId: string, customerId: string, amount: number): Promise<{
    allowed: boolean;
    score: number;
    reason?: string;
  }>;
}

/** Notification BCM — payment status notifications. */
export interface IPaymentNotificationProvider {
  notifyPaymentSucceeded(paymentId: string, customerId: string): Promise<void>;
  notifyPaymentFailed(paymentId: string, customerId: string, reason?: string): Promise<void>;
}

/** Analytics BCM — payment funnel and conversion metrics. */
export interface IPaymentAnalyticsProvider {
  trackPaymentCreated(paymentId: string, orderId: string, amount: number): Promise<void>;
  trackPaymentSucceeded(paymentId: string, orderId: string, amount: number): Promise<void>;
  trackPaymentFailed(paymentId: string, orderId: string): Promise<void>;
}
