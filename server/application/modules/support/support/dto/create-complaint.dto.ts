export interface CreateComplaintDto {
  readonly complainantId: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly reason: string;
  readonly description: string;
}
