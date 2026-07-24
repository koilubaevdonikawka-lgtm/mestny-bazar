export type { IHardwareProfileRepository } from "./contracts/hardware-profile-repository.contract";
export type { IHardwareProfileCatalog } from "./contracts/hardware-profile-catalog.contract";
export type {
  IHardwareProfileValidator,
  HardwareProfileValidationResult,
} from "./contracts/hardware-profile-validator.contract";
export type { IHardwareProfileSerializer } from "./contracts/hardware-profile-serializer.contract";
export type { IHardwareProfileStatisticsProvider } from "./contracts/hardware-profile-statistics-provider.contract";
export type { IRemoteHardwareProfileProvider } from "./contracts/remote-hardware-profile-provider.contract";
export type { IHardwareProfileImportProvider } from "./contracts/hardware-profile-import-provider.contract";
export type { IHardwareProfileExportProvider } from "./contracts/hardware-profile-export-provider.contract";
export type { IHardwareProfileSynchronizationProvider } from "./contracts/hardware-profile-synchronization-provider.contract";
export { createHardwareProfile } from "./models/hardware-profile.model";
export type {
  HardwareProfile,
  RegisterHardwareProfileInput,
  UpdateHardwareProfileInput,
  ListHardwareProfilesResult,
  FindHardwareProfileByNameResult,
  ListHardwareProfilesByCategoryResult,
  DeleteHardwareProfileResult,
  HardwareProfileRegistryStatistics,
} from "./models/hardware-profile.model";
export { AiHardwareProfileRegistryService } from "./services/ai-hardware-profile-registry.service";
export { AiHardwareProfileRegistryApplicationService } from "./services/ai-hardware-profile-registry-application.service";
export {
  RegisterHardwareProfileUseCase,
  GetHardwareProfileUseCase,
  ListHardwareProfilesUseCase,
  UpdateHardwareProfileUseCase,
  DeleteHardwareProfileUseCase,
  FindHardwareProfileByNameUseCase,
  ListHardwareProfilesByCategoryUseCase,
  GetHardwareProfileRegistryStatisticsUseCase,
} from "./use-cases/ai-hardware-profile-registry.use-cases";
