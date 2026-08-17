export class CashPaymentRequiresAuthentication extends Error {
  constructor(message = "Оплата наличными доступна только авторизованным пользователям") {
    super(message);
    this.name = "CashPaymentRequiresAuthentication";
  }
}

export class PaymentPolicyDeniedError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "PaymentPolicyDeniedError";
  }
}
