/**
 * Plugin Management — plugin registration and lifecycle only.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IPluginInstaller } from "@server/application/plugin-management/contracts/plugin-installer.contract";
import type { IPluginLifecycleManager } from "@server/application/plugin-management/contracts/plugin-lifecycle-manager.contract";
import type { IPluginLoader } from "@server/application/plugin-management/contracts/plugin-loader.contract";
import type { IPluginRepository } from "@server/application/plugin-management/contracts/plugin-repository.contract";
import type { IPluginValidator } from "@server/application/plugin-management/contracts/plugin-validator.contract";
import {
  createPluginDefinition,
  toPluginStatus,
  type InstallPluginInput,
  type ListPluginsResult,
  type PluginDefinition,
  type PluginStatus,
  type RegisterPluginInput,
} from "@server/application/plugin-management/models/plugin.model";
import type { IIdGenerator } from "@server/application/ports";

export class PluginManagementService {
  constructor(
    private readonly pluginRepository: IPluginRepository,
    private readonly pluginInstaller: IPluginInstaller,
    private readonly pluginLoader: IPluginLoader,
    private readonly pluginValidator: IPluginValidator,
    private readonly lifecycleManager: IPluginLifecycleManager,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerPlugin(input: RegisterPluginInput): Promise<PluginDefinition> {
    this.pluginValidator.validateRegistration(input);

    const plugin = createPluginDefinition({
      pluginId: this.idGenerator.generate(),
      name: input.name,
      version: input.version,
      description: input.description,
      source: input.source,
      status: "registered",
    });

    await this.pluginRepository.save(plugin);
    return plugin;
  }

  async installPlugin(input: InstallPluginInput): Promise<PluginDefinition> {
    const pluginId = input.pluginId.trim();
    const existing = await this.pluginRepository.findById(pluginId);
    if (!existing) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    this.pluginValidator.validateInstall(existing, input);
    const installed = await this.pluginInstaller.install(existing);
    await this.pluginLoader.load(installed);

    const updated = createPluginDefinition({
      ...installed,
      status: "installed",
      updatedAt: new Date().toISOString(),
    });

    await this.pluginRepository.save(updated);
    return updated;
  }

  async uninstallPlugin(pluginId: string): Promise<{ pluginId: string; uninstalled: boolean }> {
    const normalizedPluginId = pluginId.trim();
    const existing = await this.pluginRepository.findById(normalizedPluginId);
    if (!existing) {
      throw new Error(`Plugin not found: ${normalizedPluginId}`);
    }

    this.pluginValidator.validateUninstall(existing);
    await this.pluginLoader.unload(normalizedPluginId);
    await this.pluginInstaller.uninstall(normalizedPluginId);
    await this.pluginRepository.delete(normalizedPluginId);

    return Object.freeze({ pluginId: normalizedPluginId, uninstalled: true });
  }

  async enablePlugin(pluginId: string): Promise<PluginDefinition> {
    const normalizedPluginId = pluginId.trim();
    const existing = await this.pluginRepository.findById(normalizedPluginId);
    if (!existing) {
      throw new Error(`Plugin not found: ${normalizedPluginId}`);
    }

    this.pluginValidator.validateEnable(existing);
    const enabled = await this.lifecycleManager.enable(existing);
    await this.pluginRepository.save(enabled);
    return enabled;
  }

  async disablePlugin(pluginId: string): Promise<PluginDefinition> {
    const normalizedPluginId = pluginId.trim();
    const existing = await this.pluginRepository.findById(normalizedPluginId);
    if (!existing) {
      throw new Error(`Plugin not found: ${normalizedPluginId}`);
    }

    this.pluginValidator.validateDisable(existing);
    const disabled = await this.lifecycleManager.disable(existing);
    await this.pluginRepository.save(disabled);
    return disabled;
  }

  async getPlugin(pluginId: string): Promise<PluginDefinition | null> {
    return this.pluginRepository.findById(pluginId.trim());
  }

  async listPlugins(): Promise<ListPluginsResult> {
    const plugins = Object.freeze(
      [...(await this.pluginRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );

    return Object.freeze({
      plugins,
      total: plugins.length,
    });
  }

  async getPluginStatus(pluginId: string): Promise<PluginStatus> {
    const plugin = await this.pluginRepository.findById(pluginId.trim());
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId.trim()}`);
    }

    return toPluginStatus(plugin);
  }
}
