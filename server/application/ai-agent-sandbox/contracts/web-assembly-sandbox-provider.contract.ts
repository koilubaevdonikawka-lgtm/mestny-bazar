import type { SandboxSession } from "@server/application/ai-agent-sandbox/models/sandbox.model";

/** Future integration point for WebAssembly runtime sandboxes. Not wired yet. */
export interface IWebAssemblySandboxProvider {
  compileModule(wasmBytes: Uint8Array): Promise<{ moduleId: string }>;
  instantiate(moduleId: string, session: SandboxSession): Promise<void>;
}
