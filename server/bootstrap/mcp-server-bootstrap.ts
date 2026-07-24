import type { IMcpProtocolHandler } from "@server/application/mcp-server/contracts/mcp-protocol-handler.contract";
import type { IMcpRequestHistoryRepository } from "@server/application/mcp-server/contracts/mcp-request-history-repository.contract";
import type { IMcpResourceRepository } from "@server/application/mcp-server/contracts/mcp-resource-repository.contract";
import type { IMcpStatisticsProvider } from "@server/application/mcp-server/contracts/mcp-statistics-provider.contract";
import type { IMcpToolRepository } from "@server/application/mcp-server/contracts/mcp-tool-repository.contract";
import {
  GetMcpRequestHistoryUseCase,
  GetMcpServerStatisticsUseCase,
  GetMcpToolUseCase,
  HandleMcpRequestUseCase,
  ListMcpResourcesUseCase,
  ListMcpToolsUseCase,
  McpServerApplicationService,
  McpServerService,
  RegisterMcpResourceUseCase,
  RegisterMcpToolUseCase,
} from "@server/application/mcp-server";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultMcpProtocolHandler } from "@server/infrastructure/mcp-server/default-mcp-protocol.handler";
import { DefaultMcpStatisticsProvider } from "@server/infrastructure/mcp-server/default-mcp-statistics.provider";
import { McpRequestHistoryRepository } from "@server/infrastructure/mcp-server/mcp-request-history.repository";
import { McpResourceRepository } from "@server/infrastructure/mcp-server/mcp-resource.repository";
import { McpToolRepository } from "@server/infrastructure/mcp-server/mcp-tool.repository";

/** Registers MCP Server services and use cases. */
export function registerMcpServerApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.McpServerMcpToolRepository, () =>
    new McpToolRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.McpServerMcpResourceRepository, () =>
    new McpResourceRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.McpServerMcpProtocolHandler, () =>
    new DefaultMcpProtocolHandler(),
  );

  registry.registerSingleton(
    InfrastructureTokens.McpServerMcpRequestHistoryRepository,
    () => new McpRequestHistoryRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.McpServerMcpStatisticsProvider, () =>
    new DefaultMcpStatisticsProvider(),
  );

  registry.registerTransient(InfrastructureTokens.McpServerService, (provider) =>
    new McpServerService(
      provider.resolve<IMcpToolRepository>(InfrastructureTokens.McpServerMcpToolRepository),
      provider.resolve<IMcpResourceRepository>(InfrastructureTokens.McpServerMcpResourceRepository),
      provider.resolve<IMcpProtocolHandler>(InfrastructureTokens.McpServerMcpProtocolHandler),
      provider.resolve<IMcpRequestHistoryRepository>(
        InfrastructureTokens.McpServerMcpRequestHistoryRepository,
      ),
      provider.resolve<IMcpStatisticsProvider>(InfrastructureTokens.McpServerMcpStatisticsProvider),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.McpServerRegisterMcpToolUseCase,
    (provider) =>
      new RegisterMcpToolUseCase(
        provider.resolve<McpServerService>(InfrastructureTokens.McpServerService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.McpServerGetMcpToolUseCase,
    (provider) =>
      new GetMcpToolUseCase(
        provider.resolve<McpServerService>(InfrastructureTokens.McpServerService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.McpServerListMcpToolsUseCase,
    (provider) =>
      new ListMcpToolsUseCase(
        provider.resolve<McpServerService>(InfrastructureTokens.McpServerService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.McpServerRegisterMcpResourceUseCase,
    (provider) =>
      new RegisterMcpResourceUseCase(
        provider.resolve<McpServerService>(InfrastructureTokens.McpServerService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.McpServerListMcpResourcesUseCase,
    (provider) =>
      new ListMcpResourcesUseCase(
        provider.resolve<McpServerService>(InfrastructureTokens.McpServerService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.McpServerHandleMcpRequestUseCase,
    (provider) =>
      new HandleMcpRequestUseCase(
        provider.resolve<McpServerService>(InfrastructureTokens.McpServerService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.McpServerGetMcpRequestHistoryUseCase,
    (provider) =>
      new GetMcpRequestHistoryUseCase(
        provider.resolve<McpServerService>(InfrastructureTokens.McpServerService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.McpServerGetMcpServerStatisticsUseCase,
    (provider) =>
      new GetMcpServerStatisticsUseCase(
        provider.resolve<McpServerService>(InfrastructureTokens.McpServerService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.McpServerApplicationService,
    (provider) =>
      new McpServerApplicationService(
        provider.resolve<RegisterMcpToolUseCase>(
          InfrastructureTokens.McpServerRegisterMcpToolUseCase,
        ),
        provider.resolve<GetMcpToolUseCase>(InfrastructureTokens.McpServerGetMcpToolUseCase),
        provider.resolve<ListMcpToolsUseCase>(InfrastructureTokens.McpServerListMcpToolsUseCase),
        provider.resolve<RegisterMcpResourceUseCase>(
          InfrastructureTokens.McpServerRegisterMcpResourceUseCase,
        ),
        provider.resolve<ListMcpResourcesUseCase>(
          InfrastructureTokens.McpServerListMcpResourcesUseCase,
        ),
        provider.resolve<HandleMcpRequestUseCase>(
          InfrastructureTokens.McpServerHandleMcpRequestUseCase,
        ),
        provider.resolve<GetMcpRequestHistoryUseCase>(
          InfrastructureTokens.McpServerGetMcpRequestHistoryUseCase,
        ),
        provider.resolve<GetMcpServerStatisticsUseCase>(
          InfrastructureTokens.McpServerGetMcpServerStatisticsUseCase,
        ),
      ),
  );
}
