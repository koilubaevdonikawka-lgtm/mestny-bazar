import type {
  ConfigurationExistsResult,
  ConfigurationValueResult,
  ExportConfigurationResult,
  ImportConfigurationInput,
  ImportConfigurationResult,
  ListConfigurationsResult,
  RegisterConfigurationInput,
  UpdateConfigurationInput,
} from "@server/application/configuration-management/models/configuration.model";
import type { ConfigurationManagementService } from "@server/application/configuration-management/services/configuration-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterConfigurationUseCase {
  constructor(private readonly configuration: ConfigurationManagementService) {}

  execute(input: RegisterConfigurationInput): Promise<UseCaseResult<ConfigurationValueResult>> {
    return this.configuration.register(input).then(useCaseResult);
  }
}

export class GetConfigurationUseCase {
  constructor(private readonly configuration: ConfigurationManagementService) {}

  async execute(key: string): Promise<UseCaseResult<ConfigurationValueResult | null>> {
    return useCaseResult(await this.configuration.get(key));
  }
}

export class UpdateConfigurationUseCase {
  constructor(private readonly configuration: ConfigurationManagementService) {}

  execute(input: UpdateConfigurationInput): Promise<UseCaseResult<ConfigurationValueResult>> {
    return this.configuration.update(input).then(useCaseResult);
  }
}

export class DeleteConfigurationUseCase {
  constructor(private readonly configuration: ConfigurationManagementService) {}

  execute(key: string): Promise<UseCaseResult<{ key: string; deleted: boolean }>> {
    return this.configuration.delete(key).then(useCaseResult);
  }
}

export class ListConfigurationsUseCase {
  constructor(private readonly configuration: ConfigurationManagementService) {}

  execute(): Promise<UseCaseResult<ListConfigurationsResult>> {
    return this.configuration.list().then(useCaseResult);
  }
}

export class ConfigurationExistsUseCase {
  constructor(private readonly configuration: ConfigurationManagementService) {}

  execute(key: string): Promise<UseCaseResult<ConfigurationExistsResult>> {
    return this.configuration.exists(key).then(useCaseResult);
  }
}

export class ExportConfigurationUseCase {
  constructor(private readonly configuration: ConfigurationManagementService) {}

  execute(): Promise<UseCaseResult<ExportConfigurationResult>> {
    return this.configuration.exportConfiguration().then(useCaseResult);
  }
}

export class ImportConfigurationUseCase {
  constructor(private readonly configuration: ConfigurationManagementService) {}

  execute(input: ImportConfigurationInput): Promise<UseCaseResult<ImportConfigurationResult>> {
    return this.configuration.importConfiguration(input).then(useCaseResult);
  }
}
