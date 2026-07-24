import {
  AcceptDeliveryUseCase,
  ArriveToCustomerUseCase,
  AssignCourierUseCase,
  CancelOrderUseCase,
  CompleteDeliveryUseCase,
  GetOrderTimelineUseCase,
  RefundOrderUseCase,
  ReturnOrderUseCase,
  StartDeliveryUseCase,
} from "@server/application/order-lifecycle/use-cases/order-lifecycle.use-cases";

/** Application facade for order lifecycle operations. */
export class OrderLifecycleApplicationService {
  constructor(
    private readonly assignCourierUseCase: AssignCourierUseCase,
    private readonly acceptDeliveryUseCase: AcceptDeliveryUseCase,
    private readonly startDeliveryUseCase: StartDeliveryUseCase,
    private readonly arriveToCustomerUseCase: ArriveToCustomerUseCase,
    private readonly completeDeliveryUseCase: CompleteDeliveryUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
    private readonly returnOrderUseCase: ReturnOrderUseCase,
    private readonly refundOrderUseCase: RefundOrderUseCase,
    private readonly getOrderTimelineUseCase: GetOrderTimelineUseCase,
  ) {}

  assignCourier(input: Parameters<AssignCourierUseCase["execute"]>[0]) {
    return this.assignCourierUseCase.execute(input);
  }

  acceptDelivery(input: Parameters<AcceptDeliveryUseCase["execute"]>[0]) {
    return this.acceptDeliveryUseCase.execute(input);
  }

  startDelivery(input: Parameters<StartDeliveryUseCase["execute"]>[0]) {
    return this.startDeliveryUseCase.execute(input);
  }

  arriveToCustomer(input: Parameters<ArriveToCustomerUseCase["execute"]>[0]) {
    return this.arriveToCustomerUseCase.execute(input);
  }

  completeDelivery(input: Parameters<CompleteDeliveryUseCase["execute"]>[0]) {
    return this.completeDeliveryUseCase.execute(input);
  }

  cancelOrder(input: Parameters<CancelOrderUseCase["execute"]>[0]) {
    return this.cancelOrderUseCase.execute(input);
  }

  returnOrder(input: Parameters<ReturnOrderUseCase["execute"]>[0]) {
    return this.returnOrderUseCase.execute(input);
  }

  refundOrder(input: Parameters<RefundOrderUseCase["execute"]>[0]) {
    return this.refundOrderUseCase.execute(input);
  }

  getTimeline(orderId: string) {
    return this.getOrderTimelineUseCase.execute(orderId);
  }
}
