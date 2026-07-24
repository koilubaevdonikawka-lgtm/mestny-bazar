export type ProductLifecycleAction =
  | "create"
  | "submit_for_review"
  | "approve_for_publication"
  | "reject_review"
  | "publish"
  | "hide"
  | "unhide"
  | "archive";
