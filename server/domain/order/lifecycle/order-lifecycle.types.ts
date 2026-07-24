export type OrderLifecycleAction =
  | "confirm"
  | "pay"
  | "cancel"
  | "start_preparing"
  | "complete_preparing"
  | "hand_to_courier"
  | "start_delivery"
  | "deliver"
  | "refund"
  | "close";
