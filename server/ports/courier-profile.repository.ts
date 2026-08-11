import type {
  CourierProfileDTO,
  CourierProfileStatus,
  CreateCourierProfileRequest,
  UpdateCourierProfileRequest,
} from "@shared/contracts/courier-profile";

export interface CreateCourierProfileInput extends CreateCourierProfileRequest {
  createdBy: string;
}

export interface ICourierProfileRepository {
  list(): Promise<CourierProfileDTO[]>;
  getByUserId(userId: string): Promise<CourierProfileDTO | null>;
  create(input: CreateCourierProfileInput): Promise<CourierProfileDTO>;
  update(input: UpdateCourierProfileRequest): Promise<CourierProfileDTO>;
  setStatus(userId: string, status: CourierProfileStatus): Promise<CourierProfileDTO>;
  bulkSetStatus(userIds: string[], status: CourierProfileStatus): Promise<void>;
  /** CourierAssignmentService's exclusion list — a blocked courier is never a candidate. */
  listBlockedCourierIds(): Promise<string[]>;
}
