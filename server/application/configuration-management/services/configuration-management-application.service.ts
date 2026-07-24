import type {
  ImportConfigurationInput,
  RegisterConfigurationInput,
  UpdateConfigurationInput,
} from "@server/application/configuration-management/models/configuration.model";
import {
  ConfigurationExistsUseCase,
  DeleteConfigurationUseCase,
  ExportConfigurationUseCase,
  GetConfigurationUseCase,
  ImportConfigurationUseCase,
  ListConfigurationsUseCase,
  RegisterConfigurationUseCase,
  UpdateConfigurationUseCase,
} from "@server/application/configuration-management/use-cases/configuration-management.use-cases";

/** Application facade for configuration management scenario. */
export class ConfigurationManagementApplicationService {
  constructor(
    private readonly registerConfigurationUseCase: RegisterConfigurationUseCase,
    private readonly getConfigurationUseCase: GetConfigurationUseCase,
    private readonly updateConfigurationUseCase: UpdateConfigurationUseCase,
    private readonly deleteConfigurationUseCase: DeleteConfigurationUseCase,
    private readonly listConfigurationsUseCase: ListConfigurationsUseCase,
    private readonly configurationExistsUseCase: ConfigurationExistsUseCase,
    private readonly exportConfigurationUseCase: ExportConfigurationUseCase,
    private readonly importConfigurationUseCase: ImportConfigurationUseCase,
  ) {}

  register(input: RegisterConfigurationInput) {
    return this.registerConfigurationUseCase.execute(input);
  }

  get(key: string) {
    return this.getConfigurationUseCase.execute(key);
  }

  update(input: UpdateConfigurationInput) {
    return this.updateConfigurationUseCase.execute(input);
  }

  delete(key: string) {
    return this.deleteConfigurationUseCase.execute(key);
  }

  list() {
    return this.listConfigurationsUseCase.execute();
  }

  exists(key: string) {
    return this.configurationExistsUseCase.execute(key);
  }

  exportConfiguration() {
    return this.exportConfigurationUseCase.execute();
  }

  importConfiguration(input: ImportConfigurationInput) {
    return this.importConfigurationUseCase.execute(input);
  }
}
