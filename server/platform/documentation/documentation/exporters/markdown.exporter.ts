import type { IDocumentationExporter } from "@server/platform/documentation/documentation/contracts";
import type {
  ArchitectureSnapshot,
  DocumentationBundle,
} from "@server/platform/documentation/documentation/models";

/** Exports documentation as Markdown. */
export class MarkdownExporter implements IDocumentationExporter<string> {
  export(documentation: DocumentationBundle): string {
    const lines: string[] = [
      "# Architecture Summary",
      "",
      `- Generated at: ${documentation.summary.generatedAt}`,
      `- Modules: ${documentation.summary.moduleCount}`,
      `- Platforms: ${documentation.summary.platformCount}`,
      `- Providers: ${documentation.summary.providerCount}`,
      `- Dependencies: ${documentation.summary.dependencyCount}`,
      "",
      "## Module Catalog",
      "",
    ];

    for (const entry of documentation.moduleCatalog.entries) {
      lines.push(`### ${entry.module.name} (${entry.module.id})`);
      lines.push(`- Registered: ${entry.registered ? "yes" : "no"}`);
      lines.push(`- Public API: ${entry.module.publicMethods.join(", ")}`);
      lines.push("");
    }

    lines.push("## Platform Catalog", "");
    for (const platform of documentation.platformCatalog.platforms) {
      lines.push(`### ${platform.name}`);
      lines.push(`- Path: ${platform.path}`);
      lines.push(`- Components: ${platform.components.join(", ")}`);
      lines.push("");
    }

    lines.push("## Provider Catalog", "");
    for (const provider of documentation.providerCatalog.providers) {
      lines.push(
        `- ${provider.name} (${provider.capability}/${provider.vendor}) via ${provider.adapter}`,
      );
    }

    lines.push("", "## Dependency Graph", "");
    for (const edge of documentation.dependencyGraph.edges) {
      lines.push(`- ${edge.from} -> ${edge.to} (${edge.kind})`);
    }

    return lines.join("\n");
  }

  exportSnapshot(snapshot: ArchitectureSnapshot): string {
    return [
      `# Architecture Snapshot ${snapshot.id}`,
      "",
      `- Captured at: ${snapshot.capturedAt}`,
      `- Validation: ${snapshot.validation.valid ? "valid" : "invalid"}`,
      "",
      this.export(snapshot.documentation),
    ].join("\n");
  }
}
