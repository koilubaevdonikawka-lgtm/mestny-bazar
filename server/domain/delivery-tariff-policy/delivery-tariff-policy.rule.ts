import type {
  DeliveryTariffPolicyContext,
  DeliveryTariffPolicyResult,
} from "@server/ports/delivery-tariff-policy.port";

/** docs/principles/12-rule-engine-standard.md — order/applies/evaluate/terminal, no exceptions. */
export interface DeliveryTariffRule {
  /** Lower values run first. Order is defined per rule, composed in DI Container. */
  readonly order: number;
  /** When false, an allowed result continues the chain. Defaults to true. */
  readonly terminal?: boolean;
  applies(context: DeliveryTariffPolicyContext): boolean;
  evaluate(context: DeliveryTariffPolicyContext): DeliveryTariffPolicyResult;
}
