import { DomainEventDispatcher } from "@server/application/events";
import {
  CatalogApplicationService,
  CreateCategoryUseCase,
  CreateOrderUseCase,
  CreateProductUseCase,
  GetCatalogUseCase,
  GetOrderUseCase,
  GetProductUseCase,
  GetSellerUseCase,
  OrderApplicationService,
  ProductApplicationService,
  RegisterSellerUseCase,
  SellerApplicationService,
} from "@server/application";
import type {
  ICatalogRepository,
  ICategoryRepository,
  IEventBus,
  IIdGenerator,
  IOrderRepository,
  IProductRepository,
  ISellerRepository,
  ITransactionManager,
} from "@server/application/ports";
import { registerPurchaseApplication } from "@server/bootstrap/purchase-bootstrap";
import { registerOrderLifecycleApplication } from "@server/bootstrap/order-lifecycle-bootstrap";
import { registerSellerProductApplication } from "@server/bootstrap/seller-product-bootstrap";
import { registerCustomerManagementApplication } from "@server/bootstrap/customer-management-bootstrap";
import { registerCatalogManagementApplication } from "@server/bootstrap/catalog-management-bootstrap";
import { registerSearchManagementApplication } from "@server/bootstrap/search-management-bootstrap";
import { registerFavoritesManagementApplication } from "@server/bootstrap/favorites-management-bootstrap";
import { registerCartManagementApplication } from "@server/bootstrap/cart-management-bootstrap";
import { registerCheckoutManagementApplication } from "@server/bootstrap/checkout-management-bootstrap";
import { registerOrderManagementApplication } from "@server/bootstrap/order-management-bootstrap";
import { registerPaymentManagementApplication } from "@server/bootstrap/payment-management-bootstrap";
import { registerDeliveryManagementApplication } from "@server/bootstrap/delivery-management-bootstrap";
import { registerWarehouseManagementApplication } from "@server/bootstrap/warehouse-management-bootstrap";
import { registerNotificationManagementApplication } from "@server/bootstrap/notification-management-bootstrap";
import { registerAnalyticsManagementApplication } from "@server/bootstrap/analytics-management-bootstrap";
import { registerWorkflowOrchestrationApplication } from "@server/bootstrap/workflow-orchestration-bootstrap";
import { registerAuditManagementApplication } from "@server/bootstrap/audit-management-bootstrap";
import { registerAuthorizationManagementApplication } from "@server/bootstrap/authorization-management-bootstrap";
import { registerAuthenticationManagementApplication } from "@server/bootstrap/authentication-management-bootstrap";
import { registerIdempotencyManagementApplication } from "@server/bootstrap/idempotency-management-bootstrap";
import { registerConfigurationManagementApplication } from "@server/bootstrap/configuration-management-bootstrap";
import { registerSchedulingManagementApplication } from "@server/bootstrap/scheduling-management-bootstrap";
import { registerHealthMonitoringManagementApplication } from "@server/bootstrap/health-monitoring-management-bootstrap";
import { registerLoggingManagementApplication } from "@server/bootstrap/logging-management-bootstrap";
import { registerMetricsManagementApplication } from "@server/bootstrap/metrics-management-bootstrap";
import { registerSecretsManagementApplication } from "@server/bootstrap/secrets-management-bootstrap";
import { registerEventBusManagementApplication } from "@server/bootstrap/event-bus-management-bootstrap";
import { registerPluginManagementApplication } from "@server/bootstrap/plugin-management-bootstrap";
import { registerFeatureFlagManagementApplication } from "@server/bootstrap/feature-flag-management-bootstrap";
import { registerRateLimitingManagementApplication } from "@server/bootstrap/rate-limiting-management-bootstrap";
import { registerCacheManagementApplication } from "@server/bootstrap/cache-management-bootstrap";
import { registerAiAgentGatewayApplication } from "@server/bootstrap/ai-agent-gateway-bootstrap";
import { registerAiToolRegistryApplication } from "@server/bootstrap/ai-tool-registry-bootstrap";
import { registerAiCapabilityDiscoveryApplication } from "@server/bootstrap/ai-capability-discovery-bootstrap";
import { registerAiActionSecurityApplication } from "@server/bootstrap/ai-action-security-bootstrap";
import { registerMcpServerApplication } from "@server/bootstrap/mcp-server-bootstrap";
import { registerAiSemanticApiApplication } from "@server/bootstrap/ai-semantic-api-bootstrap";
import { registerAiCatalogMetadataApplication } from "@server/bootstrap/ai-catalog-metadata-bootstrap";
import { registerAiAgentSdkApplication } from "@server/bootstrap/ai-agent-sdk-bootstrap";
import { registerAiAgentSandboxApplication } from "@server/bootstrap/ai-agent-sandbox-bootstrap";
import { registerAiAgentMonitoringApplication } from "@server/bootstrap/ai-agent-monitoring-bootstrap";
import { registerAiKnowledgeRegistryApplication } from "@server/bootstrap/ai-knowledge-registry-bootstrap";
import { registerAiMemoryManagementApplication } from "@server/bootstrap/ai-memory-management-bootstrap";
import { registerAiPromptRegistryApplication } from "@server/bootstrap/ai-prompt-registry-bootstrap";
import { registerAiConversationManagementApplication } from "@server/bootstrap/ai-conversation-management-bootstrap";
import { registerAiSessionManagementApplication } from "@server/bootstrap/ai-session-management-bootstrap";
import { registerAiContextManagementApplication } from "@server/bootstrap/ai-context-management-bootstrap";
import { registerAiModelRegistryApplication } from "@server/bootstrap/ai-model-registry-bootstrap";
import { registerAiProviderRegistryApplication } from "@server/bootstrap/ai-provider-registry-bootstrap";
import { registerAiCapabilityRegistryApplication } from "@server/bootstrap/ai-capability-registry-bootstrap";
import { registerAiWorkflowRegistryApplication } from "@server/bootstrap/ai-workflow-registry-bootstrap";
import { registerAiPolicyRegistryApplication } from "@server/bootstrap/ai-policy-registry-bootstrap";
import { registerAiResourceRegistryApplication } from "@server/bootstrap/ai-resource-registry-bootstrap";
import { registerAiTemplateRegistryApplication } from "@server/bootstrap/ai-template-registry-bootstrap";
import { registerAiProfileRegistryApplication } from "@server/bootstrap/ai-profile-registry-bootstrap";
import { registerAiPersonaRegistryApplication } from "@server/bootstrap/ai-persona-registry-bootstrap";
import { registerAiSkillRegistryApplication } from "@server/bootstrap/ai-skill-registry-bootstrap";
import { registerAiStrategyRegistryApplication } from "@server/bootstrap/ai-strategy-registry-bootstrap";
import { registerAiActionRegistryApplication } from "@server/bootstrap/ai-action-registry-bootstrap";
import { registerAiCommandRegistryApplication } from "@server/bootstrap/ai-command-registry-bootstrap";
import { registerAiWorkflowTemplateRegistryApplication } from "@server/bootstrap/ai-workflow-template-registry-bootstrap";
import { registerAiDatasetRegistryApplication } from "@server/bootstrap/ai-dataset-registry-bootstrap";
import { registerAiKnowledgeSourceRegistryApplication } from "@server/bootstrap/ai-knowledge-source-registry-bootstrap";
import { registerAiKnowledgePackageRegistryApplication } from "@server/bootstrap/ai-knowledge-package-registry-bootstrap";
import { registerAiEvaluationRegistryApplication } from "@server/bootstrap/ai-evaluation-registry-bootstrap";
import { registerAiBenchmarkRegistryApplication } from "@server/bootstrap/ai-benchmark-registry-bootstrap";
import { registerAiExperimentRegistryApplication } from "@server/bootstrap/ai-experiment-registry-bootstrap";
import { registerAiScenarioRegistryApplication } from "@server/bootstrap/ai-scenario-registry-bootstrap";
import { registerAiDatasetVersionRegistryApplication } from "@server/bootstrap/ai-dataset-version-registry-bootstrap";
import { registerAiKnowledgeGraphRegistryApplication } from "@server/bootstrap/ai-knowledge-graph-registry-bootstrap";
import { registerAiOntologyRegistryApplication } from "@server/bootstrap/ai-ontology-registry-bootstrap";
import { registerAiTaxonomyRegistryApplication } from "@server/bootstrap/ai-taxonomy-registry-bootstrap";
import { registerAiVocabularyRegistryApplication } from "@server/bootstrap/ai-vocabulary-registry-bootstrap";
import { registerAiConceptRegistryApplication } from "@server/bootstrap/ai-concept-registry-bootstrap";
import { registerAiEntityRegistryApplication } from "@server/bootstrap/ai-entity-registry-bootstrap";
import { registerAiRelationRegistryApplication } from "@server/bootstrap/ai-relation-registry-bootstrap";
import { registerAiGraphRegistryApplication } from "@server/bootstrap/ai-graph-registry-bootstrap";
import { registerAiSchemaRegistryApplication } from "@server/bootstrap/ai-schema-registry-bootstrap";
import { registerAiConstraintRegistryApplication } from "@server/bootstrap/ai-constraint-registry-bootstrap";
import { registerAiRuleRegistryApplication } from "@server/bootstrap/ai-rule-registry-bootstrap";
import { registerAiPolicySetRegistryApplication } from "@server/bootstrap/ai-policy-set-registry-bootstrap";
import { registerAiValidationProfileRegistryApplication } from "@server/bootstrap/ai-validation-profile-registry-bootstrap";
import { registerAiExecutionProfileRegistryApplication } from "@server/bootstrap/ai-execution-profile-registry-bootstrap";
import { registerAiRuntimeProfileRegistryApplication } from "@server/bootstrap/ai-runtime-profile-registry-bootstrap";
import { registerAiEnvironmentProfileRegistryApplication } from "@server/bootstrap/ai-environment-profile-registry-bootstrap";
import { registerAiDeploymentProfileRegistryApplication } from "@server/bootstrap/ai-deployment-profile-registry-bootstrap";
import { registerAiExecutionEnvironmentRegistryApplication } from "@server/bootstrap/ai-execution-environment-registry-bootstrap";
import { registerAiResourcePoolRegistryApplication } from "@server/bootstrap/ai-resource-pool-registry-bootstrap";
import { registerAiInfrastructureProfileRegistryApplication } from "@server/bootstrap/ai-infrastructure-profile-registry-bootstrap";
import { registerAiComputeProfileRegistryApplication } from "@server/bootstrap/ai-compute-profile-registry-bootstrap";
import { registerAiHardwareProfileRegistryApplication } from "@server/bootstrap/ai-hardware-profile-registry-bootstrap";
import { registerAiAcceleratorProfileRegistryApplication } from "@server/bootstrap/ai-accelerator-profile-registry-bootstrap";
import { registerAiMemoryProfileRegistryApplication } from "@server/bootstrap/ai-memory-profile-registry-bootstrap";
import { registerAiStorageProfileRegistryApplication } from "@server/bootstrap/ai-storage-profile-registry-bootstrap";
import { registerAiNetworkProfileRegistryApplication } from "@server/bootstrap/ai-network-profile-registry-bootstrap";
import { registerAiSecurityProfileRegistryApplication } from "@server/bootstrap/ai-security-profile-registry-bootstrap";
import { registerAiClusterProfileRegistryApplication } from "@server/bootstrap/ai-cluster-profile-registry-bootstrap";
import { registerAiNodeProfileRegistryApplication } from "@server/bootstrap/ai-node-profile-registry-bootstrap";
import { registerAiServiceProfileRegistryApplication } from "@server/bootstrap/ai-service-profile-registry-bootstrap";
import { registerAiResourceProfileRegistryApplication } from "@server/bootstrap/ai-resource-profile-registry-bootstrap";
import { registerAiCapabilityProfileRegistryApplication } from "@server/bootstrap/ai-capability-profile-registry-bootstrap";
import { registerAiPolicyProfileRegistryApplication } from "@server/bootstrap/ai-policy-profile-registry-bootstrap";
import { registerAiComplianceProfileRegistryApplication } from "@server/bootstrap/ai-compliance-profile-registry-bootstrap";
import { registerAiGovernanceProfileRegistryApplication } from "@server/bootstrap/ai-governance-profile-registry-bootstrap";
import { registerAiAuditProfileRegistryApplication } from "@server/bootstrap/ai-audit-profile-registry-bootstrap";
import { registerAiRiskProfileRegistryApplication } from "@server/bootstrap/ai-risk-profile-registry-bootstrap";
import { registerAiReliabilityProfileRegistryApplication } from "@server/bootstrap/ai-reliability-profile-registry-bootstrap";
import { registerAiSafetyProfileRegistryApplication } from "@server/bootstrap/ai-safety-profile-registry-bootstrap";
import { registerAiPrivacyProfileRegistryApplication } from "@server/bootstrap/ai-privacy-profile-registry-bootstrap";
import { registerAiEthicsProfileRegistryApplication } from "@server/bootstrap/ai-ethics-profile-registry-bootstrap";
import { registerAiTransparencyProfileRegistryApplication } from "@server/bootstrap/ai-transparency-profile-registry-bootstrap";
import { registerAiExplainabilityProfileRegistryApplication } from "@server/bootstrap/ai-explainability-profile-registry-bootstrap";
import { registerAiFairnessProfileRegistryApplication } from "@server/bootstrap/ai-fairness-profile-registry-bootstrap";
import { registerAiAccountabilityProfileRegistryApplication } from "@server/bootstrap/ai-accountability-profile-registry-bootstrap";
import { registerAiTrustProfileRegistryApplication } from "@server/bootstrap/ai-trust-profile-registry-bootstrap";
import { registerAiComplianceRuleRegistryApplication } from "@server/bootstrap/ai-compliance-rule-registry-bootstrap";
import { registerAiGovernancePolicyRegistryApplication } from "@server/bootstrap/ai-governance-policy-registry-bootstrap";
import { registerAiRiskRuleRegistryApplication } from "@server/bootstrap/ai-risk-rule-registry-bootstrap";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";

/** Registers application use cases, dispatcher, and application services. */
export function registerApplication(registry: ServiceRegistry): void {
  registerPurchaseApplication(registry);
  registerOrderLifecycleApplication(registry);
  registerSellerProductApplication(registry);
  registerCustomerManagementApplication(registry);
  registerCatalogManagementApplication(registry);
  registerSearchManagementApplication(registry);
  registerFavoritesManagementApplication(registry);
  registerCartManagementApplication(registry);
  registerCheckoutManagementApplication(registry);
  registerOrderManagementApplication(registry);
  registerPaymentManagementApplication(registry);
  registerDeliveryManagementApplication(registry);
  registerWarehouseManagementApplication(registry);
  registerNotificationManagementApplication(registry);
  registerAnalyticsManagementApplication(registry);
  registerWorkflowOrchestrationApplication(registry);
  registerAuditManagementApplication(registry);
  registerAuthorizationManagementApplication(registry);
  registerAuthenticationManagementApplication(registry);
  registerIdempotencyManagementApplication(registry);
  registerConfigurationManagementApplication(registry);
  registerSchedulingManagementApplication(registry);
  registerHealthMonitoringManagementApplication(registry);
  registerLoggingManagementApplication(registry);
  registerMetricsManagementApplication(registry);
  registerSecretsManagementApplication(registry);
  registerEventBusManagementApplication(registry);
  registerPluginManagementApplication(registry);
  registerFeatureFlagManagementApplication(registry);
  registerRateLimitingManagementApplication(registry);
  registerCacheManagementApplication(registry);
  registerAiAgentGatewayApplication(registry);
  registerAiToolRegistryApplication(registry);
  registerAiCapabilityDiscoveryApplication(registry);
  registerAiActionSecurityApplication(registry);
  registerMcpServerApplication(registry);
  registerAiSemanticApiApplication(registry);
  registerAiCatalogMetadataApplication(registry);
  registerAiAgentSdkApplication(registry);
  registerAiAgentSandboxApplication(registry);
  registerAiAgentMonitoringApplication(registry);
  registerAiKnowledgeRegistryApplication(registry);
  registerAiMemoryManagementApplication(registry);
  registerAiPromptRegistryApplication(registry);
  registerAiConversationManagementApplication(registry);
  registerAiSessionManagementApplication(registry);
  registerAiContextManagementApplication(registry);
  registerAiModelRegistryApplication(registry);
  registerAiProviderRegistryApplication(registry);
  registerAiCapabilityRegistryApplication(registry);
  registerAiWorkflowRegistryApplication(registry);
  registerAiPolicyRegistryApplication(registry);
  registerAiResourceRegistryApplication(registry);
  registerAiTemplateRegistryApplication(registry);
  registerAiProfileRegistryApplication(registry);
  registerAiPersonaRegistryApplication(registry);
  registerAiSkillRegistryApplication(registry);
  registerAiStrategyRegistryApplication(registry);
  registerAiActionRegistryApplication(registry);
  registerAiCommandRegistryApplication(registry);
  registerAiWorkflowTemplateRegistryApplication(registry);
  registerAiDatasetRegistryApplication(registry);
  registerAiKnowledgeSourceRegistryApplication(registry);
  registerAiKnowledgePackageRegistryApplication(registry);
  registerAiEvaluationRegistryApplication(registry);
  registerAiBenchmarkRegistryApplication(registry);
  registerAiExperimentRegistryApplication(registry);
  registerAiScenarioRegistryApplication(registry);
  registerAiDatasetVersionRegistryApplication(registry);
  registerAiKnowledgeGraphRegistryApplication(registry);
  registerAiOntologyRegistryApplication(registry);
  registerAiTaxonomyRegistryApplication(registry);
  registerAiVocabularyRegistryApplication(registry);
  registerAiConceptRegistryApplication(registry);
  registerAiEntityRegistryApplication(registry);
  registerAiRelationRegistryApplication(registry);
  registerAiGraphRegistryApplication(registry);
  registerAiSchemaRegistryApplication(registry);
  registerAiConstraintRegistryApplication(registry);
  registerAiRuleRegistryApplication(registry);
  registerAiPolicySetRegistryApplication(registry);
  registerAiValidationProfileRegistryApplication(registry);
  registerAiExecutionProfileRegistryApplication(registry);
  registerAiRuntimeProfileRegistryApplication(registry);
  registerAiEnvironmentProfileRegistryApplication(registry);
  registerAiDeploymentProfileRegistryApplication(registry);
  registerAiExecutionEnvironmentRegistryApplication(registry);
  registerAiResourcePoolRegistryApplication(registry);
  registerAiInfrastructureProfileRegistryApplication(registry);
  registerAiComputeProfileRegistryApplication(registry);
  registerAiHardwareProfileRegistryApplication(registry);
  registerAiAcceleratorProfileRegistryApplication(registry);
  registerAiMemoryProfileRegistryApplication(registry);
  registerAiStorageProfileRegistryApplication(registry);
  registerAiNetworkProfileRegistryApplication(registry);
  registerAiSecurityProfileRegistryApplication(registry);
  registerAiClusterProfileRegistryApplication(registry);
  registerAiNodeProfileRegistryApplication(registry);
  registerAiServiceProfileRegistryApplication(registry);
  registerAiResourceProfileRegistryApplication(registry);
  registerAiCapabilityProfileRegistryApplication(registry);
  registerAiPolicyProfileRegistryApplication(registry);
  registerAiComplianceProfileRegistryApplication(registry);
  registerAiGovernanceProfileRegistryApplication(registry);
  registerAiAuditProfileRegistryApplication(registry);
  registerAiRiskProfileRegistryApplication(registry);
  registerAiReliabilityProfileRegistryApplication(registry);
  registerAiSafetyProfileRegistryApplication(registry);
  registerAiPrivacyProfileRegistryApplication(registry);
  registerAiEthicsProfileRegistryApplication(registry);
  registerAiTransparencyProfileRegistryApplication(registry);
  registerAiExplainabilityProfileRegistryApplication(registry);
  registerAiFairnessProfileRegistryApplication(registry);
  registerAiAccountabilityProfileRegistryApplication(registry);
  registerAiTrustProfileRegistryApplication(registry);
  registerAiComplianceRuleRegistryApplication(registry);
  registerAiGovernancePolicyRegistryApplication(registry);
  registerAiRiskRuleRegistryApplication(registry);
  registry.registerSingleton(
    InfrastructureTokens.DomainEventDispatcher,
    (provider) =>
      new DomainEventDispatcher(provider.resolve<IEventBus>(InfrastructureTokens.EventBus)),
  );

  registry.registerTransient(
    InfrastructureTokens.CreateOrderUseCase,
    (provider) =>
      new CreateOrderUseCase(
        provider.resolve<IOrderRepository>(InfrastructureTokens.OrderRepository),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
        provider.resolve<ITransactionManager>(InfrastructureTokens.TransactionManager),
        provider.resolve(InfrastructureTokens.DomainEventDispatcher),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.CreateProductUseCase,
    (provider) =>
      new CreateProductUseCase(
        provider.resolve<IProductRepository>(InfrastructureTokens.ProductRepository),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
        provider.resolve<ITransactionManager>(InfrastructureTokens.TransactionManager),
        provider.resolve(InfrastructureTokens.DomainEventDispatcher),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.RegisterSellerUseCase,
    (provider) =>
      new RegisterSellerUseCase(
        provider.resolve<ISellerRepository>(InfrastructureTokens.SellerRepository),
        provider.resolve<ITransactionManager>(InfrastructureTokens.TransactionManager),
        provider.resolve(InfrastructureTokens.DomainEventDispatcher),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.CreateCategoryUseCase,
    (provider) =>
      new CreateCategoryUseCase(
        provider.resolve<ICategoryRepository>(InfrastructureTokens.CategoryRepository),
        provider.resolve<ICatalogRepository>(InfrastructureTokens.CatalogRepository),
        provider.resolve<ITransactionManager>(InfrastructureTokens.TransactionManager),
        provider.resolve(InfrastructureTokens.DomainEventDispatcher),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.GetOrderUseCase,
    (provider) =>
      new GetOrderUseCase(provider.resolve<IOrderRepository>(InfrastructureTokens.OrderRepository)),
  );

  registry.registerTransient(
    InfrastructureTokens.GetProductUseCase,
    (provider) =>
      new GetProductUseCase(
        provider.resolve<IProductRepository>(InfrastructureTokens.ProductRepository),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.GetSellerUseCase,
    (provider) =>
      new GetSellerUseCase(
        provider.resolve<ISellerRepository>(InfrastructureTokens.SellerRepository),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.GetCatalogUseCase,
    (provider) =>
      new GetCatalogUseCase(
        provider.resolve<ICatalogRepository>(InfrastructureTokens.CatalogRepository),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.OrderApplicationService,
    (provider) =>
      new OrderApplicationService(
        provider.resolve(InfrastructureTokens.CreateOrderUseCase),
        provider.resolve(InfrastructureTokens.GetOrderUseCase),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.ProductApplicationService,
    (provider) =>
      new ProductApplicationService(
        provider.resolve(InfrastructureTokens.CreateProductUseCase),
        provider.resolve(InfrastructureTokens.GetProductUseCase),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.SellerApplicationService,
    (provider) =>
      new SellerApplicationService(
        provider.resolve(InfrastructureTokens.RegisterSellerUseCase),
        provider.resolve(InfrastructureTokens.GetSellerUseCase),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.CatalogApplicationService,
    (provider) =>
      new CatalogApplicationService(
        provider.resolve(InfrastructureTokens.CreateCategoryUseCase),
        provider.resolve(InfrastructureTokens.GetCatalogUseCase),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );
}
