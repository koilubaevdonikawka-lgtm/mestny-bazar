import type {
  CourierAssignmentContext,
  CourierAssignmentResult,
} from "@server/ports/courier-assignment.port";

export interface CourierAssignmentRule {
  readonly order: number;
  readonly terminal?: boolean;
  applies(context: CourierAssignmentContext): boolean;
  evaluate(context: CourierAssignmentContext): CourierAssignmentResult;
}
