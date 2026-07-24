export type SellerLifecycleAction =
  | "register"
  | "submit_verification"
  | "verify"
  | "reject_verification"
  | "activate"
  | "suspend"
  | "reinstate"
  | "block"
  | "archive";
