import {
  CancelCheckoutUseCase,
  CreateCheckoutUseCase,
  GetCheckoutSummaryUseCase,
  RefreshCheckoutUseCase,
  ValidateCheckoutUseCase,
} from "@server/application/checkout-management/use-cases/checkout-management.use-cases";

/** Application facade for checkout management scenario. */
export class CheckoutManagementApplicationService {
  constructor(
    private readonly createCheckoutUseCase: CreateCheckoutUseCase,
    private readonly validateCheckoutUseCase: ValidateCheckoutUseCase,
    private readonly getCheckoutSummaryUseCase: GetCheckoutSummaryUseCase,
    private readonly refreshCheckoutUseCase: RefreshCheckoutUseCase,
    private readonly cancelCheckoutUseCase: CancelCheckoutUseCase,
  ) {}

  create(customerId: string) {
    return this.createCheckoutUseCase.execute(customerId);
  }

  validate(customerId: string, checkoutId?: string) {
    return this.validateCheckoutUseCase.execute(customerId, checkoutId);
  }

  getSummary(checkoutId: string) {
    return this.getCheckoutSummaryUseCase.execute(checkoutId);
  }

  refresh(customerId: string, checkoutId: string) {
    return this.refreshCheckoutUseCase.execute(customerId, checkoutId);
  }

  cancel(customerId: string, checkoutId: string) {
    return this.cancelCheckoutUseCase.execute(customerId, checkoutId);
  }
}
