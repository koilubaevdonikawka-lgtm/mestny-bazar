import {
  CatalogController,
  OrderController,
  ProductController,
  SellerController,
} from "@server/api/controllers";
import { registerApiIntegration, resolveIntegrationRoutes } from "@server/api/integration/bootstrap";
import {
  registerMarketplaceModules,
  resolveMarketplaceModulesRoutes,
} from "@server/api/modules/bootstrap";
import {
  PurchaseController,
  createPurchaseRoutes,
} from "@server/api/modules/purchase";
import { createDefaultMiddlewares } from "@server/api/middlewares";
import { createCatalogRoutes } from "@server/api/routes/catalog.routes";
import { createOrderRoutes } from "@server/api/routes/order.routes";
import { createProductRoutes } from "@server/api/routes/product.routes";
import { createSellerRoutes } from "@server/api/routes/seller.routes";
import { ApiServer } from "@server/api/server/api-server";
import type { ApiLogger } from "@server/api/server/api.types";
import { BootstrapTokens } from "@server/bootstrap/tokens";
import type {
  CatalogApplicationService,
  OrderApplicationService,
  ProductApplicationService,
  PurchaseApplicationService,
  SellerApplicationService,
} from "@server/application";
import {
  OrderLifecycleController,
  createOrderLifecycleRoutes,
} from "@server/api/modules/order-lifecycle";
import {
  SellerProductController,
  createSellerProductRoutes,
} from "@server/api/modules/seller-product";
import {
  CustomerManagementController,
  createCustomerManagementRoutes,
} from "@server/api/modules/customer-management";
import {
  CatalogManagementController,
  createCatalogManagementRoutes,
} from "@server/api/modules/catalog-management";
import {
  SearchManagementController,
  createSearchManagementRoutes,
} from "@server/api/modules/search-management";
import {
  FavoritesManagementController,
  createFavoritesManagementRoutes,
} from "@server/api/modules/favorites-management";
import {
  CartManagementController,
  createCartManagementRoutes,
} from "@server/api/modules/cart-management";
import {
  CheckoutManagementController,
  createCheckoutManagementRoutes,
} from "@server/api/modules/checkout-management";
import {
  OrderManagementController,
  createOrderManagementRoutes,
} from "@server/api/modules/order-management";
import {
  PaymentManagementController,
  createPaymentManagementRoutes,
} from "@server/api/modules/payment-management";
import {
  DeliveryManagementController,
  createDeliveryManagementRoutes,
} from "@server/api/modules/delivery-management";
import {
  WarehouseManagementController,
  createWarehouseManagementRoutes,
} from "@server/api/modules/warehouse-management";
import {
  NotificationManagementController,
  createNotificationManagementRoutes,
} from "@server/api/modules/notification-management";
import {
  AnalyticsManagementController,
  createAnalyticsManagementRoutes,
} from "@server/api/modules/analytics-management";
import {
  WorkflowOrchestrationController,
  createWorkflowOrchestrationRoutes,
} from "@server/api/modules/workflow-orchestration";
import {
  AuditManagementController,
  createAuditManagementRoutes,
} from "@server/api/modules/audit-management";
import {
  AuthorizationManagementController,
  createAuthorizationManagementRoutes,
} from "@server/api/modules/authorization-management";
import {
  AuthenticationManagementController,
  createAuthenticationManagementRoutes,
} from "@server/api/modules/authentication-management";
import {
  IdempotencyManagementController,
  createIdempotencyManagementRoutes,
} from "@server/api/modules/idempotency-management";
import {
  ConfigurationManagementController,
  createConfigurationManagementRoutes,
} from "@server/api/modules/configuration-management";
import {
  SchedulingManagementController,
  createSchedulingManagementRoutes,
} from "@server/api/modules/scheduling-management";
import {
  HealthMonitoringManagementController,
  createHealthMonitoringManagementRoutes,
} from "@server/api/modules/health-monitoring-management";
import {
  LoggingManagementController,
  createLoggingManagementRoutes,
} from "@server/api/modules/logging-management";
import {
  MetricsManagementController,
  createMetricsManagementRoutes,
} from "@server/api/modules/metrics-management";
import {
  SecretsManagementController,
  createSecretsManagementRoutes,
} from "@server/api/modules/secrets-management";
import {
  EventBusManagementController,
  createEventBusManagementRoutes,
} from "@server/api/modules/event-bus-management";
import {
  PluginManagementController,
  createPluginManagementRoutes,
} from "@server/api/modules/plugin-management";
import {
  FeatureFlagManagementController,
  createFeatureFlagManagementRoutes,
} from "@server/api/modules/feature-flag-management";
import {
  RateLimitingManagementController,
  createRateLimitingManagementRoutes,
} from "@server/api/modules/rate-limiting-management";
import {
  CacheManagementController,
  createCacheManagementRoutes,
} from "@server/api/modules/cache-management";
import {
  AiAgentGatewayController,
  createAiAgentGatewayRoutes,
} from "@server/api/modules/ai-agent-gateway";
import {
  AiToolRegistryController,
  createAiToolRegistryRoutes,
} from "@server/api/modules/ai-tool-registry";
import {
  AiCapabilityDiscoveryController,
  createAiCapabilityDiscoveryRoutes,
} from "@server/api/modules/ai-capability-discovery";
import {
  AiActionSecurityController,
  createAiActionSecurityRoutes,
} from "@server/api/modules/ai-action-security";
import { McpServerController, createMcpServerRoutes } from "@server/api/modules/mcp-server";
import {
  AiSemanticApiController,
  createAiSemanticApiRoutes,
} from "@server/api/modules/ai-semantic-api";
import {
  AiCatalogMetadataController,
  createAiCatalogMetadataRoutes,
} from "@server/api/modules/ai-catalog-metadata";
import {
  AiAgentSdkController,
  createAiAgentSdkRoutes,
} from "@server/api/modules/ai-agent-sdk";
import {
  AiAgentSandboxController,
  createAiAgentSandboxRoutes,
} from "@server/api/modules/ai-agent-sandbox";
import {
  AiAgentMonitoringController,
  createAiAgentMonitoringRoutes,
} from "@server/api/modules/ai-agent-monitoring";
import {
  AiKnowledgeRegistryController,
  createAiKnowledgeRegistryRoutes,
} from "@server/api/modules/ai-knowledge-registry";
import {
  AiMemoryManagementController,
  createAiMemoryManagementRoutes,
} from "@server/api/modules/ai-memory-management";
import {
  AiPromptRegistryController,
  createAiPromptRegistryRoutes,
} from "@server/api/modules/ai-prompt-registry";
import {
  AiConversationManagementController,
  createAiConversationManagementRoutes,
} from "@server/api/modules/ai-conversation-management";
import {
  AiSessionManagementController,
  createAiSessionManagementRoutes,
} from "@server/api/modules/ai-session-management";
import {
  AiContextManagementController,
  createAiContextManagementRoutes,
} from "@server/api/modules/ai-context-management";
import {
  AiModelRegistryController,
  createAiModelRegistryRoutes,
} from "@server/api/modules/ai-model-registry";
import {
  AiProviderRegistryController,
  createAiProviderRegistryRoutes,
} from "@server/api/modules/ai-provider-registry";
import {
  AiCapabilityRegistryController,
  createAiCapabilityRegistryRoutes,
} from "@server/api/modules/ai-capability-registry";
import {
  AiWorkflowRegistryController,
  createAiWorkflowRegistryRoutes,
} from "@server/api/modules/ai-workflow-registry";
import {
  AiPolicyRegistryController,
  createAiPolicyRegistryRoutes,
} from "@server/api/modules/ai-policy-registry";
import {
  AiResourceRegistryController,
  createAiResourceRegistryRoutes,
} from "@server/api/modules/ai-resource-registry";
import {
  AiTemplateRegistryController,
  createAiTemplateRegistryRoutes,
} from "@server/api/modules/ai-template-registry";
import {
  AiProfileRegistryController,
  createAiProfileRegistryRoutes,
} from "@server/api/modules/ai-profile-registry";
import {
  AiPersonaRegistryController,
  createAiPersonaRegistryRoutes,
} from "@server/api/modules/ai-persona-registry";
import {
  AiSkillRegistryController,
  createAiSkillRegistryRoutes,
} from "@server/api/modules/ai-skill-registry";
import {
  AiStrategyRegistryController,
  createAiStrategyRegistryRoutes,
} from "@server/api/modules/ai-strategy-registry";
import {
  AiActionRegistryController,
  createAiActionRegistryRoutes,
} from "@server/api/modules/ai-action-registry";
import {
  AiCommandRegistryController,
  createAiCommandRegistryRoutes,
} from "@server/api/modules/ai-command-registry";
import {
  AiWorkflowTemplateRegistryController,
  createAiWorkflowTemplateRegistryRoutes,
} from "@server/api/modules/ai-workflow-template-registry";
import {
  AiDatasetRegistryController,
  createAiDatasetRegistryRoutes,
} from "@server/api/modules/ai-dataset-registry";
import {
  AiKnowledgeSourceRegistryController,
  createAiKnowledgeSourceRegistryRoutes,
} from "@server/api/modules/ai-knowledge-source-registry";
import {
  AiKnowledgePackageRegistryController,
  createAiKnowledgePackageRegistryRoutes,
} from "@server/api/modules/ai-knowledge-package-registry";
import {
  AiEvaluationRegistryController,
  createAiEvaluationRegistryRoutes,
} from "@server/api/modules/ai-evaluation-registry";
import {
  AiBenchmarkRegistryController,
  createAiBenchmarkRegistryRoutes,
} from "@server/api/modules/ai-benchmark-registry";
import {
  AiExperimentRegistryController,
  createAiExperimentRegistryRoutes,
} from "@server/api/modules/ai-experiment-registry";
import {
  AiScenarioRegistryController,
  createAiScenarioRegistryRoutes,
} from "@server/api/modules/ai-scenario-registry";
import {
  AiDatasetVersionRegistryController,
  createAiDatasetVersionRegistryRoutes,
} from "@server/api/modules/ai-dataset-version-registry";
import {
  AiKnowledgeGraphRegistryController,
  createAiKnowledgeGraphRegistryRoutes,
} from "@server/api/modules/ai-knowledge-graph-registry";
import {
  AiOntologyRegistryController,
  createAiOntologyRegistryRoutes,
} from "@server/api/modules/ai-ontology-registry";
import {
  AiTaxonomyRegistryController,
  createAiTaxonomyRegistryRoutes,
} from "@server/api/modules/ai-taxonomy-registry";
import {
  AiVocabularyRegistryController,
  createAiVocabularyRegistryRoutes,
} from "@server/api/modules/ai-vocabulary-registry";
import {
  AiConceptRegistryController,
  createAiConceptRegistryRoutes,
} from "@server/api/modules/ai-concept-registry";
import {
  AiEntityRegistryController,
  createAiEntityRegistryRoutes,
} from "@server/api/modules/ai-entity-registry";
import {
  AiRelationRegistryController,
  createAiRelationRegistryRoutes,
} from "@server/api/modules/ai-relation-registry";
import {
  AiGraphRegistryController,
  createAiGraphRegistryRoutes,
} from "@server/api/modules/ai-graph-registry";
import {
  AiSchemaRegistryController,
  createAiSchemaRegistryRoutes,
} from "@server/api/modules/ai-schema-registry";
import {
  AiConstraintRegistryController,
  createAiConstraintRegistryRoutes,
} from "@server/api/modules/ai-constraint-registry";
import {
  AiRuleRegistryController,
  createAiRuleRegistryRoutes,
} from "@server/api/modules/ai-rule-registry";
import {
  AiPolicySetRegistryController,
  createAiPolicySetRegistryRoutes,
} from "@server/api/modules/ai-policy-set-registry";
import {
  AiValidationProfileRegistryController,
  createAiValidationProfileRegistryRoutes,
} from "@server/api/modules/ai-validation-profile-registry";
import {
  AiExecutionProfileRegistryController,
  createAiExecutionProfileRegistryRoutes,
} from "@server/api/modules/ai-execution-profile-registry";
import {
  AiRuntimeProfileRegistryController,
  createAiRuntimeProfileRegistryRoutes,
} from "@server/api/modules/ai-runtime-profile-registry";
import {
  AiEnvironmentProfileRegistryController,
  createAiEnvironmentProfileRegistryRoutes,
} from "@server/api/modules/ai-environment-profile-registry";
import {
  AiDeploymentProfileRegistryController,
  createAiDeploymentProfileRegistryRoutes,
} from "@server/api/modules/ai-deployment-profile-registry";
import {
  AiExecutionEnvironmentRegistryController,
  createAiExecutionEnvironmentRegistryRoutes,
} from "@server/api/modules/ai-execution-environment-registry";
import {
  AiResourcePoolRegistryController,
  createAiResourcePoolRegistryRoutes,
} from "@server/api/modules/ai-resource-pool-registry";
import {
  AiInfrastructureProfileRegistryController,
  createAiInfrastructureProfileRegistryRoutes,
} from "@server/api/modules/ai-infrastructure-profile-registry";
import {
  AiComputeProfileRegistryController,
  createAiComputeProfileRegistryRoutes,
} from "@server/api/modules/ai-compute-profile-registry";
import {
  AiHardwareProfileRegistryController,
  createAiHardwareProfileRegistryRoutes,
} from "@server/api/modules/ai-hardware-profile-registry";
import {
  AiAcceleratorProfileRegistryController,
  createAiAcceleratorProfileRegistryRoutes,
} from "@server/api/modules/ai-accelerator-profile-registry";
import {
  AiMemoryProfileRegistryController,
  createAiMemoryProfileRegistryRoutes,
} from "@server/api/modules/ai-memory-profile-registry";
import {
  AiStorageProfileRegistryController,
  createAiStorageProfileRegistryRoutes,
} from "@server/api/modules/ai-storage-profile-registry";
import {
  AiNetworkProfileRegistryController,
  createAiNetworkProfileRegistryRoutes,
} from "@server/api/modules/ai-network-profile-registry";
import {
  AiSecurityProfileRegistryController,
  createAiSecurityProfileRegistryRoutes,
} from "@server/api/modules/ai-security-profile-registry";
import {
  AiClusterProfileRegistryController,
  createAiClusterProfileRegistryRoutes,
} from "@server/api/modules/ai-cluster-profile-registry";
import {
  AiNodeProfileRegistryController,
  createAiNodeProfileRegistryRoutes,
} from "@server/api/modules/ai-node-profile-registry";
import {
  AiServiceProfileRegistryController,
  createAiServiceProfileRegistryRoutes,
} from "@server/api/modules/ai-service-profile-registry";
import {
  AiResourceProfileRegistryController,
  createAiResourceProfileRegistryRoutes,
} from "@server/api/modules/ai-resource-profile-registry";
import {
  AiCapabilityProfileRegistryController,
  createAiCapabilityProfileRegistryRoutes,
} from "@server/api/modules/ai-capability-profile-registry";
import {
  AiPolicyProfileRegistryController,
  createAiPolicyProfileRegistryRoutes,
} from "@server/api/modules/ai-policy-profile-registry";
import {
  AiComplianceProfileRegistryController,
  createAiComplianceProfileRegistryRoutes,
} from "@server/api/modules/ai-compliance-profile-registry";
import {
  AiGovernanceProfileRegistryController,
  createAiGovernanceProfileRegistryRoutes,
} from "@server/api/modules/ai-governance-profile-registry";
import {
  AiAuditProfileRegistryController,
  createAiAuditProfileRegistryRoutes,
} from "@server/api/modules/ai-audit-profile-registry";
import {
  AiRiskProfileRegistryController,
  createAiRiskProfileRegistryRoutes,
} from "@server/api/modules/ai-risk-profile-registry";
import {
  AiReliabilityProfileRegistryController,
  createAiReliabilityProfileRegistryRoutes,
} from "@server/api/modules/ai-reliability-profile-registry";
import {
  AiSafetyProfileRegistryController,
  createAiSafetyProfileRegistryRoutes,
} from "@server/api/modules/ai-safety-profile-registry";
import {
  AiPrivacyProfileRegistryController,
  createAiPrivacyProfileRegistryRoutes,
} from "@server/api/modules/ai-privacy-profile-registry";
import {
  AiEthicsProfileRegistryController,
  createAiEthicsProfileRegistryRoutes,
} from "@server/api/modules/ai-ethics-profile-registry";
import {
  AiTransparencyProfileRegistryController,
  createAiTransparencyProfileRegistryRoutes,
} from "@server/api/modules/ai-transparency-profile-registry";
import {
  AiExplainabilityProfileRegistryController,
  createAiExplainabilityProfileRegistryRoutes,
} from "@server/api/modules/ai-explainability-profile-registry";
import {
  AiFairnessProfileRegistryController,
  createAiFairnessProfileRegistryRoutes,
} from "@server/api/modules/ai-fairness-profile-registry";
import {
  AiAccountabilityProfileRegistryController,
  createAiAccountabilityProfileRegistryRoutes,
} from "@server/api/modules/ai-accountability-profile-registry";
import {
  AiTrustProfileRegistryController,
  createAiTrustProfileRegistryRoutes,
} from "@server/api/modules/ai-trust-profile-registry";
import {
  AiComplianceRuleRegistryController,
  createAiComplianceRuleRegistryRoutes,
} from "@server/api/modules/ai-compliance-rule-registry";
import {
  AiGovernancePolicyRegistryController,
  createAiGovernancePolicyRegistryRoutes,
} from "@server/api/modules/ai-governance-policy-registry";
import {
  AiRiskRuleRegistryController,
  createAiRiskRuleRegistryRoutes,
} from "@server/api/modules/ai-risk-rule-registry";
import type { OrderLifecycleApplicationService } from "@server/application/order-lifecycle/services/order-lifecycle-application.service";
import type { SellerProductApplicationService } from "@server/application/seller-product/services/seller-product-application.service";
import type { CustomerManagementApplicationService } from "@server/application/customer-management/services/customer-management-application.service";
import type { CatalogManagementApplicationService } from "@server/application/catalog-management/services/catalog-management-application.service";
import type { SearchManagementApplicationService } from "@server/application/search-management/services/search-management-application.service";
import type { FavoritesManagementApplicationService } from "@server/application/favorites-management/services/favorites-management-application.service";
import type { CartManagementApplicationService } from "@server/application/cart-management/services/cart-management-application.service";
import type { CheckoutManagementApplicationService } from "@server/application/checkout-management/services/checkout-management-application.service";
import type { OrderManagementApplicationService } from "@server/application/order-management/services/order-management-application.service";
import type { PaymentManagementApplicationService } from "@server/application/payment-management/services/payment-management-application.service";
import type { DeliveryManagementApplicationService } from "@server/application/delivery-management/services/delivery-management-application.service";
import type { WarehouseManagementApplicationService } from "@server/application/warehouse-management/services/warehouse-management-application.service";
import type { NotificationManagementApplicationService } from "@server/application/notification-management/services/notification-management-application.service";
import type { AnalyticsManagementApplicationService } from "@server/application/analytics-management/services/analytics-management-application.service";
import type { WorkflowOrchestrationApplicationService } from "@server/application/workflow-orchestration/services/workflow-orchestration-application.service";
import type { AuditManagementApplicationService } from "@server/application/audit-management/services/audit-management-application.service";
import type { AuthorizationManagementApplicationService } from "@server/application/authorization-management/services/authorization-management-application.service";
import type { AuthenticationManagementApplicationService } from "@server/application/authentication-management/services/authentication-management-application.service";
import type { IdempotencyManagementApplicationService } from "@server/application/idempotency-management/services/idempotency-management-application.service";
import type { ConfigurationManagementApplicationService } from "@server/application/configuration-management/services/configuration-management-application.service";
import type { SchedulingManagementApplicationService } from "@server/application/scheduling-management/services/scheduling-management-application.service";
import type { HealthMonitoringManagementApplicationService } from "@server/application/health-monitoring-management/services/health-monitoring-management-application.service";
import type { LoggingManagementApplicationService } from "@server/application/logging-management/services/logging-management-application.service";
import type { MetricsManagementApplicationService } from "@server/application/metrics-management/services/metrics-management-application.service";
import type { SecretsManagementApplicationService } from "@server/application/secrets-management/services/secrets-management-application.service";
import type { EventBusManagementApplicationService } from "@server/application/event-bus-management/services/event-bus-management-application.service";
import type { PluginManagementApplicationService } from "@server/application/plugin-management/services/plugin-management-application.service";
import type { FeatureFlagManagementApplicationService } from "@server/application/feature-flag-management/services/feature-flag-management-application.service";
import type { RateLimitingManagementApplicationService } from "@server/application/rate-limiting-management/services/rate-limiting-management-application.service";
import type { CacheManagementApplicationService } from "@server/application/cache-management/services/cache-management-application.service";
import type { AiAgentGatewayApplicationService } from "@server/application/ai-agent-gateway/services/ai-agent-gateway-application.service";
import type { AiToolRegistryApplicationService } from "@server/application/ai-tool-registry/services/ai-tool-registry-application.service";
import type { AiCapabilityDiscoveryApplicationService } from "@server/application/ai-capability-discovery/services/ai-capability-discovery-application.service";
import type { AiActionSecurityApplicationService } from "@server/application/ai-action-security/services/ai-action-security-application.service";
import type { McpServerApplicationService } from "@server/application/mcp-server/services/mcp-server-application.service";
import type { AiSemanticApiApplicationService } from "@server/application/ai-semantic-api/services/ai-semantic-api-application.service";
import type { AiCatalogMetadataApplicationService } from "@server/application/ai-catalog-metadata/services/ai-catalog-metadata-application.service";
import type { AiAgentSdkApplicationService } from "@server/application/ai-agent-sdk/services/ai-agent-sdk-application.service";
import type { AiAgentSandboxApplicationService } from "@server/application/ai-agent-sandbox/services/ai-agent-sandbox-application.service";
import type { AiAgentMonitoringApplicationService } from "@server/application/ai-agent-monitoring/services/ai-agent-monitoring-application.service";
import type { AiKnowledgeRegistryApplicationService } from "@server/application/ai-knowledge-registry/services/ai-knowledge-registry-application.service";
import type { AiMemoryManagementApplicationService } from "@server/application/ai-memory-management/services/ai-memory-management-application.service";
import type { AiPromptRegistryApplicationService } from "@server/application/ai-prompt-registry/services/ai-prompt-registry-application.service";
import type { AiConversationManagementApplicationService } from "@server/application/ai-conversation-management/services/ai-conversation-management-application.service";
import type { AiSessionManagementApplicationService } from "@server/application/ai-session-management/services/ai-session-management-application.service";
import type { AiContextManagementApplicationService } from "@server/application/ai-context-management/services/ai-context-management-application.service";
import type { AiModelRegistryApplicationService } from "@server/application/ai-model-registry/services/ai-model-registry-application.service";
import type { AiProviderRegistryApplicationService } from "@server/application/ai-provider-registry/services/ai-provider-registry-application.service";
import type { AiCapabilityRegistryApplicationService } from "@server/application/ai-capability-registry/services/ai-capability-registry-application.service";
import type { AiWorkflowRegistryApplicationService } from "@server/application/ai-workflow-registry/services/ai-workflow-registry-application.service";
import type { AiPolicyRegistryApplicationService } from "@server/application/ai-policy-registry/services/ai-policy-registry-application.service";
import type { AiResourceRegistryApplicationService } from "@server/application/ai-resource-registry/services/ai-resource-registry-application.service";
import type { AiTemplateRegistryApplicationService } from "@server/application/ai-template-registry/services/ai-template-registry-application.service";
import type { AiProfileRegistryApplicationService } from "@server/application/ai-profile-registry/services/ai-profile-registry-application.service";
import type { AiPersonaRegistryApplicationService } from "@server/application/ai-persona-registry/services/ai-persona-registry-application.service";
import type { AiSkillRegistryApplicationService } from "@server/application/ai-skill-registry/services/ai-skill-registry-application.service";
import type { AiStrategyRegistryApplicationService } from "@server/application/ai-strategy-registry/services/ai-strategy-registry-application.service";
import type { AiActionRegistryApplicationService } from "@server/application/ai-action-registry/services/ai-action-registry-application.service";
import type { AiCommandRegistryApplicationService } from "@server/application/ai-command-registry/services/ai-command-registry-application.service";
import type { AiWorkflowTemplateRegistryApplicationService } from "@server/application/ai-workflow-template-registry/services/ai-workflow-template-registry-application.service";
import type { AiDatasetRegistryApplicationService } from "@server/application/ai-dataset-registry/services/ai-dataset-registry-application.service";
import type { AiKnowledgeSourceRegistryApplicationService } from "@server/application/ai-knowledge-source-registry/services/ai-knowledge-source-registry-application.service";
import type { AiKnowledgePackageRegistryApplicationService } from "@server/application/ai-knowledge-package-registry/services/ai-knowledge-package-registry-application.service";
import type { AiEvaluationRegistryApplicationService } from "@server/application/ai-evaluation-registry/services/ai-evaluation-registry-application.service";
import type { AiBenchmarkRegistryApplicationService } from "@server/application/ai-benchmark-registry/services/ai-benchmark-registry-application.service";
import type { AiExperimentRegistryApplicationService } from "@server/application/ai-experiment-registry/services/ai-experiment-registry-application.service";
import type { AiScenarioRegistryApplicationService } from "@server/application/ai-scenario-registry/services/ai-scenario-registry-application.service";
import type { AiDatasetVersionRegistryApplicationService } from "@server/application/ai-dataset-version-registry/services/ai-dataset-version-registry-application.service";
import type { AiKnowledgeGraphRegistryApplicationService } from "@server/application/ai-knowledge-graph-registry/services/ai-knowledge-graph-registry-application.service";
import type { AiOntologyRegistryApplicationService } from "@server/application/ai-ontology-registry/services/ai-ontology-registry-application.service";
import type { AiTaxonomyRegistryApplicationService } from "@server/application/ai-taxonomy-registry/services/ai-taxonomy-registry-application.service";
import type { AiVocabularyRegistryApplicationService } from "@server/application/ai-vocabulary-registry/services/ai-vocabulary-registry-application.service";
import type { AiConceptRegistryApplicationService } from "@server/application/ai-concept-registry/services/ai-concept-registry-application.service";
import type { AiEntityRegistryApplicationService } from "@server/application/ai-entity-registry/services/ai-entity-registry-application.service";
import type { AiRelationRegistryApplicationService } from "@server/application/ai-relation-registry/services/ai-relation-registry-application.service";
import type { AiGraphRegistryApplicationService } from "@server/application/ai-graph-registry/services/ai-graph-registry-application.service";
import type { AiSchemaRegistryApplicationService } from "@server/application/ai-schema-registry/services/ai-schema-registry-application.service";
import type { AiConstraintRegistryApplicationService } from "@server/application/ai-constraint-registry/services/ai-constraint-registry-application.service";
import type { AiRuleRegistryApplicationService } from "@server/application/ai-rule-registry/services/ai-rule-registry-application.service";
import type { AiPolicySetRegistryApplicationService } from "@server/application/ai-policy-set-registry/services/ai-policy-set-registry-application.service";
import type { AiValidationProfileRegistryApplicationService } from "@server/application/ai-validation-profile-registry/services/ai-validation-profile-registry-application.service";
import type { AiExecutionProfileRegistryApplicationService } from "@server/application/ai-execution-profile-registry/services/ai-execution-profile-registry-application.service";
import type { AiRuntimeProfileRegistryApplicationService } from "@server/application/ai-runtime-profile-registry/services/ai-runtime-profile-registry-application.service";
import type { AiEnvironmentProfileRegistryApplicationService } from "@server/application/ai-environment-profile-registry/services/ai-environment-profile-registry-application.service";
import type { AiDeploymentProfileRegistryApplicationService } from "@server/application/ai-deployment-profile-registry/services/ai-deployment-profile-registry-application.service";
import type { AiExecutionEnvironmentRegistryApplicationService } from "@server/application/ai-execution-environment-registry/services/ai-execution-environment-registry-application.service";
import type { AiResourcePoolRegistryApplicationService } from "@server/application/ai-resource-pool-registry/services/ai-resource-pool-registry-application.service";
import type { AiInfrastructureProfileRegistryApplicationService } from "@server/application/ai-infrastructure-profile-registry/services/ai-infrastructure-profile-registry-application.service";
import type { AiComputeProfileRegistryApplicationService } from "@server/application/ai-compute-profile-registry/services/ai-compute-profile-registry-application.service";
import type { AiHardwareProfileRegistryApplicationService } from "@server/application/ai-hardware-profile-registry/services/ai-hardware-profile-registry-application.service";
import type { AiAcceleratorProfileRegistryApplicationService } from "@server/application/ai-accelerator-profile-registry/services/ai-accelerator-profile-registry-application.service";
import type { AiMemoryProfileRegistryApplicationService } from "@server/application/ai-memory-profile-registry/services/ai-memory-profile-registry-application.service";
import type { AiStorageProfileRegistryApplicationService } from "@server/application/ai-storage-profile-registry/services/ai-storage-profile-registry-application.service";
import type { AiNetworkProfileRegistryApplicationService } from "@server/application/ai-network-profile-registry/services/ai-network-profile-registry-application.service";
import type { AiSecurityProfileRegistryApplicationService } from "@server/application/ai-security-profile-registry/services/ai-security-profile-registry-application.service";
import type { AiClusterProfileRegistryApplicationService } from "@server/application/ai-cluster-profile-registry/services/ai-cluster-profile-registry-application.service";
import type { AiNodeProfileRegistryApplicationService } from "@server/application/ai-node-profile-registry/services/ai-node-profile-registry-application.service";
import type { AiServiceProfileRegistryApplicationService } from "@server/application/ai-service-profile-registry/services/ai-service-profile-registry-application.service";
import type { AiResourceProfileRegistryApplicationService } from "@server/application/ai-resource-profile-registry/services/ai-resource-profile-registry-application.service";
import type { AiCapabilityProfileRegistryApplicationService } from "@server/application/ai-capability-profile-registry/services/ai-capability-profile-registry-application.service";
import type { AiPolicyProfileRegistryApplicationService } from "@server/application/ai-policy-profile-registry/services/ai-policy-profile-registry-application.service";
import type { AiComplianceProfileRegistryApplicationService } from "@server/application/ai-compliance-profile-registry/services/ai-compliance-profile-registry-application.service";
import type { AiGovernanceProfileRegistryApplicationService } from "@server/application/ai-governance-profile-registry/services/ai-governance-profile-registry-application.service";
import type { AiAuditProfileRegistryApplicationService } from "@server/application/ai-audit-profile-registry/services/ai-audit-profile-registry-application.service";
import type { AiRiskProfileRegistryApplicationService } from "@server/application/ai-risk-profile-registry/services/ai-risk-profile-registry-application.service";
import type { AiReliabilityProfileRegistryApplicationService } from "@server/application/ai-reliability-profile-registry/services/ai-reliability-profile-registry-application.service";
import type { AiSafetyProfileRegistryApplicationService } from "@server/application/ai-safety-profile-registry/services/ai-safety-profile-registry-application.service";
import type { AiPrivacyProfileRegistryApplicationService } from "@server/application/ai-privacy-profile-registry/services/ai-privacy-profile-registry-application.service";
import type { AiEthicsProfileRegistryApplicationService } from "@server/application/ai-ethics-profile-registry/services/ai-ethics-profile-registry-application.service";
import type { AiTransparencyProfileRegistryApplicationService } from "@server/application/ai-transparency-profile-registry/services/ai-transparency-profile-registry-application.service";
import type { AiExplainabilityProfileRegistryApplicationService } from "@server/application/ai-explainability-profile-registry/services/ai-explainability-profile-registry-application.service";
import type { AiFairnessProfileRegistryApplicationService } from "@server/application/ai-fairness-profile-registry/services/ai-fairness-profile-registry-application.service";
import type { AiAccountabilityProfileRegistryApplicationService } from "@server/application/ai-accountability-profile-registry/services/ai-accountability-profile-registry-application.service";
import type { AiTrustProfileRegistryApplicationService } from "@server/application/ai-trust-profile-registry/services/ai-trust-profile-registry-application.service";
import type { AiComplianceRuleRegistryApplicationService } from "@server/application/ai-compliance-rule-registry/services/ai-compliance-rule-registry-application.service";
import type { AiGovernancePolicyRegistryApplicationService } from "@server/application/ai-governance-policy-registry/services/ai-governance-policy-registry-application.service";
import type { AiRiskRuleRegistryApplicationService } from "@server/application/ai-risk-rule-registry/services/ai-risk-rule-registry-application.service";
import type { OrderModule } from "@server/application/modules/order/order/api/order.module";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type { ILogger } from "@server/infrastructure/logging";

/** Bridges infrastructure logging to the API logger port. */
class InfrastructureApiLoggerAdapter implements ApiLogger {
  constructor(private readonly logger: ILogger) {}

  info(message: string, context: Record<string, unknown> = {}): void {
    this.logger.info(message, context);
  }

  warn(message: string, context: Record<string, unknown> = {}): void {
    this.logger.warn(message, context);
  }

  error(message: string, context: Record<string, unknown> = {}): void {
    this.logger.error(message, context);
  }
}

/** Registers API controllers, routes, middlewares, and ApiServer. */
export function registerApi(registry: ServiceRegistry): void {
  registerApiIntegration(registry);
  registerMarketplaceModules(registry);

  registry.registerSingleton(BootstrapTokens.ApiLogger, (provider) =>
    new InfrastructureApiLoggerAdapter(provider.resolve(InfrastructureTokens.Logger)),
  );

  registry.registerTransient(
    BootstrapTokens.ProductController,
    (provider) =>
      new ProductController(
        provider.resolve<ProductApplicationService>(InfrastructureTokens.ProductApplicationService),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.SellerController,
    (provider) =>
      new SellerController(
        provider.resolve<SellerApplicationService>(InfrastructureTokens.SellerApplicationService),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.CatalogController,
    (provider) =>
      new CatalogController(
        provider.resolve<CatalogApplicationService>(InfrastructureTokens.CatalogApplicationService),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.OrderController,
    (provider) =>
      new OrderController(
        provider.resolve<OrderApplicationService>(InfrastructureTokens.OrderApplicationService),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.PurchaseController,
    (provider) =>
      new PurchaseController(
        provider.resolve<PurchaseApplicationService>(InfrastructureTokens.PurchaseApplicationService),
        provider.resolve<OrderModule>(BootstrapTokens.OrderModule),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.OrderLifecycleController,
    (provider) =>
      new OrderLifecycleController(
        provider.resolve<OrderLifecycleApplicationService>(
          InfrastructureTokens.OrderLifecycleApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.SellerProductController,
    (provider) =>
      new SellerProductController(
        provider.resolve<SellerProductApplicationService>(
          InfrastructureTokens.SellerProductApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.CustomerManagementController,
    (provider) =>
      new CustomerManagementController(
        provider.resolve<CustomerManagementApplicationService>(
          InfrastructureTokens.CustomerManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.CatalogManagementController,
    (provider) =>
      new CatalogManagementController(
        provider.resolve<CatalogManagementApplicationService>(
          InfrastructureTokens.CatalogManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.SearchManagementController,
    (provider) =>
      new SearchManagementController(
        provider.resolve<SearchManagementApplicationService>(
          InfrastructureTokens.SearchManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.FavoritesManagementController,
    (provider) =>
      new FavoritesManagementController(
        provider.resolve<FavoritesManagementApplicationService>(
          InfrastructureTokens.FavoritesManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.CartManagementController,
    (provider) =>
      new CartManagementController(
        provider.resolve<CartManagementApplicationService>(
          InfrastructureTokens.CartManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.CheckoutManagementController,
    (provider) =>
      new CheckoutManagementController(
        provider.resolve<CheckoutManagementApplicationService>(
          InfrastructureTokens.CheckoutManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.OrderManagementController,
    (provider) =>
      new OrderManagementController(
        provider.resolve<OrderManagementApplicationService>(
          InfrastructureTokens.OrderManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.PaymentManagementController,
    (provider) =>
      new PaymentManagementController(
        provider.resolve<PaymentManagementApplicationService>(
          InfrastructureTokens.PaymentManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.DeliveryManagementController,
    (provider) =>
      new DeliveryManagementController(
        provider.resolve<DeliveryManagementApplicationService>(
          InfrastructureTokens.DeliveryManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.WarehouseManagementController,
    (provider) =>
      new WarehouseManagementController(
        provider.resolve<WarehouseManagementApplicationService>(
          InfrastructureTokens.WarehouseManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.NotificationManagementController,
    (provider) =>
      new NotificationManagementController(
        provider.resolve<NotificationManagementApplicationService>(
          InfrastructureTokens.NotificationManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AnalyticsManagementController,
    (provider) =>
      new AnalyticsManagementController(
        provider.resolve<AnalyticsManagementApplicationService>(
          InfrastructureTokens.AnalyticsManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.WorkflowOrchestrationController,
    (provider) =>
      new WorkflowOrchestrationController(
        provider.resolve<WorkflowOrchestrationApplicationService>(
          InfrastructureTokens.WorkflowOrchestrationApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AuditManagementController,
    (provider) =>
      new AuditManagementController(
        provider.resolve<AuditManagementApplicationService>(
          InfrastructureTokens.AuditManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AuthorizationManagementController,
    (provider) =>
      new AuthorizationManagementController(
        provider.resolve<AuthorizationManagementApplicationService>(
          InfrastructureTokens.AuthorizationManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AuthenticationManagementController,
    (provider) =>
      new AuthenticationManagementController(
        provider.resolve<AuthenticationManagementApplicationService>(
          InfrastructureTokens.AuthenticationManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.IdempotencyManagementController,
    (provider) =>
      new IdempotencyManagementController(
        provider.resolve<IdempotencyManagementApplicationService>(
          InfrastructureTokens.IdempotencyManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.ConfigurationManagementController,
    (provider) =>
      new ConfigurationManagementController(
        provider.resolve<ConfigurationManagementApplicationService>(
          InfrastructureTokens.ConfigurationManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.SchedulingManagementController,
    (provider) =>
      new SchedulingManagementController(
        provider.resolve<SchedulingManagementApplicationService>(
          InfrastructureTokens.SchedulingManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.HealthMonitoringManagementController,
    (provider) =>
      new HealthMonitoringManagementController(
        provider.resolve<HealthMonitoringManagementApplicationService>(
          InfrastructureTokens.HealthMonitoringManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.LoggingManagementController,
    (provider) =>
      new LoggingManagementController(
        provider.resolve<LoggingManagementApplicationService>(
          InfrastructureTokens.LoggingManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.MetricsManagementController,
    (provider) =>
      new MetricsManagementController(
        provider.resolve<MetricsManagementApplicationService>(
          InfrastructureTokens.MetricsManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.SecretsManagementController,
    (provider) =>
      new SecretsManagementController(
        provider.resolve<SecretsManagementApplicationService>(
          InfrastructureTokens.SecretsManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.EventBusManagementController,
    (provider) =>
      new EventBusManagementController(
        provider.resolve<EventBusManagementApplicationService>(
          InfrastructureTokens.EventBusManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.PluginManagementController,
    (provider) =>
      new PluginManagementController(
        provider.resolve<PluginManagementApplicationService>(
          InfrastructureTokens.PluginManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.FeatureFlagManagementController,
    (provider) =>
      new FeatureFlagManagementController(
        provider.resolve<FeatureFlagManagementApplicationService>(
          InfrastructureTokens.FeatureFlagManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.RateLimitingManagementController,
    (provider) =>
      new RateLimitingManagementController(
        provider.resolve<RateLimitingManagementApplicationService>(
          InfrastructureTokens.RateLimitingManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.CacheManagementController,
    (provider) =>
      new CacheManagementController(
        provider.resolve<CacheManagementApplicationService>(
          InfrastructureTokens.CacheManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiAgentGatewayController,
    (provider) =>
      new AiAgentGatewayController(
        provider.resolve<AiAgentGatewayApplicationService>(
          InfrastructureTokens.AiAgentGatewayApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiToolRegistryController,
    (provider) =>
      new AiToolRegistryController(
        provider.resolve<AiToolRegistryApplicationService>(
          InfrastructureTokens.AiToolRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiCapabilityDiscoveryController,
    (provider) =>
      new AiCapabilityDiscoveryController(
        provider.resolve<AiCapabilityDiscoveryApplicationService>(
          InfrastructureTokens.AiCapabilityDiscoveryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiActionSecurityController,
    (provider) =>
      new AiActionSecurityController(
        provider.resolve<AiActionSecurityApplicationService>(
          InfrastructureTokens.AiActionSecurityApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.McpServerController,
    (provider) =>
      new McpServerController(
        provider.resolve<McpServerApplicationService>(
          InfrastructureTokens.McpServerApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiSemanticApiController,
    (provider) =>
      new AiSemanticApiController(
        provider.resolve<AiSemanticApiApplicationService>(
          InfrastructureTokens.AiSemanticApiApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiCatalogMetadataController,
    (provider) =>
      new AiCatalogMetadataController(
        provider.resolve<AiCatalogMetadataApplicationService>(
          InfrastructureTokens.AiCatalogMetadataApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiAgentSdkController,
    (provider) =>
      new AiAgentSdkController(
        provider.resolve<AiAgentSdkApplicationService>(
          InfrastructureTokens.AiAgentSdkApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiAgentSandboxController,
    (provider) =>
      new AiAgentSandboxController(
        provider.resolve<AiAgentSandboxApplicationService>(
          InfrastructureTokens.AiAgentSandboxApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiAgentMonitoringController,
    (provider) =>
      new AiAgentMonitoringController(
        provider.resolve<AiAgentMonitoringApplicationService>(
          InfrastructureTokens.AiAgentMonitoringApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiKnowledgeRegistryController,
    (provider) =>
      new AiKnowledgeRegistryController(
        provider.resolve<AiKnowledgeRegistryApplicationService>(
          InfrastructureTokens.AiKnowledgeRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiMemoryManagementController,
    (provider) =>
      new AiMemoryManagementController(
        provider.resolve<AiMemoryManagementApplicationService>(
          InfrastructureTokens.AiMemoryManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiPromptRegistryController,
    (provider) =>
      new AiPromptRegistryController(
        provider.resolve<AiPromptRegistryApplicationService>(
          InfrastructureTokens.AiPromptRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiConversationManagementController,
    (provider) =>
      new AiConversationManagementController(
        provider.resolve<AiConversationManagementApplicationService>(
          InfrastructureTokens.AiConversationManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiSessionManagementController,
    (provider) =>
      new AiSessionManagementController(
        provider.resolve<AiSessionManagementApplicationService>(
          InfrastructureTokens.AiSessionManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiContextManagementController,
    (provider) =>
      new AiContextManagementController(
        provider.resolve<AiContextManagementApplicationService>(
          InfrastructureTokens.AiContextManagementApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiModelRegistryController,
    (provider) =>
      new AiModelRegistryController(
        provider.resolve<AiModelRegistryApplicationService>(
          InfrastructureTokens.AiModelRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiProviderRegistryController,
    (provider) =>
      new AiProviderRegistryController(
        provider.resolve<AiProviderRegistryApplicationService>(
          InfrastructureTokens.AiProviderRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiCapabilityRegistryController,
    (provider) =>
      new AiCapabilityRegistryController(
        provider.resolve<AiCapabilityRegistryApplicationService>(
          InfrastructureTokens.AiCapabilityRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiWorkflowRegistryController,
    (provider) =>
      new AiWorkflowRegistryController(
        provider.resolve<AiWorkflowRegistryApplicationService>(
          InfrastructureTokens.AiWorkflowRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiPolicyRegistryController,
    (provider) =>
      new AiPolicyRegistryController(
        provider.resolve<AiPolicyRegistryApplicationService>(
          InfrastructureTokens.AiPolicyRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiResourceRegistryController,
    (provider) =>
      new AiResourceRegistryController(
        provider.resolve<AiResourceRegistryApplicationService>(
          InfrastructureTokens.AiResourceRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiTemplateRegistryController,
    (provider) =>
      new AiTemplateRegistryController(
        provider.resolve<AiTemplateRegistryApplicationService>(
          InfrastructureTokens.AiTemplateRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiProfileRegistryController,
    (provider) =>
      new AiProfileRegistryController(
        provider.resolve<AiProfileRegistryApplicationService>(
          InfrastructureTokens.AiProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiPersonaRegistryController,
    (provider) =>
      new AiPersonaRegistryController(
        provider.resolve<AiPersonaRegistryApplicationService>(
          InfrastructureTokens.AiPersonaRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiSkillRegistryController,
    (provider) =>
      new AiSkillRegistryController(
        provider.resolve<AiSkillRegistryApplicationService>(
          InfrastructureTokens.AiSkillRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiStrategyRegistryController,
    (provider) =>
      new AiStrategyRegistryController(
        provider.resolve<AiStrategyRegistryApplicationService>(
          InfrastructureTokens.AiStrategyRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiActionRegistryController,
    (provider) =>
      new AiActionRegistryController(
        provider.resolve<AiActionRegistryApplicationService>(
          InfrastructureTokens.AiActionRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiCommandRegistryController,
    (provider) =>
      new AiCommandRegistryController(
        provider.resolve<AiCommandRegistryApplicationService>(
          InfrastructureTokens.AiCommandRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiWorkflowTemplateRegistryController,
    (provider) =>
      new AiWorkflowTemplateRegistryController(
        provider.resolve<AiWorkflowTemplateRegistryApplicationService>(
          InfrastructureTokens.AiWorkflowTemplateRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiDatasetRegistryController,
    (provider) =>
      new AiDatasetRegistryController(
        provider.resolve<AiDatasetRegistryApplicationService>(
          InfrastructureTokens.AiDatasetRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiKnowledgeSourceRegistryController,
    (provider) =>
      new AiKnowledgeSourceRegistryController(
        provider.resolve<AiKnowledgeSourceRegistryApplicationService>(
          InfrastructureTokens.AiKnowledgeSourceRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiKnowledgePackageRegistryController,
    (provider) =>
      new AiKnowledgePackageRegistryController(
        provider.resolve<AiKnowledgePackageRegistryApplicationService>(
          InfrastructureTokens.AiKnowledgePackageRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiEvaluationRegistryController,
    (provider) =>
      new AiEvaluationRegistryController(
        provider.resolve<AiEvaluationRegistryApplicationService>(
          InfrastructureTokens.AiEvaluationRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiBenchmarkRegistryController,
    (provider) =>
      new AiBenchmarkRegistryController(
        provider.resolve<AiBenchmarkRegistryApplicationService>(
          InfrastructureTokens.AiBenchmarkRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiExperimentRegistryController,
    (provider) =>
      new AiExperimentRegistryController(
        provider.resolve<AiExperimentRegistryApplicationService>(
          InfrastructureTokens.AiExperimentRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiScenarioRegistryController,
    (provider) =>
      new AiScenarioRegistryController(
        provider.resolve<AiScenarioRegistryApplicationService>(
          InfrastructureTokens.AiScenarioRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiDatasetVersionRegistryController,
    (provider) =>
      new AiDatasetVersionRegistryController(
        provider.resolve<AiDatasetVersionRegistryApplicationService>(
          InfrastructureTokens.AiDatasetVersionRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiKnowledgeGraphRegistryController,
    (provider) =>
      new AiKnowledgeGraphRegistryController(
        provider.resolve<AiKnowledgeGraphRegistryApplicationService>(
          InfrastructureTokens.AiKnowledgeGraphRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiOntologyRegistryController,
    (provider) =>
      new AiOntologyRegistryController(
        provider.resolve<AiOntologyRegistryApplicationService>(
          InfrastructureTokens.AiOntologyRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiTaxonomyRegistryController,
    (provider) =>
      new AiTaxonomyRegistryController(
        provider.resolve<AiTaxonomyRegistryApplicationService>(
          InfrastructureTokens.AiTaxonomyRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiVocabularyRegistryController,
    (provider) =>
      new AiVocabularyRegistryController(
        provider.resolve<AiVocabularyRegistryApplicationService>(
          InfrastructureTokens.AiVocabularyRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiConceptRegistryController,
    (provider) =>
      new AiConceptRegistryController(
        provider.resolve<AiConceptRegistryApplicationService>(
          InfrastructureTokens.AiConceptRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiEntityRegistryController,
    (provider) =>
      new AiEntityRegistryController(
        provider.resolve<AiEntityRegistryApplicationService>(
          InfrastructureTokens.AiEntityRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiRelationRegistryController,
    (provider) =>
      new AiRelationRegistryController(
        provider.resolve<AiRelationRegistryApplicationService>(
          InfrastructureTokens.AiRelationRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiGraphRegistryController,
    (provider) =>
      new AiGraphRegistryController(
        provider.resolve<AiGraphRegistryApplicationService>(
          InfrastructureTokens.AiGraphRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiSchemaRegistryController,
    (provider) =>
      new AiSchemaRegistryController(
        provider.resolve<AiSchemaRegistryApplicationService>(
          InfrastructureTokens.AiSchemaRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiConstraintRegistryController,
    (provider) =>
      new AiConstraintRegistryController(
        provider.resolve<AiConstraintRegistryApplicationService>(
          InfrastructureTokens.AiConstraintRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiRuleRegistryController,
    (provider) =>
      new AiRuleRegistryController(
        provider.resolve<AiRuleRegistryApplicationService>(
          InfrastructureTokens.AiRuleRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiPolicySetRegistryController,
    (provider) =>
      new AiPolicySetRegistryController(
        provider.resolve<AiPolicySetRegistryApplicationService>(
          InfrastructureTokens.AiPolicySetRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiValidationProfileRegistryController,
    (provider) =>
      new AiValidationProfileRegistryController(
        provider.resolve<AiValidationProfileRegistryApplicationService>(
          InfrastructureTokens.AiValidationProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiExecutionProfileRegistryController,
    (provider) =>
      new AiExecutionProfileRegistryController(
        provider.resolve<AiExecutionProfileRegistryApplicationService>(
          InfrastructureTokens.AiExecutionProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiRuntimeProfileRegistryController,
    (provider) =>
      new AiRuntimeProfileRegistryController(
        provider.resolve<AiRuntimeProfileRegistryApplicationService>(
          InfrastructureTokens.AiRuntimeProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiEnvironmentProfileRegistryController,
    (provider) =>
      new AiEnvironmentProfileRegistryController(
        provider.resolve<AiEnvironmentProfileRegistryApplicationService>(
          InfrastructureTokens.AiEnvironmentProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiDeploymentProfileRegistryController,
    (provider) =>
      new AiDeploymentProfileRegistryController(
        provider.resolve<AiDeploymentProfileRegistryApplicationService>(
          InfrastructureTokens.AiDeploymentProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiExecutionEnvironmentRegistryController,
    (provider) =>
      new AiExecutionEnvironmentRegistryController(
        provider.resolve<AiExecutionEnvironmentRegistryApplicationService>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiResourcePoolRegistryController,
    (provider) =>
      new AiResourcePoolRegistryController(
        provider.resolve<AiResourcePoolRegistryApplicationService>(
          InfrastructureTokens.AiResourcePoolRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiInfrastructureProfileRegistryController,
    (provider) =>
      new AiInfrastructureProfileRegistryController(
        provider.resolve<AiInfrastructureProfileRegistryApplicationService>(
          InfrastructureTokens.AiInfrastructureProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiComputeProfileRegistryController,
    (provider) =>
      new AiComputeProfileRegistryController(
        provider.resolve<AiComputeProfileRegistryApplicationService>(
          InfrastructureTokens.AiComputeProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiHardwareProfileRegistryController,
    (provider) =>
      new AiHardwareProfileRegistryController(
        provider.resolve<AiHardwareProfileRegistryApplicationService>(
          InfrastructureTokens.AiHardwareProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiAcceleratorProfileRegistryController,
    (provider) =>
      new AiAcceleratorProfileRegistryController(
        provider.resolve<AiAcceleratorProfileRegistryApplicationService>(
          InfrastructureTokens.AiAcceleratorProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiMemoryProfileRegistryController,
    (provider) =>
      new AiMemoryProfileRegistryController(
        provider.resolve<AiMemoryProfileRegistryApplicationService>(
          InfrastructureTokens.AiMemoryProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiStorageProfileRegistryController,
    (provider) =>
      new AiStorageProfileRegistryController(
        provider.resolve<AiStorageProfileRegistryApplicationService>(
          InfrastructureTokens.AiStorageProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiNetworkProfileRegistryController,
    (provider) =>
      new AiNetworkProfileRegistryController(
        provider.resolve<AiNetworkProfileRegistryApplicationService>(
          InfrastructureTokens.AiNetworkProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiSecurityProfileRegistryController,
    (provider) =>
      new AiSecurityProfileRegistryController(
        provider.resolve<AiSecurityProfileRegistryApplicationService>(
          InfrastructureTokens.AiSecurityProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiClusterProfileRegistryController,
    (provider) =>
      new AiClusterProfileRegistryController(
        provider.resolve<AiClusterProfileRegistryApplicationService>(
          InfrastructureTokens.AiClusterProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiNodeProfileRegistryController,
    (provider) =>
      new AiNodeProfileRegistryController(
        provider.resolve<AiNodeProfileRegistryApplicationService>(
          InfrastructureTokens.AiNodeProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiServiceProfileRegistryController,
    (provider) =>
      new AiServiceProfileRegistryController(
        provider.resolve<AiServiceProfileRegistryApplicationService>(
          InfrastructureTokens.AiServiceProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiResourceProfileRegistryController,
    (provider) =>
      new AiResourceProfileRegistryController(
        provider.resolve<AiResourceProfileRegistryApplicationService>(
          InfrastructureTokens.AiResourceProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiCapabilityProfileRegistryController,
    (provider) =>
      new AiCapabilityProfileRegistryController(
        provider.resolve<AiCapabilityProfileRegistryApplicationService>(
          InfrastructureTokens.AiCapabilityProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiPolicyProfileRegistryController,
    (provider) =>
      new AiPolicyProfileRegistryController(
        provider.resolve<AiPolicyProfileRegistryApplicationService>(
          InfrastructureTokens.AiPolicyProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiComplianceProfileRegistryController,
    (provider) =>
      new AiComplianceProfileRegistryController(
        provider.resolve<AiComplianceProfileRegistryApplicationService>(
          InfrastructureTokens.AiComplianceProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiGovernanceProfileRegistryController,
    (provider) =>
      new AiGovernanceProfileRegistryController(
        provider.resolve<AiGovernanceProfileRegistryApplicationService>(
          InfrastructureTokens.AiGovernanceProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiAuditProfileRegistryController,
    (provider) =>
      new AiAuditProfileRegistryController(
        provider.resolve<AiAuditProfileRegistryApplicationService>(
          InfrastructureTokens.AiAuditProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiRiskProfileRegistryController,
    (provider) =>
      new AiRiskProfileRegistryController(
        provider.resolve<AiRiskProfileRegistryApplicationService>(
          InfrastructureTokens.AiRiskProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiReliabilityProfileRegistryController,
    (provider) =>
      new AiReliabilityProfileRegistryController(
        provider.resolve<AiReliabilityProfileRegistryApplicationService>(
          InfrastructureTokens.AiReliabilityProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiSafetyProfileRegistryController,
    (provider) =>
      new AiSafetyProfileRegistryController(
        provider.resolve<AiSafetyProfileRegistryApplicationService>(
          InfrastructureTokens.AiSafetyProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiPrivacyProfileRegistryController,
    (provider) =>
      new AiPrivacyProfileRegistryController(
        provider.resolve<AiPrivacyProfileRegistryApplicationService>(
          InfrastructureTokens.AiPrivacyProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiEthicsProfileRegistryController,
    (provider) =>
      new AiEthicsProfileRegistryController(
        provider.resolve<AiEthicsProfileRegistryApplicationService>(
          InfrastructureTokens.AiEthicsProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiTransparencyProfileRegistryController,
    (provider) =>
      new AiTransparencyProfileRegistryController(
        provider.resolve<AiTransparencyProfileRegistryApplicationService>(
          InfrastructureTokens.AiTransparencyProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiExplainabilityProfileRegistryController,
    (provider) =>
      new AiExplainabilityProfileRegistryController(
        provider.resolve<AiExplainabilityProfileRegistryApplicationService>(
          InfrastructureTokens.AiExplainabilityProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiFairnessProfileRegistryController,
    (provider) =>
      new AiFairnessProfileRegistryController(
        provider.resolve<AiFairnessProfileRegistryApplicationService>(
          InfrastructureTokens.AiFairnessProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiAccountabilityProfileRegistryController,
    (provider) =>
      new AiAccountabilityProfileRegistryController(
        provider.resolve<AiAccountabilityProfileRegistryApplicationService>(
          InfrastructureTokens.AiAccountabilityProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiTrustProfileRegistryController,
    (provider) =>
      new AiTrustProfileRegistryController(
        provider.resolve<AiTrustProfileRegistryApplicationService>(
          InfrastructureTokens.AiTrustProfileRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiComplianceRuleRegistryController,
    (provider) =>
      new AiComplianceRuleRegistryController(
        provider.resolve<AiComplianceRuleRegistryApplicationService>(
          InfrastructureTokens.AiComplianceRuleRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiGovernancePolicyRegistryController,
    (provider) =>
      new AiGovernancePolicyRegistryController(
        provider.resolve<AiGovernancePolicyRegistryApplicationService>(
          InfrastructureTokens.AiGovernancePolicyRegistryApplicationService,
        ),
      ),
  );

  registry.registerTransient(
    BootstrapTokens.AiRiskRuleRegistryController,
    (provider) =>
      new AiRiskRuleRegistryController(
        provider.resolve<AiRiskRuleRegistryApplicationService>(
          InfrastructureTokens.AiRiskRuleRegistryApplicationService,
        ),
      ),
  );

  registry.registerSingleton(BootstrapTokens.ApiServer, (provider) => {
    const logger = provider.resolve<ApiLogger>(BootstrapTokens.ApiLogger);
    const productController = provider.resolve(BootstrapTokens.ProductController);
    const sellerController = provider.resolve(BootstrapTokens.SellerController);
    const catalogController = provider.resolve(BootstrapTokens.CatalogController);
    const orderController = provider.resolve(BootstrapTokens.OrderController);
    const purchaseController = provider.resolve(BootstrapTokens.PurchaseController);
    const orderLifecycleController = provider.resolve(BootstrapTokens.OrderLifecycleController);
    const sellerProductController = provider.resolve(BootstrapTokens.SellerProductController);
    const customerManagementController = provider.resolve(BootstrapTokens.CustomerManagementController);
    const catalogManagementController = provider.resolve(BootstrapTokens.CatalogManagementController);
    const searchManagementController = provider.resolve(BootstrapTokens.SearchManagementController);
    const favoritesManagementController = provider.resolve(BootstrapTokens.FavoritesManagementController);
    const cartManagementController = provider.resolve(BootstrapTokens.CartManagementController);
    const checkoutManagementController = provider.resolve(BootstrapTokens.CheckoutManagementController);
    const orderManagementController = provider.resolve(BootstrapTokens.OrderManagementController);
    const paymentManagementController = provider.resolve(BootstrapTokens.PaymentManagementController);
    const deliveryManagementController = provider.resolve(BootstrapTokens.DeliveryManagementController);
    const warehouseManagementController = provider.resolve(BootstrapTokens.WarehouseManagementController);
    const notificationManagementController = provider.resolve(
      BootstrapTokens.NotificationManagementController,
    );
    const analyticsManagementController = provider.resolve(
      BootstrapTokens.AnalyticsManagementController,
    );
    const workflowOrchestrationController = provider.resolve(
      BootstrapTokens.WorkflowOrchestrationController,
    );
    const auditManagementController = provider.resolve(
      BootstrapTokens.AuditManagementController,
    );
    const authorizationManagementController = provider.resolve(
      BootstrapTokens.AuthorizationManagementController,
    );
    const authenticationManagementController = provider.resolve(
      BootstrapTokens.AuthenticationManagementController,
    );
    const idempotencyManagementController = provider.resolve(
      BootstrapTokens.IdempotencyManagementController,
    );
    const configurationManagementController = provider.resolve(
      BootstrapTokens.ConfigurationManagementController,
    );
    const schedulingManagementController = provider.resolve(
      BootstrapTokens.SchedulingManagementController,
    );
    const healthMonitoringManagementController = provider.resolve(
      BootstrapTokens.HealthMonitoringManagementController,
    );
    const loggingManagementController = provider.resolve(
      BootstrapTokens.LoggingManagementController,
    );
    const metricsManagementController = provider.resolve(
      BootstrapTokens.MetricsManagementController,
    );
    const secretsManagementController = provider.resolve(
      BootstrapTokens.SecretsManagementController,
    );
    const eventBusManagementController = provider.resolve(
      BootstrapTokens.EventBusManagementController,
    );
    const pluginManagementController = provider.resolve(
      BootstrapTokens.PluginManagementController,
    );
    const featureFlagManagementController = provider.resolve(
      BootstrapTokens.FeatureFlagManagementController,
    );
    const rateLimitingManagementController = provider.resolve(
      BootstrapTokens.RateLimitingManagementController,
    );
    const cacheManagementController = provider.resolve(
      BootstrapTokens.CacheManagementController,
    );
    const aiAgentGatewayController = provider.resolve(
      BootstrapTokens.AiAgentGatewayController,
    );
    const aiToolRegistryController = provider.resolve(
      BootstrapTokens.AiToolRegistryController,
    );
    const aiCapabilityDiscoveryController = provider.resolve(
      BootstrapTokens.AiCapabilityDiscoveryController,
    );
    const aiActionSecurityController = provider.resolve(
      BootstrapTokens.AiActionSecurityController,
    );
    const mcpServerController = provider.resolve(BootstrapTokens.McpServerController);
    const aiSemanticApiController = provider.resolve(BootstrapTokens.AiSemanticApiController);
    const aiCatalogMetadataController = provider.resolve(BootstrapTokens.AiCatalogMetadataController);
    const aiAgentSdkController = provider.resolve(BootstrapTokens.AiAgentSdkController);
    const aiAgentSandboxController = provider.resolve(BootstrapTokens.AiAgentSandboxController);
    const aiAgentMonitoringController = provider.resolve(BootstrapTokens.AiAgentMonitoringController);
    const aiKnowledgeRegistryController = provider.resolve(BootstrapTokens.AiKnowledgeRegistryController);
    const aiMemoryManagementController = provider.resolve(BootstrapTokens.AiMemoryManagementController);
    const aiPromptRegistryController = provider.resolve(BootstrapTokens.AiPromptRegistryController);
    const aiConversationManagementController = provider.resolve(
      BootstrapTokens.AiConversationManagementController,
    );
    const aiSessionManagementController = provider.resolve(
      BootstrapTokens.AiSessionManagementController,
    );
    const aiContextManagementController = provider.resolve(
      BootstrapTokens.AiContextManagementController,
    );
    const aiModelRegistryController = provider.resolve(BootstrapTokens.AiModelRegistryController);
    const aiProviderRegistryController = provider.resolve(
      BootstrapTokens.AiProviderRegistryController,
    );
    const aiCapabilityRegistryController = provider.resolve(
      BootstrapTokens.AiCapabilityRegistryController,
    );
    const aiWorkflowRegistryController = provider.resolve(
      BootstrapTokens.AiWorkflowRegistryController,
    );
    const aiPolicyRegistryController = provider.resolve(
      BootstrapTokens.AiPolicyRegistryController,
    );
    const aiResourceRegistryController = provider.resolve(
      BootstrapTokens.AiResourceRegistryController,
    );
    const aiTemplateRegistryController = provider.resolve(
      BootstrapTokens.AiTemplateRegistryController,
    );
    const aiProfileRegistryController = provider.resolve(
      BootstrapTokens.AiProfileRegistryController,
    );
    const aiPersonaRegistryController = provider.resolve(
      BootstrapTokens.AiPersonaRegistryController,
    );
    const aiSkillRegistryController = provider.resolve(
      BootstrapTokens.AiSkillRegistryController,
    );
    const aiStrategyRegistryController = provider.resolve(
      BootstrapTokens.AiStrategyRegistryController,
    );
    const aiActionRegistryController = provider.resolve(
      BootstrapTokens.AiActionRegistryController,
    );
    const aiCommandRegistryController = provider.resolve(
      BootstrapTokens.AiCommandRegistryController,
    );
    const aiWorkflowTemplateRegistryController = provider.resolve(
      BootstrapTokens.AiWorkflowTemplateRegistryController,
    );
    const aiDatasetRegistryController = provider.resolve(
      BootstrapTokens.AiDatasetRegistryController,
    );
    const aiKnowledgeSourceRegistryController = provider.resolve(
      BootstrapTokens.AiKnowledgeSourceRegistryController,
    );
    const aiKnowledgePackageRegistryController = provider.resolve(
      BootstrapTokens.AiKnowledgePackageRegistryController,
    );
    const aiEvaluationRegistryController = provider.resolve(
      BootstrapTokens.AiEvaluationRegistryController,
    );
    const aiBenchmarkRegistryController = provider.resolve(
      BootstrapTokens.AiBenchmarkRegistryController,
    );
    const aiExperimentRegistryController = provider.resolve(
      BootstrapTokens.AiExperimentRegistryController,
    );
    const aiScenarioRegistryController = provider.resolve(
      BootstrapTokens.AiScenarioRegistryController,
    );
    const aiDatasetVersionRegistryController = provider.resolve(
      BootstrapTokens.AiDatasetVersionRegistryController,
    );
    const aiKnowledgeGraphRegistryController = provider.resolve(
      BootstrapTokens.AiKnowledgeGraphRegistryController,
    );
    const aiOntologyRegistryController = provider.resolve(
      BootstrapTokens.AiOntologyRegistryController,
    );
    const aiTaxonomyRegistryController = provider.resolve(
      BootstrapTokens.AiTaxonomyRegistryController,
    );
    const aiVocabularyRegistryController = provider.resolve(
      BootstrapTokens.AiVocabularyRegistryController,
    );
    const aiConceptRegistryController = provider.resolve(
      BootstrapTokens.AiConceptRegistryController,
    );
    const aiEntityRegistryController = provider.resolve(
      BootstrapTokens.AiEntityRegistryController,
    );
    const aiRelationRegistryController = provider.resolve(
      BootstrapTokens.AiRelationRegistryController,
    );
    const aiGraphRegistryController = provider.resolve(
      BootstrapTokens.AiGraphRegistryController,
    );
    const aiSchemaRegistryController = provider.resolve(
      BootstrapTokens.AiSchemaRegistryController,
    );
    const aiConstraintRegistryController = provider.resolve(
      BootstrapTokens.AiConstraintRegistryController,
    );
    const aiRuleRegistryController = provider.resolve(
      BootstrapTokens.AiRuleRegistryController,
    );
    const aiPolicySetRegistryController = provider.resolve(
      BootstrapTokens.AiPolicySetRegistryController,
    );
    const aiValidationProfileRegistryController = provider.resolve(
      BootstrapTokens.AiValidationProfileRegistryController,
    );
    const aiExecutionProfileRegistryController = provider.resolve(
      BootstrapTokens.AiExecutionProfileRegistryController,
    );
    const aiRuntimeProfileRegistryController = provider.resolve(
      BootstrapTokens.AiRuntimeProfileRegistryController,
    );
    const aiEnvironmentProfileRegistryController = provider.resolve(
      BootstrapTokens.AiEnvironmentProfileRegistryController,
    );
    const aiDeploymentProfileRegistryController = provider.resolve(
      BootstrapTokens.AiDeploymentProfileRegistryController,
    );
    const aiExecutionEnvironmentRegistryController = provider.resolve(
      BootstrapTokens.AiExecutionEnvironmentRegistryController,
    );
    const aiResourcePoolRegistryController = provider.resolve(
      BootstrapTokens.AiResourcePoolRegistryController,
    );
    const aiInfrastructureProfileRegistryController = provider.resolve(
      BootstrapTokens.AiInfrastructureProfileRegistryController,
    );
    const aiComputeProfileRegistryController = provider.resolve(
      BootstrapTokens.AiComputeProfileRegistryController,
    );
    const aiHardwareProfileRegistryController = provider.resolve(
      BootstrapTokens.AiHardwareProfileRegistryController,
    );
    const aiAcceleratorProfileRegistryController = provider.resolve(
      BootstrapTokens.AiAcceleratorProfileRegistryController,
    );
    const aiMemoryProfileRegistryController = provider.resolve(
      BootstrapTokens.AiMemoryProfileRegistryController,
    );
    const aiStorageProfileRegistryController = provider.resolve(
      BootstrapTokens.AiStorageProfileRegistryController,
    );
    const aiNetworkProfileRegistryController = provider.resolve(
      BootstrapTokens.AiNetworkProfileRegistryController,
    );
    const aiSecurityProfileRegistryController = provider.resolve(
      BootstrapTokens.AiSecurityProfileRegistryController,
    );
    const aiClusterProfileRegistryController = provider.resolve(
      BootstrapTokens.AiClusterProfileRegistryController,
    );
    const aiNodeProfileRegistryController = provider.resolve(
      BootstrapTokens.AiNodeProfileRegistryController,
    );
    const aiServiceProfileRegistryController = provider.resolve(
      BootstrapTokens.AiServiceProfileRegistryController,
    );
    const aiResourceProfileRegistryController = provider.resolve(
      BootstrapTokens.AiResourceProfileRegistryController,
    );
    const aiCapabilityProfileRegistryController = provider.resolve(
      BootstrapTokens.AiCapabilityProfileRegistryController,
    );
    const aiPolicyProfileRegistryController = provider.resolve(
      BootstrapTokens.AiPolicyProfileRegistryController,
    );
    const aiComplianceProfileRegistryController = provider.resolve(
      BootstrapTokens.AiComplianceProfileRegistryController,
    );
    const aiGovernanceProfileRegistryController = provider.resolve(
      BootstrapTokens.AiGovernanceProfileRegistryController,
    );
    const aiAuditProfileRegistryController = provider.resolve(
      BootstrapTokens.AiAuditProfileRegistryController,
    );
    const aiRiskProfileRegistryController = provider.resolve(
      BootstrapTokens.AiRiskProfileRegistryController,
    );
    const aiReliabilityProfileRegistryController = provider.resolve(
      BootstrapTokens.AiReliabilityProfileRegistryController,
    );
    const aiSafetyProfileRegistryController = provider.resolve(
      BootstrapTokens.AiSafetyProfileRegistryController,
    );
    const aiPrivacyProfileRegistryController = provider.resolve(
      BootstrapTokens.AiPrivacyProfileRegistryController,
    );
    const aiEthicsProfileRegistryController = provider.resolve(
      BootstrapTokens.AiEthicsProfileRegistryController,
    );
    const aiTransparencyProfileRegistryController = provider.resolve(
      BootstrapTokens.AiTransparencyProfileRegistryController,
    );
    const aiExplainabilityProfileRegistryController = provider.resolve(
      BootstrapTokens.AiExplainabilityProfileRegistryController,
    );
    const aiFairnessProfileRegistryController = provider.resolve(
      BootstrapTokens.AiFairnessProfileRegistryController,
    );
    const aiAccountabilityProfileRegistryController = provider.resolve(
      BootstrapTokens.AiAccountabilityProfileRegistryController,
    );
    const aiTrustProfileRegistryController = provider.resolve(
      BootstrapTokens.AiTrustProfileRegistryController,
    );
    const aiComplianceRuleRegistryController = provider.resolve(
      BootstrapTokens.AiComplianceRuleRegistryController,
    );
    const aiGovernancePolicyRegistryController = provider.resolve(
      BootstrapTokens.AiGovernancePolicyRegistryController,
    );
    const aiRiskRuleRegistryController = provider.resolve(
      BootstrapTokens.AiRiskRuleRegistryController,
    );

    const apiServer = new ApiServer({ logger });
    apiServer
      .registerMiddlewares(createDefaultMiddlewares(logger))
      .registerRoutes([
        ...createProductRoutes(productController),
        ...createSellerRoutes(sellerController),
        ...createCatalogRoutes(catalogController),
        ...createOrderManagementRoutes(orderManagementController),
        ...createPaymentManagementRoutes(paymentManagementController),
        ...createDeliveryManagementRoutes(deliveryManagementController),
        ...createWarehouseManagementRoutes(warehouseManagementController),
        ...createNotificationManagementRoutes(notificationManagementController),
        ...createAnalyticsManagementRoutes(analyticsManagementController),
        ...createWorkflowOrchestrationRoutes(workflowOrchestrationController),
        ...createAuditManagementRoutes(auditManagementController),
        ...createAuthorizationManagementRoutes(authorizationManagementController),
        ...createAuthenticationManagementRoutes(authenticationManagementController),
        ...createIdempotencyManagementRoutes(idempotencyManagementController),
        ...createConfigurationManagementRoutes(configurationManagementController),
        ...createSchedulingManagementRoutes(schedulingManagementController),
        ...createHealthMonitoringManagementRoutes(healthMonitoringManagementController),
        ...createLoggingManagementRoutes(loggingManagementController),
        ...createMetricsManagementRoutes(metricsManagementController),
        ...createSecretsManagementRoutes(secretsManagementController),
        ...createEventBusManagementRoutes(eventBusManagementController),
        ...createPluginManagementRoutes(pluginManagementController),
        ...createFeatureFlagManagementRoutes(featureFlagManagementController),
        ...createRateLimitingManagementRoutes(rateLimitingManagementController),
        ...createCacheManagementRoutes(cacheManagementController),
        ...createAiAgentGatewayRoutes(aiAgentGatewayController),
        ...createAiToolRegistryRoutes(aiToolRegistryController),
        ...createAiCapabilityDiscoveryRoutes(aiCapabilityDiscoveryController),
        ...createAiActionSecurityRoutes(aiActionSecurityController),
        ...createMcpServerRoutes(mcpServerController),
        ...createAiSemanticApiRoutes(aiSemanticApiController),
        ...createAiCatalogMetadataRoutes(aiCatalogMetadataController),
        ...createAiAgentSdkRoutes(aiAgentSdkController),
        ...createAiAgentSandboxRoutes(aiAgentSandboxController),
        ...createAiAgentMonitoringRoutes(aiAgentMonitoringController),
        ...createAiKnowledgeRegistryRoutes(aiKnowledgeRegistryController),
        ...createAiMemoryManagementRoutes(aiMemoryManagementController),
        ...createAiPromptRegistryRoutes(aiPromptRegistryController),
        ...createAiConversationManagementRoutes(aiConversationManagementController),
        ...createAiSessionManagementRoutes(aiSessionManagementController),
        ...createAiContextManagementRoutes(aiContextManagementController),
        ...createAiModelRegistryRoutes(aiModelRegistryController),
        ...createAiProviderRegistryRoutes(aiProviderRegistryController),
        ...createAiCapabilityRegistryRoutes(aiCapabilityRegistryController),
        ...createAiWorkflowRegistryRoutes(aiWorkflowRegistryController),
        ...createAiPolicyRegistryRoutes(aiPolicyRegistryController),
        ...createAiResourceRegistryRoutes(aiResourceRegistryController),
        ...createAiTemplateRegistryRoutes(aiTemplateRegistryController),
        ...createAiProfileRegistryRoutes(aiProfileRegistryController),
        ...createAiPersonaRegistryRoutes(aiPersonaRegistryController),
        ...createAiSkillRegistryRoutes(aiSkillRegistryController),
        ...createAiStrategyRegistryRoutes(aiStrategyRegistryController),
        ...createAiActionRegistryRoutes(aiActionRegistryController),
        ...createAiCommandRegistryRoutes(aiCommandRegistryController),
        ...createAiWorkflowTemplateRegistryRoutes(aiWorkflowTemplateRegistryController),
        ...createAiDatasetRegistryRoutes(aiDatasetRegistryController),
        ...createAiKnowledgeSourceRegistryRoutes(aiKnowledgeSourceRegistryController),
        ...createAiKnowledgePackageRegistryRoutes(aiKnowledgePackageRegistryController),
        ...createAiEvaluationRegistryRoutes(aiEvaluationRegistryController),
        ...createAiBenchmarkRegistryRoutes(aiBenchmarkRegistryController),
        ...createAiExperimentRegistryRoutes(aiExperimentRegistryController),
        ...createAiScenarioRegistryRoutes(aiScenarioRegistryController),
        ...createAiDatasetVersionRegistryRoutes(aiDatasetVersionRegistryController),
        ...createAiKnowledgeGraphRegistryRoutes(aiKnowledgeGraphRegistryController),
        ...createAiOntologyRegistryRoutes(aiOntologyRegistryController),
        ...createAiTaxonomyRegistryRoutes(aiTaxonomyRegistryController),
        ...createAiVocabularyRegistryRoutes(aiVocabularyRegistryController),
        ...createAiConceptRegistryRoutes(aiConceptRegistryController),
        ...createAiEntityRegistryRoutes(aiEntityRegistryController),
        ...createAiRelationRegistryRoutes(aiRelationRegistryController),
        ...createAiGraphRegistryRoutes(aiGraphRegistryController),
        ...createAiSchemaRegistryRoutes(aiSchemaRegistryController),
        ...createAiConstraintRegistryRoutes(aiConstraintRegistryController),
        ...createAiRuleRegistryRoutes(aiRuleRegistryController),
        ...createAiPolicySetRegistryRoutes(aiPolicySetRegistryController),
        ...createAiValidationProfileRegistryRoutes(aiValidationProfileRegistryController),
        ...createAiExecutionProfileRegistryRoutes(aiExecutionProfileRegistryController),
        ...createAiRuntimeProfileRegistryRoutes(aiRuntimeProfileRegistryController),
        ...createAiEnvironmentProfileRegistryRoutes(aiEnvironmentProfileRegistryController),
        ...createAiDeploymentProfileRegistryRoutes(aiDeploymentProfileRegistryController),
        ...createAiExecutionEnvironmentRegistryRoutes(aiExecutionEnvironmentRegistryController),
        ...createAiResourcePoolRegistryRoutes(aiResourcePoolRegistryController),
        ...createAiInfrastructureProfileRegistryRoutes(aiInfrastructureProfileRegistryController),
        ...createAiComputeProfileRegistryRoutes(aiComputeProfileRegistryController),
        ...createAiHardwareProfileRegistryRoutes(aiHardwareProfileRegistryController),
        ...createAiAcceleratorProfileRegistryRoutes(aiAcceleratorProfileRegistryController),
        ...createAiMemoryProfileRegistryRoutes(aiMemoryProfileRegistryController),
        ...createAiStorageProfileRegistryRoutes(aiStorageProfileRegistryController),
        ...createAiNetworkProfileRegistryRoutes(aiNetworkProfileRegistryController),
        ...createAiSecurityProfileRegistryRoutes(aiSecurityProfileRegistryController),
        ...createAiClusterProfileRegistryRoutes(aiClusterProfileRegistryController),
        ...createAiNodeProfileRegistryRoutes(aiNodeProfileRegistryController),
        ...createAiServiceProfileRegistryRoutes(aiServiceProfileRegistryController),
        ...createAiResourceProfileRegistryRoutes(aiResourceProfileRegistryController),
        ...createAiCapabilityProfileRegistryRoutes(aiCapabilityProfileRegistryController),
        ...createAiPolicyProfileRegistryRoutes(aiPolicyProfileRegistryController),
        ...createAiComplianceProfileRegistryRoutes(aiComplianceProfileRegistryController),
        ...createAiGovernanceProfileRegistryRoutes(aiGovernanceProfileRegistryController),
        ...createAiAuditProfileRegistryRoutes(aiAuditProfileRegistryController),
        ...createAiRiskProfileRegistryRoutes(aiRiskProfileRegistryController),
        ...createAiReliabilityProfileRegistryRoutes(aiReliabilityProfileRegistryController),
        ...createAiSafetyProfileRegistryRoutes(aiSafetyProfileRegistryController),
        ...createAiPrivacyProfileRegistryRoutes(aiPrivacyProfileRegistryController),
        ...createAiEthicsProfileRegistryRoutes(aiEthicsProfileRegistryController),
        ...createAiTransparencyProfileRegistryRoutes(aiTransparencyProfileRegistryController),
        ...createAiExplainabilityProfileRegistryRoutes(aiExplainabilityProfileRegistryController),
        ...createAiFairnessProfileRegistryRoutes(aiFairnessProfileRegistryController),
        ...createAiAccountabilityProfileRegistryRoutes(aiAccountabilityProfileRegistryController),
        ...createAiTrustProfileRegistryRoutes(aiTrustProfileRegistryController),
        ...createAiComplianceRuleRegistryRoutes(aiComplianceRuleRegistryController),
        ...createAiGovernancePolicyRegistryRoutes(aiGovernancePolicyRegistryController),
        ...createAiRiskRuleRegistryRoutes(aiRiskRuleRegistryController),
        ...createOrderRoutes(orderController),
        ...createOrderLifecycleRoutes(orderLifecycleController),
        ...createSellerProductRoutes(sellerProductController),
        ...createCustomerManagementRoutes(customerManagementController),
        ...createCatalogManagementRoutes(catalogManagementController),
        ...createSearchManagementRoutes(searchManagementController),
        ...createFavoritesManagementRoutes(favoritesManagementController),
        ...createCartManagementRoutes(cartManagementController),
        ...createCheckoutManagementRoutes(checkoutManagementController),
        ...createPurchaseRoutes(purchaseController),
        ...resolveIntegrationRoutes(provider),
        ...resolveMarketplaceModulesRoutes(provider),
      ]);

    return apiServer;
  });
}
